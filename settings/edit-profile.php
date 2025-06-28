<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Database connection
    require_once '../config.php';
    
    // Get POST data
    $username = trim($_POST['username'] ?? '');
    $display_name = trim($_POST['display_name'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
    $first_name = trim($_POST['first_name'] ?? '');
    $last_name = trim($_POST['last_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $website = trim($_POST['website'] ?? '');
    $location = trim($_POST['location'] ?? '');
    $is_private = ($_POST['is_private'] ?? '0') === '1';
    
    // Validation
    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username is required']);
        exit;
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Username must be 3-30 characters, letters, numbers, and underscores only']);
        exit;
    }
    
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        exit;
    }
    
    if (strlen($bio) > 150) {
        echo json_encode(['success' => false, 'message' => 'Bio must be 150 characters or less']);
        exit;
    }
    
    if (!empty($website) && !filter_var($website, FILTER_VALIDATE_URL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid website URL']);
        exit;
    }
    
    // For development, use user_id = 1
    $user_id = 1;
    
    // Check if username is already taken (by another user)
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $stmt->execute([$username, $user_id]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username is already taken']);
        exit;
    }
    
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Update users table
        $sql = "UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ? WHERE id = ?";
        $params = [$username, $first_name, $last_name, $email, $user_id];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // Check if profile exists
        $stmt = $pdo->prepare("SELECT id FROM profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $profile_exists = $stmt->fetch();
        
        if ($profile_exists) {
            // Update existing profile
            $sql = "UPDATE profiles SET display_name = ?, bio = ?, website = ?, location = ?, is_private = ? WHERE user_id = ?";
            $params = [$display_name, $bio, $website, $location, $is_private, $user_id];
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            // Create new profile
            $sql = "INSERT INTO profiles (user_id, display_name, bio, website, location, is_private) VALUES (?, ?, ?, ?, ?, ?)";
            $params = [$user_id, $display_name, $bio, $website, $location, $is_private];
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Return updated profile data
        $stmt = $pdo->prepare("
            SELECT u.username, u.first_name, u.last_name, u.email,
                   p.display_name, p.bio, p.website, p.location, p.is_private, p.profile_picture
            FROM users u 
            LEFT JOIN profiles p ON u.id = p.user_id 
            WHERE u.id = ?
        ");
        $stmt->execute([$user_id]);
        $updated_profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'profile' => $updated_profile
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Edit profile error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile: ' . $e->getMessage()
    ]);
}
?>