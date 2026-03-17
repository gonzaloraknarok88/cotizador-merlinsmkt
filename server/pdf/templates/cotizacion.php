<?php
$html = <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 900px; margin: 0 auto; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6c5ce7; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #6c5ce7; }
        .cotizacion-titulo { text-align: right; font-size: 14px; color: #999; }
        .datos-cliente { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 30px; }
        .datos-cliente h3 { color: #6c5ce7; margin-bottom: 10px; }
        .datos-cliente p { margin: 5px 0; font-size: 13px; }
        .tabla-servicios { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .tabla-servicios th { background: #6c5ce7; color: white; padding: 12px; text-align: left; font-weight: bold; }
        .tabla-servicios td { padding: 12px; border-bottom: 1px solid #eee; }
        .tabla-servicios tr:nth-child(even) { background: #fafafa; }
        .totales { margin-left: auto; width: 300px; text-align: right; margin-bottom: 30px; }
        .fila-total { display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #6c5ce7; font-weight: bold; font-size: 16px; color: #6c5ce7; }
        .condiciones { background: #f9f9f9; padding: 15px; border-left: 4px solid #6c5ce7; margin-top: 30px; font-size: 12px; color: #666; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔮 MERLINSMKT</div>
            <div class="cotizacion-titulo">
                <p><strong>COTIZACIÓN</strong></p>
                <p>Fecha: {$fecha}</p>
            </div>
        </div>
        <div class="datos-cliente">
            <h3>DATOS DEL CLIENTE</h3>
            <p><strong>Nombre:</strong> {$cliente['nombre']}</p>
            <p><strong>Empresa:</strong> {$cliente['empresa']}</p>
            <p><strong>Email:</strong> {$cliente['email']}</p>
            <p><strong>Teléfono:</strong> {$cliente['telefono']}</p>
        </div>
        <table class="tabla-servicios">
            <thead><tr><th>Servicio</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr></thead>
            <tbody>
HTML;

foreach ($servicios as $item) {
    $subtotal = $item['precio'] * $item['cantidad'];
    $precioFormato = number_format($item['precio'], 0, ',', '.');
    $subtotalFormato = number_format($subtotal, 0, ',', '.');
    $html .= "<tr><td>{$item['nombre']}</td><td style='text-align:center'>{$item['cantidad']}</td><td style='text-align:right'>\${$precioFormato}</td><td style='text-align:right'>\${$subtotalFormato}</td></tr>";
}

$totalFormato = number_format($total, 0, ',', '.');
$html .= <<<'HTML'
            </tbody>
        </table>
        <div class="totales">
            <div class="fila-total">
                <span>TOTAL:</span>
HTML;

$html .= "<span>\${$totalFormato}</span>";

$html .= <<<'HTML'
            </div>
        </div>
        <div class="condiciones">
            <h4 style="color: #6c5ce7; margin-bottom: 10px;">CONDICIONES</h4>
            <ul style="margin-left: 20px;">
                <li>Esta cotización es válida por 15 días desde su emisión.</li>
                <li>Se requiere un anticipo del 50% para comenzar los trabajos.</li>
                <li>El saldo se cancelará a la entrega del proyecto.</li>
                <li>Cambios adicionales fuera del alcance tendrán costo extra.</li>
            </ul>
        </div>
        <div class="footer">
            <p>MerlinsMKT | Agencia Digital | Santiago, Chile</p>
            <p>Tel: +56 9 9366 3399</p>
        </div>
    </div>
</body>
</html>
HTML;

return $html;
?>
