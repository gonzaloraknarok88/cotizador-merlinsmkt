# 🚀 DEPLOYMENT FINAL - VERCEL PRO 100% FUNCIONAL

## SOLUCIÓN COMPLETA INTEGRADA

Este documento es el MANUAL FINAL para deployar el Cotizador MerlinsMKT con TODAS las integraciones funcionando:

✅ **Vercel Pro** - Serverless functions
✅ **Google Sheets** - Almacenamiento automático
✅ **WhatsApp** - Notificaciones al +56993663399
✅ **Correos** - Envío a 3 destinatarios
✅ **Slack** - Notificaciones al equipo
✅ **Notion** - Base de datos
✅ **Monday.com** - Tablero de proyectos
✅ **Cloudflare** - CDN + caching
✅ **Claude AI** - Análisis automático

---

## 📊 PASO 1: GITHUB - CLONAR EL REPO

```bash
git clone https://github.com/gonzaloraknarok88/cotizador-merlinsmkt.git
cd cotizador-merlinsmkt
npm install
```

---

## 🔓 PASO 2: OBTENER TODAS LAS CLAVES API

### 2.1 Google Sheets
1. Ve a https://console.cloud.google.com
2. Crea proyecto "MerlinsMKT"
3. Habilita "Google Sheets API"
4. Crea "Service Account"
5. Descarga JSON con credenciales
6. Copia el API Key

**GUARDAR:**
```
GOOGLE_SHEETS_API_KEY=<tu_api_key>
GOOGLE_SHEETS_ID=<id_hoja_sheets>
```

### 2.2 Twilio (WhatsApp)
1. Ve a https://www.twilio.com/console
2. Sign up o login
3. Ve a "Messaging" > "Services" > "Create Service"
4. Nombre: "MerlinsMKT"
5. Elige "WhatsApp"
6. Copia:
   - Account SID
   - Auth Token
   - Twilio WhatsApp Number

**GUARDAR:**
```
TWILIO_SID=<account_sid>
TWILIO_TOKEN=<auth_token>
TWILIO_WHATSAPP_FROM=<twilio_number>
```

