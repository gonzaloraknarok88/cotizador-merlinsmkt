# cotizador-merlinsmkt
Sistema de Cotizaciones Profesional para MERLINSMKT - Agencia de Marketing Digital. Herramienta interactiva para generar cotizaciones de servicios web, marketing y branding.

## Cómo funciona (v2.1)

- **Cálculo:** precios del catálogo × cantidad, subtotal neto + IVA 19 %.
- **PDF:** botón "Descargar PDF" genera una cotización A4 corporativa con jsPDF (gratis, en el navegador).
- **Correo:** botón "Enviar Cotización al Cliente" genera el PDF y lo manda a un Google Apps Script
  (`apps-script/Code.gs`) que lo guarda en Google Sheets y lo envía por Gmail al cliente con saludo
  cordial, PDF adjunto y copia a `merlinsdigitalmastery@gmail.com` y `merlinksmkt@outlook.cl`.
- **WhatsApp:** todos los botones derivan a wa.me/56942016119 (+56 9 4201 6119).

### Activar el envío de correos (una sola vez, gratis)
1. Con la cuenta merlinsdigitalmastery@gmail.com abre el Google Sheet → Extensiones → Apps Script.
2. Pega `apps-script/Code.gs`, implementa como **App web** (Ejecutar como: Yo · Acceso: Cualquier persona).
3. Copia la URL `/exec` en la constante `APPS_SCRIPT_URL` de `index.html` y vuelve a desplegar.
   (Para probar sin redeploy: abre el sitio con `?admin=1` y pégala en el panel de configuración.)

### Desplegar en Cloudflare Workers (plan gratis)
`npx wrangler login && npx wrangler deploy`
