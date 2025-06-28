<?php
// Check the existing profile_posts table that the user mentioned
require_once '../api/config.php';

try {
    // Check if profile_posts table exists and show its structure
    $stmt = $pdo->query("DESCRIBE profile_posts");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "PROFILE_POSTS table structure:\n";
    echo "==============================\n";
    foreach ($columns as $column) {
        echo $column['Field'] . " (" . $column['Type'] . ") - " . $column['Null'] . " - " . $column['Key'] . " - " . $column['Default'] . "\n";
    }
    
    echo "\nData in profile_posts table:\n";
    echo "============================\n";
    $stmt = $pdo->query("SELECT * FROM profile_posts ORDER BY created_at DESC LIMIT 10");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($posts)) {
        echo "No data found in profile_posts table\n";
    } else {
        foreach ($posts as $post) {
            echo "ID: " . ($post['id'] ?? 'N/A') . "\n";
            echo "User ID: " . ($post['user_id'] ?? 'N/A') . "\n";
            echo "Image URL: " . ($post['image_url'] ?? 'N/A') . "\n";
            echo "Caption: " . ($post['caption'] ?? 'N/A') . "\n";
            echo "Created: " . ($post['created_at'] ?? 'N/A') . "\n";
            echo "---\n";
        }
    }
    
    echo "\nTotal records: " . count($posts) . "\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>