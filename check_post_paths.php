<?php
require_once 'api/config.php';

try {
    // Check current image paths in database
    $stmt = $pdo->query("SELECT id, image_url FROM profile_posts ORDER BY id");
    $posts = $stmt->fetchAll();
    
    echo "Current post image paths:\n";
    foreach ($posts as $post) {
        echo "ID: {$post['id']}, Path: {$post['image_url']}\n";
    }
    
    // Update old paths to new paths
    $stmt = $pdo->prepare("UPDATE profile_posts SET image_url = REPLACE(image_url, 'posts/uploads/', 'posts/profile_posts/') WHERE image_url LIKE '%posts/uploads/%'");
    $stmt->execute();
    $updated = $stmt->rowCount();
    
    echo "\nUpdated $updated paths.\n";
    
    // Show updated paths
    $stmt = $pdo->query("SELECT id, image_url FROM profile_posts ORDER BY id");
    $posts = $stmt->fetchAll();
    
    echo "\nUpdated post image paths:\n";
    foreach ($posts as $post) {
        echo "ID: {$post['id']}, Path: {$post['image_url']}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>