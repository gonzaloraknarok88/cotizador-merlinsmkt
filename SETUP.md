# SETUP COMPLETO - Cotizador MerlinsMKT

## 🚀 INSTRUCCIONES DE INSTALACIÓN EN HOSTINGER

### PASO 1: Crear Base de Datos

1. Ve a tu panel de Hostinger
2. Ve a `Bases de Datos` > `MySQL`
3. Crea una base de datos llamada `merlinsmkt_db`
4. Crea un usuario `merlinsmkt_user` con password seguro
5. Ejecuta el script SQL en `sql/schema.sql` en tu base de datos

### PASO 2: Actualizar Credenciales

Edita estos archivos con tus credenciales reales:

**`server/config/db.php`**
```php
define('DB_HOST', 'tu_host_mysql');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_password');
define('DB_NAME', 'merlinsmkt_db');
```

**`server/config/mail.php`**
```php
$mail->Username = 'tu_email@dominio.com';  // Correo desde el cual envías
$mail->Password = 'tu_app_password';       // Contraseña de aplicación (NO la de tu cuenta)
```

### PASO 3: Instalar Dependencias PHP

En tu servidor (via terminal SSH en Hostinger):

```bash
cd /home/tu_usuario/public_html/cotizador-merlinsmkt
composer require phpmailer/phpmailer dompdf/dompdf
```

### PASO 4: Permisos de Carpetas

```bash
chmod 755 server/pdf/storage
chmod 755 server/api
```

## 📄 ESTRUCTURA DEL PROYECTO

```
cotizador-merlinsmkt/
├── public/
│   ├── index.html          # Formulario principal
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── server/
│   ├── config/
│   │   ├── db.php          # Conexión BD
│   │   └── mail.php        # Configuración correo
│   ├── api/
│   │   └── send_quote.php  # API principal
│   ├── pdf/
│   │   ├── templates/
│   │   │   └── cotizacion.php
│   │   └── storage/        # PDFs generados
├── sql/
│   └── schema.sql      # Estructura BD
├── composer.json    # Dependencias PHP
└── SETUP.md
```

## 💾 CÓMO FUNCIONA

1. **Usuario llena formulario** en `index.html`
2. **JavaScript** valida datos y envía POST a `/server/api/send_quote.php`
3. **API** genera:
   - Guarda cotización en BD
   - Genera HTML del PDF
   - Convierte a PDF (Dompdf)
   - Envía correo con PDF (PHPMailer)
4. **Respuesta JSON** confirmaCotización creada

## 📮 INTEGRACIÓN WHATSAPP (OPCIONAL)

### Opción 1: Link directo (sin costo)

En `server/api/send_quote.php`, después de crear el PDF:

```php
$whatsappLink = "https://wa.me/56993663399?text=Nueva%20cotizaci%c3%b3n%20%23" . $cotizacion_id;
echo json_encode(['whatsapp_link' => $whatsappLink]);
```

Luego en JavaScript, muestra un botón:
```javascript
if (response.whatsapp_link) {
    window.open(response.whatsapp_link, '_blank');
}
```

### OpciÓn 2: API Cloud (recomendado para producción)

Si usas **Twilio**, **360Dialog**, o **Meta Cloud API**, integra en `send_quote.php`:

```php
function enviarWhatsappNotificacion($numeroDestino, $mensaje, $pdfUrl) {
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://graph.instagram.com/v18.0/...',
        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
        CURLOPT_USERPWD => "TU_TOKEN_API",
        CURLOPT_POSTFIELDS => json_encode([
            'to' => $numeroDestino,
            'type' => 'document',
            'document' => ['link' => $pdfUrl]
        ])
    ));
    curl_exec($curl);
}

enviarWhatsappNotificacion('+56993663399', 'Nueva cotización', $pdfPath);
```

## ✅ CHECKLIST ANTES DE PRODUCIR

- [ ] Base de datos creada y credenciales actualizadas
- [ ] PHPMailer y Dompdf instalados
- [ ] Servidor SMTP configurado correctamente
- [ ] Carpeta `server/pdf/storage` con permisos 755
- [ ] `index.html` apunta a `/server/api/send_quote.php`
- [ ] Emails de destinatarios confirmados
- [ ] Testeado envío de correo
- [ ] Testeado envío de PDF

## 👷‍♂️ SOPORTE

Si tienes problemas:

1. Revisa los logs de PHP en Hostinger
2. Verifica permisos de carpetas: `755` para directorios
3. Comprueba credenciales de BD y SMTP
4. Prueba directamente: `curl -X POST https://tu_dominio.com/server/api/send_quote.php`

---

**Sistema listo para producción. ¡A disfrutar de tu cotizador!**
