<?php
require_once '../api/config.php';

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        createPost();
        break;
    case 'GET':
        getPosts();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Create new post
function createPost() {
    global $pdo;
    
    try {
        // For testing, just use user ID 1
        $userId = 1;

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

        // Create posts-pics directory if it doesn't exist
        $uploadDir = '../posts/posts-pics/';
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

        // Determine media type
        $mediaType = str_starts_with($file['type'], 'image/') ? 'image' : 'video';
        
        // Insert post into database
        $stmt = $pdo->prepare("
            INSERT INTO posts (user_id, caption, media_url, media_type, like_count, comment_count, share_count) 
            VALUES (?, ?, ?, ?, 0, 0, 0)
        ");
        
        $mediaUrl = 'posts/posts-pics/' . $filename;
        $stmt->execute([$userId, $caption, $mediaUrl, $mediaType]);

        $postId = $pdo->lastInsertId();

        // Return success
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Post created successfully',
            'post' => [
                'id' => $postId,
                'caption' => $caption,
                'media_url' => $mediaUrl,
                'media_type' => $mediaType,
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

// Get posts for profile
function getPosts() {
    global $pdo;
    
    try {
        $userId = $_GET['user_id'] ?? 1;
        
        // Get user's posts
        $stmt = $pdo->prepare("
            SELECT id, media_url, caption, media_type, created_at
            FROM posts 
            WHERE user_id = ? AND is_deleted = FALSE
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
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
?>