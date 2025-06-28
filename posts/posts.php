<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../api/config.php';

// Get current user (you'll need to implement proper authentication)
function getCurrentUserId() {
    // For development, return user ID 1
    // In production, get from session/JWT token
    return 1;
}

// Handle different actions
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get':
        getPost();
        break;
    case 'get_user_posts':
        getUserPosts();
        break;
    case 'get_comments':
        getComments();
        break;
    case 'like':
        likePost();
        break;
    case 'unlike':
        unlikePost();
        break;
    case 'add_comment':
        addComment();
        break;
    case 'like_comment':
        likeComment();
        break;
    case 'unlike_comment':
        unlikeComment();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// Get single post
function getPost() {
    global $pdo;
    
    $postId = $_GET['id'] ?? null;
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $stmt = $pdo->prepare("
            SELECT p.*, u.username, pr.profile_picture,
                   EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) as user_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN profiles pr ON u.id = pr.user_id
            WHERE p.id = ? AND p.is_deleted = FALSE
        ");
        
        $stmt->execute([$currentUserId, $postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            echo json_encode(['success' => false, 'message' => 'Post not found']);
            return;
        }
        
        // Convert user_liked to boolean
        $post['user_liked'] = (bool)$post['user_liked'];
        
        // Format media URL
        if ($post['media_url'] && !str_starts_with($post['media_url'], 'http')) {
            $post['media_url'] = '/' . $post['media_url'];
        }
        
        // Format profile picture
        if ($post['profile_picture'] && !str_starts_with($post['profile_picture'], 'http')) {
            $post['profile_picture'] = '/' . $post['profile_picture'];
        }
        
        echo json_encode(['success' => true, 'post' => $post]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Get comments for a post
function getComments() {
    global $pdo;
    
    $postId = $_GET['post_id'] ?? null;
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $stmt = $pdo->prepare("
            SELECT c.*, u.username, pr.profile_picture,
                   EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as user_liked
            FROM comments c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN profiles pr ON u.id = pr.user_id
            WHERE c.post_id = ? AND c.is_deleted = FALSE AND c.parent_comment_id IS NULL
            ORDER BY c.created_at ASC
        ");
        
        $stmt->execute([$currentUserId, $postId]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format profile pictures and convert user_liked to boolean
        foreach ($comments as &$comment) {
            $comment['user_liked'] = (bool)$comment['user_liked'];
            if ($comment['profile_picture'] && !str_starts_with($comment['profile_picture'], 'http')) {
                $comment['profile_picture'] = '/' . $comment['profile_picture'];
            }
        }
        
        echo json_encode(['success' => true, 'comments' => $comments]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Get posts by user ID
function getUserPosts() {
    global $pdo;
    
    $userId = $_GET['user_id'] ?? null;
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $stmt = $pdo->prepare("
            SELECT p.*, u.username, NULL as profile_picture, FALSE as user_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ? AND p.is_deleted = FALSE
            ORDER BY p.created_at DESC
        ");
        
        $stmt->execute([$userId]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug: log the SQL and parameters
        error_log("getUserPosts SQL executed with userId: $userId");
        error_log("Found posts count: " . count($posts));
        
        // Format media URLs and profile pictures
        foreach ($posts as &$post) {
            $post['user_liked'] = (bool)$post['user_liked'];
            
            if ($post['media_url'] && !str_starts_with($post['media_url'], 'http')) {
                $post['media_url'] = '/' . $post['media_url'];
            }
            
            if ($post['profile_picture'] && !str_starts_with($post['profile_picture'], 'http')) {
                $post['profile_picture'] = '/' . $post['profile_picture'];
            }
        }
        
        echo json_encode(['success' => true, 'posts' => $posts]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Like a post
function likePost() {
    global $pdo;
    
    $postId = $_POST['post_id'] ?? null;
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $pdo->beginTransaction();
        
        // Check if already liked
        $stmt = $pdo->prepare("SELECT id FROM likes WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$postId, $currentUserId]);
        
        if ($stmt->fetch()) {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Post already liked']);
            return;
        }
        
        // Add like
        $stmt = $pdo->prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)");
        $stmt->execute([$postId, $currentUserId]);
        
        // Get updated like count
        $stmt = $pdo->prepare("SELECT like_count FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $likeCount = $stmt->fetchColumn();
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'like_count' => (int)$likeCount]);
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Unlike a post
function unlikePost() {
    global $pdo;
    
    $postId = $_POST['post_id'] ?? null;
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $pdo->beginTransaction();
        
        // Remove like
        $stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$postId, $currentUserId]);
        
        if ($stmt->rowCount() === 0) {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Like not found']);
            return;
        }
        
        // Get updated like count
        $stmt = $pdo->prepare("SELECT like_count FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $likeCount = $stmt->fetchColumn();
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'like_count' => (int)$likeCount]);
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Add a comment
function addComment() {
    global $pdo;
    
    $postId = $_POST['post_id'] ?? null;
    $commentText = trim($_POST['comment'] ?? '');
    
    if (!$postId || !$commentText) {
        echo json_encode(['success' => false, 'message' => 'Post ID and comment text required']);
        return;
    }
    
    if (strlen($commentText) > 500) {
        echo json_encode(['success' => false, 'message' => 'Comment too long (max 500 characters)']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $pdo->beginTransaction();
        
        // Check if post exists
        $stmt = $pdo->prepare("SELECT id FROM posts WHERE id = ? AND is_deleted = FALSE");
        $stmt->execute([$postId]);
        
        if (!$stmt->fetch()) {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Post not found']);
            return;
        }
        
        // Add comment
        $stmt = $pdo->prepare("
            INSERT INTO comments (post_id, user_id, comment_text) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$postId, $currentUserId, $commentText]);
        
        $commentId = $pdo->lastInsertId();
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'comment_id' => $commentId]);
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Like a comment
function likeComment() {
    global $pdo;
    
    $commentId = $_POST['comment_id'] ?? null;
    if (!$commentId) {
        echo json_encode(['success' => false, 'message' => 'Comment ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $pdo->beginTransaction();
        
        // Check if already liked
        $stmt = $pdo->prepare("SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?");
        $stmt->execute([$commentId, $currentUserId]);
        
        if ($stmt->fetch()) {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Comment already liked']);
            return;
        }
        
        // Add like
        $stmt = $pdo->prepare("INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)");
        $stmt->execute([$commentId, $currentUserId]);
        
        // Get updated like count
        $stmt = $pdo->prepare("SELECT like_count FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $likeCount = $stmt->fetchColumn();
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'like_count' => (int)$likeCount]);
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// Unlike a comment
function unlikeComment() {
    global $pdo;
    
    $commentId = $_POST['comment_id'] ?? null;
    if (!$commentId) {
        echo json_encode(['success' => false, 'message' => 'Comment ID required']);
        return;
    }
    
    $currentUserId = getCurrentUserId();
    
    try {
        $pdo->beginTransaction();
        
        // Remove like
        $stmt = $pdo->prepare("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?");
        $stmt->execute([$commentId, $currentUserId]);
        
        if ($stmt->rowCount() === 0) {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Comment like not found']);
            return;
        }
        
        // Get updated like count
        $stmt = $pdo->prepare("SELECT like_count FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $likeCount = $stmt->fetchColumn();
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'like_count' => (int)$likeCount]);
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>