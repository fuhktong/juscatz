<?php
// Check what tables and columns exist
require_once __DIR__ . '/../api/config.php';

try {
    echo "<h2>Checking Database Structure...</h2>\n";
    
    // Check if tables exist
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h3>Existing Tables:</h3>\n";
    foreach ($tables as $table) {
        echo "<p>📋 $table</p>\n";
        
        // Show columns for each table
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<ul>\n";
        foreach ($columns as $column) {
            echo "<li>{$column['Field']} ({$column['Type']})</li>\n";
        }
        echo "</ul>\n";
    }
    
} catch (Exception $e) {
    echo "<h3>❌ Error!</h3>\n";
    echo "<p>Error: " . $e->getMessage() . "</p>\n";
}
?>