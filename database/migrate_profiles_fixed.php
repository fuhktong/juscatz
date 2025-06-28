<?php
// Add missing columns to profiles table - MySQL compatible
require_once __DIR__ . '/../api/config.php';

try {
    echo "<h2>Migrating Profiles Table (MySQL Compatible)...</h2>\n";
    
    // Check which columns exist
    $stmt = $pdo->query("DESCRIBE profiles");
    $existing_columns = [];
    while ($row = $stmt->fetch()) {
        $existing_columns[] = $row['Field'];
    }
    
    echo "<p>Existing columns: " . implode(', ', $existing_columns) . "</p>\n";
    
    // Add missing columns
    $columns_to_add = [
        'display_name' => 'VARCHAR(50)',
        'bio' => 'TEXT',
        'website' => 'VARCHAR(255)', 
        'location' => 'VARCHAR(100)',
        'is_private' => 'BOOLEAN DEFAULT FALSE'
    ];
    
    foreach ($columns_to_add as $column_name => $column_def) {
        if (!in_array($column_name, $existing_columns)) {
            try {
                $sql = "ALTER TABLE profiles ADD COLUMN $column_name $column_def";
                $pdo->exec($sql);
                echo "<p>✅ Added column: $column_name</p>\n";
            } catch (PDOException $e) {
                echo "<p>❌ Failed to add $column_name: " . $e->getMessage() . "</p>\n";
            }
        } else {
            echo "<p>⏭️ Column $column_name already exists</p>\n";
        }
    }
    
    // Insert test profile data
    try {
        // First check if profile exists for user 1
        $stmt = $pdo->prepare("SELECT id FROM profiles WHERE user_id = 1");
        $stmt->execute();
        
        if (!$stmt->fetch()) {
            $stmt = $pdo->prepare("
                INSERT INTO profiles (user_id, display_name, bio, website, location, is_private) 
                VALUES (1, 'Test User', 'This is a test bio', 'https://example.com', 'San Francisco, CA', FALSE)
            ");
            $stmt->execute();
            echo "<p>✅ Inserted test profile data</p>\n";
        } else {
            echo "<p>⏭️ Test profile already exists</p>\n";
        }
    } catch (PDOException $e) {
        echo "<p>⚠️ Profile insert: " . $e->getMessage() . "</p>\n";
    }
    
    echo "<h3>✅ Migration complete!</h3>\n";
    
} catch (Exception $e) {
    echo "<h3>❌ Migration failed!</h3>\n";
    echo "<p>Error: " . $e->getMessage() . "</p>\n";
}
?>