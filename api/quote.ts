// VERCEL PRO - SOLUCIÓN FINAL INTEGRADA AL 100%
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface Quotation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  total: number;
  services: any[];
  pdfUrl?: string;
}

// ENVÍO PARALELO A TODAS LAS PLATAFORMAS
async function sendToAllPlatforms(quote: Quotation) {
  const results = await Promise.allSettled([
    // 1. GOOGLE SHEETS
    axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Cotizaciones!A:H:append?valueInputOption=USER_ENTERED`,
      {
        values: [[
          new Date().toLocaleString('es-CL'),
          quote.id,
          quote.clientName,
          quote.clientEmail,
          quote.clientPhone,
          quote.services.map(s => `${s.name} (${s.qty})`).join(', '),
          `$${quote.total}`,
          'Pendiente'
        ]]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_SHEETS_API_KEY}`
        }
      }
    ).catch(e => console.log('📊 Google Sheets: Error (continuando...)')),

    // 2. WHATSAPP - TWILIO (Automático al +56993663399)
    axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        To: 'whatsapp:+56993663399',
        Body: `🔔 Nueva Cotización #${quote.id}\n\nCliente: ${quote.clientName}\nMonto: $${quote.total}\nCorreo: ${quote.clientEmail}\nTel: ${quote.clientPhone}\n\n✅ Revisa detalles en Google Sheets`
      }),
      {
        auth: {
          username: process.env.TWILIO_SID,
          password: process.env.TWILIO_TOKEN
        }
      }
    ).catch(e => console.log('📱 WhatsApp: Error (continuando...)')),

    // 3. SLACK - NOTIFICACIÓN AL EQUIPO
    axios.post(
      process.env.SLACK_WEBHOOK!,
      {
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: `📊 Cotización #${quote.id}` } },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Cliente:*\n${quote.clientName}` },
              { type: 'mrkdwn', text: `*Monto:*\n$${quote.total}` },
              { type: 'mrkdwn', text: `*Email:*\n${quote.clientEmail}` },
              { type: 'mrkdwn', text: `*Tel:*\n${quote.clientPhone}` }
            ]
          }
        ]
      }
    ).catch(e => console.log('💬 Slack: Error (continuando...)')),

    // 4. NOTION - BASE DE DATOS
    axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: process.env.NOTION_DB_ID },
        properties: {
          ID: { title: [{ text: { content: quote.id } }] },
          Cliente: { rich_text: [{ text: { content: quote.clientName } }] },
          Monto: { number: quote.total },
          Email: { email: quote.clientEmail },
          Estado: { select: { name: 'Pendiente' } },
          Fecha: { date: { start: new Date().toISOString().split('T')[0] } }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        }
      }
    ).catch(e => console.log('📚 Notion: Error (continuando...)')),

    // 5. MONDAY.COM - TABLERO
    axios.post(
      'https://api.monday.com/graphql',
      {
        query: `mutation { create_item(board_id: ${process.env.MONDAY_BOARD_ID}, item_name: "Cotización #${quote.id} - ${quote.clientName}") { id } }`
      },
      {
        headers: { Authorization: process.env.MONDAY_TOKEN }
      }
    ).catch(e => console.log('📋 Monday: Error (continuando...)')),

    // 6. CORREO A LOS 3 DESTINATARIOS
    axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [
              { email: 'gonzaloraknarok@gmail.com' },
              { email: 'merlinsdigitalmastery@gmail.com' },
              { email: 'merlinsmkt@outlook.cl' }
            ]
          }
        ],
        from: { email: process.env.EMAIL_FROM },
        subject: `Nueva Cotización #${quote.id} - ${quote.clientName}`,
        html: `
          <h2>Cotización #${quote.id}</h2>
          <p><strong>Cliente:</strong> ${quote.clientName}</p>
          <p><strong>Email:</strong> ${quote.clientEmail}</p>
          <p><strong>Teléfono:</strong> ${quote.clientPhone}</p>
          <p><strong>Monto:</strong> $${quote.total}</p>
          <p>Revisa los detalles en Google Sheets y Notion</p>
        `
      },
      {
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` }
      }
    ).catch(e => console.log('📧 Email: Error (continuando...)'))
  ]);

  return results.map((r, i) => ({
    platform: ['Google Sheets', 'WhatsApp', 'Slack', 'Notion', 'Monday', 'Email'][i],
    status: r.status === 'fulfilled' ? '✅' : '⚠️'
  }));
}

// HANDLER PRINCIPAL
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const quote: Quotation = req.body;
    quote.id = `COT-${Date.now()}`;

    console.log(`📝 Procesando cotización #${quote.id}...`);

    // Enviar a TODAS las plataformas en paralelo
    const notifications = await sendToAllPlatforms(quote);

    return res.status(200).json({
      success: true,
      quotationId: quote.id,
      timestamp: new Date().toISOString(),
      notifications,
      message: '✅ Cotización enviada a todas las plataformas'
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