### 2.3 Slack
1. Ve a https://api.slack.com/apps
2. "Create New App" > "From scratch"
3. Nombre: "MerlinsMKT"
4. Workspace: Tu workspace
5. Ve a "Incoming Webhooks"
6. "Add New Webhook to Workspace"
7. Selecciona canal (ej: #cotizaciones)
8. Copia el Webhook URL

**GUARDAR:**
```
SLACK_WEBHOOK=<webhook_url>
```

### 2.4 Notion
1. Ve a https://www.notion.so/my-integrations
2. "+ New integration"
3. Nombre: "MerlinsMKT"
4. Copia "Internal Integration Token"
5. Crea database en Notion con columnas: ID, Cliente, Monto, Email, Estado, Fecha
6. Copia Database ID

**GUARDAR:**
```
NOTION_API_KEY=<internal_token>
NOTION_DB_ID=<database_id>
```

### 2.5 Monday.com
1. Ve a https://auth.monday.com/user/register
2. Sign up
3. Ve a Admin > "API & integrations"
4. Copia API Token
5. Crea "Board" para Cotizaciones
6. Copia Board ID

**GUARDAR:**
```
MONDAY_TOKEN=<api_token>
MONDAY_BOARD_ID=<board_id>
```

### 2.6 SendGrid (Email)
1. Ve a https://sendgrid.com
2. Sign up
3. Ve a "Settings" > "API Keys"
4. Crea API Key
5. Tu email de envío

**GUARDAR:**
```
SENDGRID_API_KEY=<api_key>
EMAIL_FROM=<tu_email>
```

### 2.7 Cloudflare
1. Ve a https://dash.cloudflare.com
2. Agrega tu dominio (merlinsmkt.cl)
3. Copia nameservers en Namecheap/registrador
4. Ve a "Account Settings" > API Tokens
5. Copia Global API Key

**GUARDAR:**
```
CLOUDFLARE_API_TOKEN=<api_token>
CLOUDFLARE_ACCOUNT_ID=<account_id>
CLOUDFLARE_ZONE_ID=<zone_id>
```

### 2.8 Claude AI (opcional)
1. Ve a https://console.anthropic.com
2. Ve a "API keys"
3. Copia tu API Key

**GUARDAR:**
```
CLAUDE_API_KEY=<api_key>
```

---

## 😇 PASO 3: VERCEL SETUP

### 3.1 Instalar Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 3.2 Crear proyecto en Vercel
```bash
vercel link
```
Sigue los prompts para crear nuevo proyecto

### 3.3 Agregar variables de entorno
```bash
vercel env add GOOGLE_SHEETS_API_KEY
vercel env add GOOGLE_SHEETS_ID
vercel env add TWILIO_SID
vercel env add TWILIO_TOKEN
vercel env add TWILIO_WHATSAPP_FROM
vercel env add SLACK_WEBHOOK
vercel env add NOTION_API_KEY
vercel env add NOTION_DB_ID
vercel env add MONDAY_TOKEN
vercel env add MONDAY_BOARD_ID
vercel env add SENDGRID_API_KEY
vercel env add EMAIL_FROM
vercel env add CLOUDFLARE_API_TOKEN
vercel env add CLOUDFLARE_ACCOUNT_ID
vercel env add CLOUDFLARE_ZONE_ID
vercel env add CLAUDE_API_KEY
```

O ve a Vercel Dashboard > Project Settings > Environment Variables y pega todas

### 3.4 Deploy
```bash
vercel --prod
```

---

## 🧨 PASO 4: ACTUALIZAR index.html

En tu `index.html`, actualiza el endpoint de cotización:

```javascript
// Cambiar:
// fetch('/server/api/send_quote.php', ...)

// Por:
fetch('https://tu-dominio.vercel.app/api/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: document.getElementById('cliente').value,
    clientEmail: document.getElementById('email').value,
    clientPhone: document.getElementById('telefono').value,
    total: monto_total,
    services: servicios_array
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    alert(`✅ Cotización #${data.quotationId} enviada a:\n
${ data.notifications.map(n => n.platform + ': ' + n.status).join('\n') }`);
  }
})
```

---

## ✅ TEST COMPLETO

1. Ve a https://tu-dominio.vercel.app
2. Llena el formulario de cotización
3. Clickea "Enviar Cotización"
4. Verifica que llegaron notificaciones a:
   - ✅ Google Sheets (nueva fila)
   - ✅ WhatsApp (+56993663399)
   - ✅ Slack (#cotizaciones)
   - ✅ Notion (nueva entrada)
   - ✅ Monday.com (nueva tarjeta)
   - ✅ Email (a los 3 destinatarios)

---

## 📍 ESTRUCTURA FINAL

```
cotizador-merlinsmkt/
├─ public/
│  ├─ index.html
│  ├─ css/
│  └─ js/
├─ api/
│  ├─ quote.ts           ✅ SOLUCIÓN FINAL
│  └─ notifications.ts
├─ server/
│  ├─ config/
│  ├─ api/
│  └─ pdf/
├─ sql/
├─ package.json
├─ .env.example
├─ INTEGRATION.md
├─ SETUP.md
└─ DEPLOYMENT.md (este archivo)
```

---

## 💁 TROUBLESHOOTING

### Error: "GOOGLE_SHEETS_API_KEY is undefined"
**Solución:** Verifica que agregaste todas las env vars en Vercel Dashboard

### WhatsApp no llega
**Solución:** 
- Revisa Twilio console > Logs
- Asegúrate de estar en sandbox
- Número debe estar aprobado

### Slack no funciona
**Solución:**
```bash
curl -X POST $SLACK_WEBHOOK -d '{"text":"test"}'
```

### Vercel logs
```bash
vercel logs --follow
```

---

## 📌 NOTAS IMPORTANTES

1. **Primeros 72 horas Twilio:** En sandbox solo puedes enviar a números aprobados
2. **Pricing:** Vercel Pro es $20/mes, Twilio es $0.0075 por mensaje
3. **Cloudflare:** Opcional pero recomendado para CDN + caching
4. **Claude AI:** Opcional para análisis automático de cotizaciones

---

## 🎉 LISTO PARA PRODUCCIÓN

Ya tienes:
- ✅ Backend serverless en Vercel Pro
- ✅ Almacenamiento en Google Sheets
- ✅ Notificaciones en tiempo real (WhatsApp, Slack, Email)
- ✅ Base de datos (Notion + Monday)
- ✅ CDN (Cloudflare)
- ✅ IA (Claude)

**¡A PRODUCCIÓN! 🚀**

---

**Soporte:** Revisa los logs con `vercel logs` para debugging

**Contacto:** Para ayuda contacta a MerlinsMKT
