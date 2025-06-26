<?php
require_once 'config.php';

echo json_encode([
    'success' => true,
    'message' => 'API is working!',
    'database' => 'Connected successfully',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>