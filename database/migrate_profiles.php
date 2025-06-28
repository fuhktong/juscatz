<?php
// Add missing columns to profiles table
require_once __DIR__ . '/../api/config.php';

try {
    echo "<h2>Migrating Profiles Table...</h2>\n";
    
    // Add missing columns to profiles table
    $migrations = [
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(50)",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT", 
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255)",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100)",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE"
    ];
    
    foreach ($migrations as $migration) {
        try {
            $pdo->exec($migration);
            echo "<p>✅ " . $migration . "</p>\n";
        } catch (PDOException $e) {
            echo "<p>⚠️ " . $migration . " - " . $e->getMessage() . "</p>\n";
        }
    }
    
    // Insert test profile data
    try {
        $stmt = $pdo->prepare("
            INSERT IGNORE INTO profiles (user_id, display_name, bio, website, location, is_private) 
            VALUES (1, 'Test User', 'This is a test bio', 'https://example.com', 'San Francisco, CA', FALSE)
        ");
        $stmt->execute();
        echo "<p>✅ Inserted test profile data</p>\n";
    } catch (PDOException $e) {
        echo "<p>⚠️ Profile insert: " . $e->getMessage() . "</p>\n";
    }
    
    echo "<h3>✅ Migration complete!</h3>\n";
    
} catch (Exception $e) {
    echo "<h3>❌ Migration failed!</h3>\n";
    echo "<p>Error: " . $e->getMessage() . "</p>\n";
}
?>