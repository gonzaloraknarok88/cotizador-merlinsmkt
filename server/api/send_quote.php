<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mail.php';

use Dompdf\Dompdf;
use Dompdf\Options;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Método no permitido']));
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        throw new Exception('Datos inválidos');
    }

    // Validar datos
    $cliente_nombre = $data['cliente_nombre'] ?? null;
    $cliente_email = $data['cliente_email'] ?? null;
    $cliente_telefono = $data['cliente_telefono'] ?? null;
    $cliente_empresa = $data['cliente_empresa'] ?? null;
    $servicios = $data['servicios'] ?? [];
    $monto_total = $data['monto_total'] ?? 0;
    $notas = $data['notas'] ?? '';

    if (!$cliente_nombre || empty($servicios)) {
        throw new Exception('Faltan datos requeridos');
    }

    // 1. Guardar en BD
    $stmt = $pdo->prepare(
        "INSERT INTO cotizaciones 
        (cliente_nombre, cliente_email, cliente_telefono, cliente_empresa, servicios, monto_total, notas) 
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    
    $stmt->execute([
        $cliente_nombre,
        $cliente_email,
        $cliente_telefono,
        $cliente_empresa,
        json_encode($servicios),
        $monto_total,
        $notas
    ]);

    $cotizacion_id = $pdo->lastInsertId();

    // 2. Generar HTML del PDF
    $cliente = [
        'nombre' => $cliente_nombre,
        'empresa' => $cliente_empresa,
        'email' => $cliente_email,
        'telefono' => $cliente_telefono
    ];
    $fecha = date('d/m/Y');
    
    ob_start();
    include __DIR__ . '/../pdf/templates/cotizacion.php';
    $htmlPdf = ob_get_clean();

    // 3. Generar PDF con Dompdf
    $options = new Options();
    $options->set('isRemoteEnabled', true);
    $dompdf = new Dompdf($options);
    $dompdf->loadHtml($htmlPdf);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    // Guardar PDF en servidor
    $pdfDir = __DIR__ . '/../pdf/storage/';
    if (!is_dir($pdfDir)) {
        mkdir($pdfDir, 0755, true);
    }
    
    $pdfPath = $pdfDir . 'cotizacion_' . $cotizacion_id . '.pdf';
    file_put_contents($pdfPath, $dompdf->output());

    // 4. Generar HTML para correo
    $mailBodyHtml = <<<HTML
    <h2>Nueva Cotización - ID #{$cotizacion_id}</h2>
    <p><strong>Cliente:</strong> {$cliente_nombre}</p>
    <p><strong>Empresa:</strong> {$cliente_empresa}</p>
    <p><strong>Email:</strong> {$cliente_email}</p>
    <p><strong>Teléfono:</strong> {$cliente_telefono}</p>
    <p><strong>Monto Total:</strong> \${number_format($monto_total, 0, ',', '.')}</p>
    <p>Ver PDF adjunto para detalles completos.</p>
    HTML;

    // 5. Enviar correo
    $resultMail = enviarCotizacionCorreo(
        $pdfPath,
        "Nueva Cotización #" . $cotizacion_id,
        $mailBodyHtml,
        $cliente_email
    );

    // 6. Actualizar estado en BD
    $stmt = $pdo->prepare("UPDATE cotizaciones SET estado = 'enviada', pdf_url = ? WHERE id = ?");
    $stmt->execute(["/server/pdf/storage/cotizacion_" . $cotizacion_id . ".pdf", $cotizacion_id]);

    // 7. Respuesta exitosa
    echo json_encode([
        'success' => true,
        'cotizacion_id' => $cotizacion_id,
        'message' => 'Cotización enviada correctamente',
        'mail_status' => $resultMail
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
