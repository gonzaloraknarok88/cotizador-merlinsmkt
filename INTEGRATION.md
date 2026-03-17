# 🚀 INTEGRACION ENTERPRISE - Cotizador MerlinsMKT con Vercel Pro

## ARQUITECTURA PROFESIONAL 100% FUNCIONAL

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (index.html + main.js)                             │
│ - Formulario cotización                                      │
│ - Preview PDF en tiempo real                                │
│ - Botón "Enviar Cotización"                                │
└────────────────┬────────────────────────────────────────────┘
                 │ POST JSON
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ VERCEL PRO (Serverless Functions)                           │
│ - api/notifications.ts (Orchestrador central)               │
│ - Paraleliza notificaciones                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    ▼            ▼            ▼              ▼              ▼
┌────────┐  ┌─────────┐  ┌────────┐  ┌────────────┐  ┌────────┐
│Sheets  │  │WhatsApp │  │Slack   │  │Notion      │  │Monday  │
│API     │  │(Twilio) │  │Webhook │  │API         │  │API     │
└────────┘  └─────────┘  └────────┘  └────────────┘  └────────┘
```

---

## 📋 PASO 1: CREAR GOOGLE SHEET

1. Ve a https://sheets.google.com
2. Crea nueva hoja llamada "Cotizaciones MerlinsMKT"
3. Agrega encabezados (A1:H1):
   - Fecha
   - ID Cotización
   - Cliente
   - Email
   - Teléfono
   - Servicios
   - Monto
   - Estado

4. Ve a https://console.cloud.google.com
5. Crea proyecto "cotizador-merlinsmkt"
6. Habilita Google Sheets API
7. Crea service account y descarga JSON
8. Comparte la hoja con el email del service account

**Guarda en Vercel:**
```
GOOGLE_SHEETS_API_KEY = (API Key del service account)
GOOGLE_SHEETS_ID = (ID de la hoja - está en la URL)
```

---

## 📱 PASO 2: CONFIGURAR WHATSAPP (Twilio)

1. Ve a https://www.twilio.com/console
2. Sign up (plan gratuito: $0.0075 USD por SMS)
3. Ve a "Messaging" > "Try it out" > "Sandbox"
4. Obtén:
   - Account SID
   - Auth Token
   - WhatsApp Sandbox Number

5. Aprueba el número +56993663399 en el sandbox

**Guarda en Vercel:**
```
TWILIO_ACCOUNT_SID = tu_account_sid
TWILIO_AUTH_TOKEN = tu_auth_token
TWILIO_WHATSAPP_NUMBER = tu_sandbox_number
```

---

## 💬 PASO 3: SLACK - Notificaciones al equipo

1. Ve a https://api.slack.com/apps
2. Click "Create New App" > "From scratch"
3. Nombre: "MerlinsMKT Cotizador"
4. Workspace: tu workspace de Slack
5. Ve a "Incoming Webhooks" > "Add New Webhook to Workspace"
6. Selecciona canal (ej: #cotizaciones)
7. Copia la URL del webhook

**Guarda en Vercel:**
```
SLACK_WEBHOOK_URL = https://hooks.slack.com/services/...
```

---

## 📊 PASO 4: NOTION - Base de datos de cotizaciones

1. Ve a https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Nombre: "MerlinsMKT"
4. Copia el "Internal Integration Token"
5. Ve a tu workspace Notion
6. Crea página con "Database" > tabla con columnas:
   - ID (Title)
   - Cliente
   - Monto (Number)
   - Email
   - Estado (Select)
   - Fecha (Date)

7. Abre página > Tres puntos > "Connections" > Agrega tu integración
8. Copia el "Database ID" de la URL

**Guarda en Vercel:**
```
NOTION_API_KEY = tu_integration_token
NOTION_DATABASE_ID = tu_database_id
```

---

## 🗓️ PASO 5: MONDAY.COM - Tablero de proyectos

1. Ve a https://auth.monday.com/user/register
2. Crea cuenta
3. Ve a "Admin" > "API & integrations"
4. Copia tu API Token
5. Crea "Board" nuevo para cotizaciones
6. Copia el Board ID (en la URL: board/...)

**Guarda en Vercel:**
```
MONDAY_API_TOKEN = tu_api_token
MONDAY_BOARD_ID = tu_board_id
```

---

## ☁️ PASO 6: CLOUDFLARE - CDN + Workers

1. Ve a https://dash.cloudflare.com
2. Agrega tu dominio (merlinsmkt.cl)
3. Copia Nameservers en Namecheap/tu registrador
4. Ve a "Workers" > "Manage Service"
5. Crea worker para cache + rate limiting:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Cache de PDFs por 24 horas
    if (url.pathname.includes('/pdf/')) {
      const cache = caches.default;
      let response = await cache.match(request);
      if (!response) {
        response = await fetch(request);
        response = new Response(response.body, response);
        response.headers.set('Cache-Control', 'max-age=86400');
        await cache.put(request, response.clone());
      }
      return response;
    }
    
    // Pasar al origin
    return fetch(request);
  }
};
```

