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
        SELECT u.id, u.username, u.email, u.first_name, u.last_name,
               p.profile_picture,
               (SELECT COUNT(*) FROM profile_posts WHERE user_id = u.id) as post_count
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([hash('sha256', $token)]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }


    // Return user data
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'display_name' => ($user['first_name'] || $user['last_name']) ? trim($user['first_name'] . ' ' . $user['last_name']) : $user['username'],
            'profile_picture' => $user['profile_picture'],
            'post_count' => (int)$user['post_count']
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to get user data: ' . $e->getMessage()]);
}
?>