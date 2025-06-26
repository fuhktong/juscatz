<?php
require_once 'config.php';

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
        SELECT u.id, u.username, u.email, u.is_verified, u.is_active,
               p.display_name, p.bio, p.profile_picture_url, p.follower_count, p.following_count, p.post_count
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }

    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Account is disabled']);
        exit();
    }

    // Return user data
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'display_name' => $user['display_name'] ?: $user['username'],
            'bio' => $user['bio'],
            'profile_picture' => $user['profile_picture_url'],
            'is_verified' => (bool)$user['is_verified'],
            'follower_count' => (int)$user['follower_count'],
            'following_count' => (int)$user['following_count'],
            'post_count' => (int)$user['post_count']
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to get user data: ' . $e->getMessage()]);
}
?>