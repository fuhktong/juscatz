<?php
require_once '../api/config.php';

echo "Checking database connection and tables...\n";
echo "=====================================\n";

try {
    // Show current database
    $stmt = $pdo->query("SELECT DATABASE()");
    $database = $stmt->fetchColumn();
    echo "Connected to database: $database\n\n";
    
    // Show all tables in current database
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables in database:\n";
    echo "==================\n";
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
    // Check if profile_posts exists
    if (in_array('profile_posts', $tables)) {
        echo "\nPROFILE_POSTS table exists!\n";
        
        // Show structure
        $stmt = $pdo->query("DESCRIBE profile_posts");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\nTable structure:\n";
        foreach ($columns as $column) {
            echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
        }
        
        // Show sample data
        echo "\nSample data:\n";
        $stmt = $pdo->query("SELECT * FROM profile_posts LIMIT 3");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($posts as $post) {
            echo "ID: " . ($post['id'] ?? 'N/A') . "\n";
            echo "User ID: " . ($post['user_id'] ?? 'N/A') . "\n";
            echo "Image URL: " . ($post['image_url'] ?? 'N/A') . "\n";
            echo "---\n";
        }
    } else {
        echo "\nPROFILE_POSTS table does NOT exist!\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>