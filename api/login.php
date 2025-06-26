<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['emailOrUsername']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email/username and password are required']);
    exit();
}

$emailOrUsername = trim($input['emailOrUsername']);
$password = $input['password'];

try {
    // Find user by email or username
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.email, u.password_hash, u.is_verified, u.is_active,
               p.display_name, p.bio, p.profile_picture_url
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.email = ? OR u.username = ?
    ");
    $stmt->execute([$emailOrUsername, $emailOrUsername]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit();
    }

    // Check if account is active
    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Account is disabled']);
        exit();
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit();
    }

    // Generate simple session token (in production, use JWT or proper session management)
    $token = bin2hex(random_bytes(32));
    
    // Store session in database (optional - for tracking active sessions)
    $stmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, token, expires_at, created_at) 
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())
        ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = VALUES(created_at)
    ");
    $stmt->execute([$user['id'], $token]);

    // Update last login
    $stmt = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Return success with user data
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'display_name' => $user['display_name'] ?: $user['username'],
            'bio' => $user['bio'],
            'profile_picture' => $user['profile_picture_url'],
            'is_verified' => (bool)$user['is_verified']
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
}
?>