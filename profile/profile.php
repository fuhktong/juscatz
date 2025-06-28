<?php
require_once '../api/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle profile picture upload/update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // For testing, just use user ID 1
        $userId = 1;
        
        // Handle file upload
        if (!isset($_FILES['profile_picture'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }
        
        $file = $_FILES['profile_picture'];
        
        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP allowed']);
            exit;
        }
        
        if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
            http_response_code(400);
            echo json_encode(['error' => 'File too large. Maximum 5MB allowed']);
            exit;
        }
        
        // Create uploads directory if it doesn't exist
        $uploadDir = 'profile_pictures/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = $userId . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload file']);
            exit;
        }
        
        $profilePictureUrl = 'profile/profile_pictures/' . $filename;
        
        // Insert or update profile
        $stmt = $pdo->prepare("INSERT INTO profiles (user_id, profile_picture) VALUES (?, ?) ON DUPLICATE KEY UPDATE profile_picture = ?, updated_at = NOW()");
        $stmt->execute([$userId, $profilePictureUrl, $profilePictureUrl]);
        
        echo json_encode([
            'success' => true,
            'profile_picture' => $profilePictureUrl,
            'message' => 'Profile picture updated successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

// Get profile data  
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get') {
    try {
        $userId = 1; // Use test user for now
        
        $stmt = $pdo->prepare("
            SELECT u.username, u.first_name, u.last_name, u.email,
                   p.display_name, p.bio, p.website, p.location, p.is_private, p.profile_picture
            FROM users u 
            LEFT JOIN profiles p ON u.id = p.user_id 
            WHERE u.id = ?
        ");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();
        
        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        echo json_encode([
            'success' => true,
            'profile' => $profile
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
        error_log('Profile API error: ' . $e->getMessage());
    }
}
?>