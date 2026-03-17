// Vercel Serverless Function - Sistema de notificaciones unificado
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface QuotationData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  total: number;
  services: Array<{name: string; price: number; quantity: number}>;
}

// 1. GOOGLE SHEETS - Guardar cotización
async function saveToGoogleSheets(data: QuotationData) {
  try {
    const SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
    const RANGE = 'Cotizaciones!A:H';

    const values = [[
      new Date().toISOString(),
      data.id,
      data.clientName,
      data.clientEmail,
      data.clientPhone,
      data.services.map(s => `${s.name} (${s.quantity})`).join(', '),
      `$${data.total}`,
      'Pendiente'
    ]];

    const response = await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED`,
      { values },
      { headers: { Authorization: `Bearer ${SHEETS_API_KEY}` } }
    );
    console.log('✅ Guardado en Google Sheets');
    return response.data;
  } catch (error) {
    console.error('❌ Error en Google Sheets:', error);
    throw error;
  }
}

// 2. WHATSAPP - Notificación automática (Twilio)
async function sendWhatsApp(data: QuotationData) {
  try {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
    const DESTINATION_NUMBER = '+56993663399';

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        'From': `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        'To': `whatsapp:${DESTINATION_NUMBER}`,
        'Body': `🔔 *Nueva Cotización #${data.id}*\n\nCliente: ${data.clientName}\nMonto: $${data.total}\nCorreo: ${data.clientEmail}\nTel: ${data.clientPhone}\n\nVer detalles en Google Sheets`
      }),
      { headers: { 'Authorization': `Basic ${auth}` } }
    );
    console.log('✅ WhatsApp enviado');
    return response.data;
  } catch (error) {
    console.error('❌ Error en WhatsApp:', error);
  }
}

// 3. SLACK - Notificación en equipo
async function sendToSlack(data: QuotationData) {
  try {
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

    const response = await axios.post(SLACK_WEBHOOK, {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `📊 Nueva Cotización #${data.id}` }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Cliente:*\n${data.clientName}` },
            { type: 'mrkdwn', text: `*Monto:*\n$${data.total}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.clientEmail}` },
            { type: 'mrkdwn', text: `*Tel:*\n${data.clientPhone}` }
          ]
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Servicios:*\n${data.services.map(s => `• ${s.name} x${s.quantity}`).join('\n')}` }
        }
      ]
    });
    console.log('✅ Notificación en Slack');
    return response.data;
  } catch (error) {
    console.error('❌ Error en Slack:', error);
  }
}

// 4. NOTION - Crear fila en BD Notion
async function createNotionEntry(data: QuotationData) {
  try {
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          'ID': { title: [{ text: { content: data.id } }] },
          'Cliente': { rich_text: [{ text: { content: data.clientName } }] },
          'Monto': { number: data.total },
          'Email': { email: data.clientEmail },
          'Estado': { select: { name: 'Pendiente' } },
          'Fecha': { date: { start: new Date().toISOString().split('T')[0] } }
        }
      },
      { headers: { 'Authorization': `Bearer ${NOTION_API_KEY}`, 'Notion-Version': '2022-06-28' } }
    );
    console.log('✅ Entrada en Notion creada');
    return response.data;
  } catch (error) {
    console.error('❌ Error en Notion:', error);
  }
}

// 5. MONDAY.COM - Crear tarjeta
async function createMondayCard(data: QuotationData) {
  try {
    const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
    const BOARD_ID = process.env.MONDAY_BOARD_ID;

    const query = `mutation { 
      create_item (
        board_id: ${BOARD_ID}, 
        item_name: "Cotización #${data.id} - ${data.clientName}",
        column_values: "{\\\\\\\"área_de_texto__1\\\\\\\":\\\\\\\"${data.clientEmail}\\\\\\\"}"  
      ) { id }
    }`;

    const response = await axios.post(
      'https://api.monday.com/graphql',
      { query },
      { headers: { 'Authorization': MONDAY_API_TOKEN } }
    );
    console.log('✅ Tarjeta en Monday.com creada');
    return response.data;
  } catch (error) {
    console.error('❌ Error en Monday:', error);
  }
}

// HANDLER PRINCIPAL
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const quotationData: QuotationData = req.body;

    // Ejecutar todas las notificaciones en paralelo
    const results = await Promise.allSettled([
      saveToGoogleSheets(quotationData),
      sendWhatsApp(quotationData),
      sendToSlack(quotationData),
      createNotionEntry(quotationData),
      createMondayCard(quotationData)
    ]);

    const summary = results.map((r, i) => ({
      service: ['Google Sheets', 'WhatsApp', 'Slack', 'Notion', 'Monday'][i],
      status: r.status
    }));

    return res.status(200).json({
      success: true,
      quotationId: quotationData.id,
      notifications: summary
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}
