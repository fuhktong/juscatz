<?php
// Database Setup Script
require_once __DIR__ . '/../api/config.php';

try {
    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/setup_tables.sql');
    
    // Split into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "<h2>Setting up JusCatz Database...</h2>\n";
    
    // Execute each statement
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                echo "<p>✅ Executed: " . substr($statement, 0, 50) . "...</p>\n";
            } catch (PDOException $e) {
                echo "<p>❌ Error in statement: " . substr($statement, 0, 50) . "...<br>";
                echo "Error: " . $e->getMessage() . "</p>\n";
            }
        }
    }
    
    echo "<h3>✅ Database setup complete!</h3>\n";
    echo "<p>You can now use the edit profile functionality.</p>\n";
    
} catch (Exception $e) {
    echo "<h3>❌ Setup failed!</h3>\n";
    echo "<p>Error: " . $e->getMessage() . "</p>\n";
}
?>