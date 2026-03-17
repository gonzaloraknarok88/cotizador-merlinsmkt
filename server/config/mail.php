<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

function enviarCotizacionCorreo($pdfPath, $subject, $bodyHtml, $clienteEmail = null) {
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.hostinger.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'no-reply@merlinsmkt.cl';
        $mail->Password = 'TU_PASSWORD_AQUI';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom('no-reply@merlinsmkt.cl', 'MerlinsMKT - Cotizador');
        $mail->addAddress('gonzaloraknarok@gmail.com');
        $mail->addAddress('merlinsdigitalmastery@gmail.com');
        $mail->addAddress('merlinsmkt@outloock.cl');
        
        if ($clienteEmail) {
            $mail->addCC($clienteEmail);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $bodyHtml;

        if (file_exists($pdfPath)) {
            $mail->addAttachment($pdfPath, 'cotizacion.pdf');
        }

        $mail->send();
        return ['success' => true, 'message' => 'Correo enviado correctamente'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $mail->ErrorInfo];
    }
}
?>