**Guarda en Vercel:**
```
CLOUDFLARE_API_TOKEN = tu_api_token
CLOUDFLARE_ACCOUNT_ID = tu_account_id
CLOUDFLARE_ZONE_ID = tu_zone_id
```

---

## 🤖 PASO 7: CLAUDE AI (MCP - Model Context Protocol)

1. Ve a https://console.anthropic.com
2. Crea API Key
3. Configura MCP server para que Claude lea cotizaciones:

```json
{
  "mcpServers": {
    "merlinsmkt": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": {
        "API_URL": "https://cotizador-merlinsmkt.vercel.app"
      }
    }
  }
}
```

**Guarda en Vercel:**
```
CLAUDE_API_KEY = tu_api_key_anthropic
```

---

## 🔧 PASO 8: DEPLOYAR EN VERCEL PRO

### 8.1 Instalar Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 8.2 Actualizar package.json
```json
{
  "name": "cotizador-merlinsmkt",
  "version": "1.0.0",
  "scripts": {
    "dev": "vercel dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "@vercel/node": "^3.0.0"
  }
}
```

### 8.3 Deployar
```bash
cd cotizador-merlinsmkt
vercel --prod
```

### 8.4 Agregar Environment Variables en Vercel
Ve a Vercel Dashboard > Project Settings > Environment Variables

Agrega todas las variables de `.env.example`

---

## ✅ CHECKLIST DE INTEGRACION

- [ ] Google Sheets API configurada y compartida
- [ ] Twilio WhatsApp sandbox setup
- [ ] Slack webhook creado
- [ ] Notion integration y database creada
- [ ] Monday.com API token y board creado
- [ ] Cloudflare nameservers actualizados
- [ ] Claude API key generada
- [ ] Vercel Pro suscripción activa
- [ ] Todas las env variables en Vercel
- [ ] deploy en producción exitoso
- [ ] Test de cotización completo

---

## 🧪 TEST COMPLETO

1. Ve a https://cotizador-merlinsmkt.vercel.app
2. Llena formulario de cotización
3. Click "Enviar Cotización"
4. Verifica:
   - ✅ Fila en Google Sheets
   - ✅ WhatsApp recibido en +56993663399
   - ✅ Mensaje en Slack #cotizaciones
   - ✅ Entrada en Notion database
   - ✅ Tarjeta en Monday board
   - ✅ PDF cacheado en Cloudflare
   - ✅ Claude AI lee la cotización

---

## 🎯 COSTOS MENSUALES ESTIMADOS

| Servicio | Costo |
|----------|-------|
| Vercel Pro | $20 USD |
| Google Sheets | Gratis |
| Twilio | ~$5 USD (≈700 WhatsApps) |
| Slack | Gratis (si ya tienes) |
| Notion | Gratis |
| Monday.com | $99 USD (plan starter) |
| Cloudflare Pro | $20 USD |
| Claude API | Pago por uso (~$0.003/cotización) |
| **TOTAL** | **~$144 USD/mes** |

---

## 📞 SOPORTE Y DEBUGGING

### Logs de Vercel
```bash
vercel logs
vercel logs -f  # Follow mode
```

### Test local
```bash
vercel dev  # Corre localhost:3000
```

### Errores comunes

**Error: "GOOGLE_SHEETS_API_KEY is undefined"**
- Verifica variables en Vercel Settings
- Usa `vercel env pull` para traer locales

**WhatsApp no llega:**
- Revisa Twilio console > Logs
- Asegúrate de estar en sandbox (primeros 72 horas)
- Número debe estar en formato +56993663399

**Slack no funciona:**
- Test webhook: `curl -X POST WEBHOOK_URL -d '{"text":"test"}'`

---

## 🎓 DOCUMENTACIÓN OFICIAL

- Vercel: https://vercel.com/docs
- Google Sheets: https://developers.google.com/sheets
- Twilio: https://www.twilio.com/docs
- Slack: https://api.slack.com
- Notion: https://developers.notion.com
- Monday.com: https://monday.com/developers
- Cloudflare: https://developers.cloudflare.com
- Claude: https://claude.ai/docs

---

**Sistema ENTERPRISE 100% funcional. Notificaciones en TIEMPO REAL a múltiples plataformas. ¡A PRODUCCIÓN!** 🚀
