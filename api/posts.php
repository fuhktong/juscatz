<?php
require_once 'config.php';

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        createPost();
        break;
    case 'GET':
        getPosts();
        break;
    case 'PUT':
        updatePost();
        break;
    case 'DELETE':
        deletePost();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Create new post
function createPost() {
    global $pdo;
    
    // Get authorization header
    $headers = getallheaders();
    $token = null;

    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            $token = $matches[1];
        }
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No authorization token provided']);
        exit();
    }

    try {
        // Verify token and get user
        $stmt = $pdo->prepare("
            SELECT u.id, u.username 
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit();
        }

        // Check if file was uploaded
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded or upload error']);
            exit();
        }

        $file = $_FILES['file'];
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, AVI) are allowed.']);
            exit();
        }

        // Validate file size (10MB)
        if ($file['size'] > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File size must be less than 10MB']);
            exit();
        }

        // Create uploads directory if it doesn't exist
        $uploadDir = '../uploads/posts/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save uploaded file']);
            exit();
        }

        // Get post data
        $caption = isset($_POST['caption']) ? trim($_POST['caption']) : '';
        $location = isset($_POST['location']) ? trim($_POST['location']) : null;
        $allowComments = isset($_POST['allow_comments']) ? (bool)$_POST['allow_comments'] : true;
        $showInFeed = isset($_POST['show_in_feed']) ? (bool)$_POST['show_in_feed'] : true;

        // Get image/video dimensions (optional)
        $width = null;
        $height = null;
        if (strpos($file['type'], 'image/') === 0) {
            $imageInfo = getimagesize($filepath);
            if ($imageInfo) {
                $width = $imageInfo[0];
                $height = $imageInfo[1];
            }
        }

        // Insert post into database
        $stmt = $pdo->prepare("
            INSERT INTO posts (user_id, caption, image_url, image_width, image_height, 
                             location, allow_comments, is_public, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        
        $imageUrl = 'uploads/posts/' . $filename;
        $stmt->execute([
            $user['id'], 
            $caption, 
            $imageUrl, 
            $width, 
            $height, 
            $location, 
            $allowComments, 
            $showInFeed
        ]);

        $postId = $pdo->lastInsertId();

        // Update user's post count
        $stmt = $pdo->prepare("UPDATE user_profiles SET post_count = post_count + 1 WHERE user_id = ?");
        $stmt->execute([$user['id']]);

        // Process hashtags from caption
        if (!empty($caption)) {
            processHashtags($pdo, $postId, $caption);
        }

        // Return success
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Post created successfully',
            'post' => [
                'id' => $postId,
                'caption' => $caption,
                'image_url' => $imageUrl,
                'location' => $location,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

// Process hashtags from caption
function processHashtags($pdo, $postId, $caption) {
    // Extract hashtags from caption
    preg_match_all('/#([a-zA-Z0-9_]+)/', $caption, $matches);
    $hashtags = array_unique($matches[1]);

    foreach ($hashtags as $hashtag) {
        try {
            // Insert or get hashtag
            $stmt = $pdo->prepare("
                INSERT INTO hashtags (name, created_at) 
                VALUES (?, NOW()) 
                ON DUPLICATE KEY UPDATE post_count = post_count + 1
            ");
            $stmt->execute([strtolower($hashtag)]);

            $stmt = $pdo->prepare("SELECT id FROM hashtags WHERE name = ?");
            $stmt->execute([strtolower($hashtag)]);
            $hashtagId = $stmt->fetchColumn();

            // Link hashtag to post
            $stmt = $pdo->prepare("
                INSERT INTO post_hashtags (post_id, hashtag_id, created_at) 
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$postId, $hashtagId]);

        } catch(PDOException $e) {
            // Continue processing other hashtags if one fails
            error_log("Failed to process hashtag '$hashtag': " . $e->getMessage());
        }
    }
}

// Get posts (for feed)
function getPosts() {
    global $pdo;
    
    try {
        // Get recent posts with user info
        $stmt = $pdo->prepare("
            SELECT p.id, p.caption, p.image_url, p.location, p.like_count, p.comment_count, 
                   p.created_at, u.username, up.display_name, up.profile_picture_url
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE p.is_public = 1 AND u.is_active = 1
            ORDER BY p.created_at DESC
            LIMIT 20
        ");
        $stmt->execute();
        $posts = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'posts' => $posts
        ]);

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch posts: ' . $e->getMessage()]);
    }
}

// Update post (placeholder)
function updatePost() {
    http_response_code(501);
    echo json_encode(['error' => 'Update post not implemented yet']);
}

// Delete post (placeholder)
function deletePost() {
    http_response_code(501);
    echo json_encode(['error' => 'Delete post not implemented yet']);
}
?>