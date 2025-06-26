<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

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
    // Delete the session token
    $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE token = ?");
    $stmt->execute([$token]);

    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Logout failed: ' . $e->getMessage()]);
}
?>