<?php
require_once '../api/config.php';

try {
    echo "Creating profile_posts table...\n";
    
    // Create profile_posts table
    $sql = "CREATE TABLE IF NOT EXISTS profile_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
    )";
    
    $pdo->exec($sql);
    echo "✓ profile_posts table created successfully\n";
    
    // Check if table has data
    $stmt = $pdo->query("SELECT COUNT(*) FROM profile_posts");
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        echo "\nInserting sample data from image files...\n";
        
        // Get image files from profile_posts directory
        $imageDir = 'profile_posts/';
        $images = glob($imageDir . '*.{jpg,jpeg,png,gif}', GLOB_BRACE);
        
        if (empty($images)) {
            echo "No image files found in profile_posts directory\n";
        } else {
            foreach ($images as $imagePath) {
                // Remove the profile_posts/ prefix for the database
                $imageUrl = str_replace('profile_posts/', 'posts/profile_posts/', $imagePath);
                
                $stmt = $pdo->prepare("INSERT INTO profile_posts (user_id, image_url, caption) VALUES (?, ?, ?)");
                $stmt->execute([1, $imageUrl, 'A cute cat photo']);
                
                echo "✓ Added: $imageUrl\n";
            }
        }
    } else {
        echo "Table already has $count records\n";
    }
    
    // Show final data
    echo "\nFinal data in profile_posts:\n";
    echo "============================\n";
    $stmt = $pdo->query("SELECT * FROM profile_posts ORDER BY created_at DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($posts as $post) {
        echo "ID: {$post['id']}, User: {$post['user_id']}, Image: {$post['image_url']}\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>