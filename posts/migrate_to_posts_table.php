<?php
require_once '../api/config.php';

try {
    // Check current posts
    $stmt = $pdo->query("SELECT COUNT(*) FROM posts WHERE is_deleted = FALSE");
    $postsCount = $stmt->fetchColumn();
    echo "Current posts in posts table: $postsCount\n";
    
    if ($postsCount == 0) {
        echo "\nPopulating posts table with images from posts-pics folder...\n";
        
        // Get all image files
        $imageDir = 'posts-pics/';
        $images = glob($imageDir . '*.{jpg,jpeg,png,gif}', GLOB_BRACE);
        
        foreach ($images as $imagePath) {
            // Create media_url path
            $mediaUrl = 'posts/' . $imagePath;
            
            // Insert into posts table
            $stmt = $pdo->prepare("
                INSERT INTO posts (user_id, caption, media_url, media_type, like_count, comment_count, share_count) 
                VALUES (?, ?, ?, ?, 0, 0, 0)
            ");
            
            $caption = "A cute cat photo";
            $mediaType = 'image';
            
            $stmt->execute([1, $caption, $mediaUrl, $mediaType]);
            echo "✓ Added: $mediaUrl\n";
        }
    }
    
    // Show final data
    echo "\nFinal posts in posts table:\n";
    echo "===========================\n";
    $stmt = $pdo->query("SELECT id, user_id, media_url, created_at FROM posts WHERE is_deleted = FALSE ORDER BY created_at DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($posts as $post) {
        echo "ID: {$post['id']}, User: {$post['user_id']}, Media: {$post['media_url']}, Created: {$post['created_at']}\n";
    }
    
    echo "\nTotal posts: " . count($posts) . "\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>