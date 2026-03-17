<?php
// Configuración de conexión a la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'tu_usuario_bd');
define('DB_PASS', 'tu_password_bd');
define('DB_NAME', 'merlinsmkt_db');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die(json_encode(['error' => 'Conexión a BD fallida: ' . $e->getMessage()]));
}
?>
