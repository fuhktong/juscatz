<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get') {
    // Return default privacy settings for now
    echo json_encode([
        'success' => true,
        'settings' => [
            'private_account' => false,
            'who_can_see_photos' => 'followers',
            'who_can_see_posts' => 'followers', 
            'who_can_message' => 'followers',
            'who_can_comment' => 'everyone',
            'allow_mentions' => true,
            'show_activity' => true,
            'show_online_status' => false,
            'searchable_by_email' => true,
            'searchable_by_phone' => false,
            'suggest_to_friends' => true,
            'save_login_info' => true,
            'use_data_for_ads' => false
        ]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // For now, just return success - you can implement actual privacy settings storage later
    echo json_encode([
        'success' => true,
        'message' => 'Privacy settings updated successfully'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>