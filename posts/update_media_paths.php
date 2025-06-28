<?php
require_once '../api/config.php';

try {
    echo "Updating media paths to use posts/posts-pics/...\n";
    
    // Update all media URLs to use new path
    $stmt = $pdo->prepare("
        UPDATE posts 
        SET media_url = REPLACE(media_url, 'posts/profile_posts/', 'posts/posts-pics/')
        WHERE media_url LIKE 'posts/profile_posts/%'
    ");
    
    $stmt->execute();
    $updatedRows = $stmt->rowCount();
    
    echo "✓ Updated $updatedRows rows\n";
    
    // Show updated data
    echo "\nUpdated posts:\n";
    echo "==============\n";
    $stmt = $pdo->query("SELECT id, media_url FROM posts ORDER BY id");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($posts as $post) {
        echo "ID: {$post['id']}, Media: {$post['media_url']}\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>