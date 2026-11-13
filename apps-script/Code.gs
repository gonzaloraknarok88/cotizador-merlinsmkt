// ═══════════════════════════════════════════════════════════════
// MERLINSMKT — Backend gratuito del Cotizador (Google Apps Script)
// Guarda cotizaciones/leads/agenda en Google Sheets y envía al
// cliente la cotización en PDF por correo (MailApp, plan gratis).
//
// Instalar (con la cuenta merlinsdigitalmastery@gmail.com):
//  1. Abre el Google Sheet → Extensiones → Apps Script
//  2. Borra todo y pega este archivo completo
//  3. Implementar → Nueva implementación → Tipo: App web
//     Ejecutar como: Yo · Quién tiene acceso: Cualquier persona
//  4. Autoriza los permisos (Sheets, Gmail, Calendar)
//  5. Copia la URL /exec y pégala en APPS_SCRIPT_URL del index.html
// Cuota gratuita de Gmail: ~100 destinatarios por día.
// ═══════════════════════════════════════════════════════════════

const SHEET_ID        = '1QiyygKV3ihMnt1RCs92kNkPtvIKzjqpKIEIWJIJgnoE';
const CORREOS_OFICIALES = ['merlinsdigitalmastery@gmail.com', 'merlinksmkt@outlook.cl'];
const WHATSAPP_NUM    = '56942016119';
const WHATSAPP_TXT    = '+56 9 4201 6119';
const FORM_OC         = 'https://forms.gle/azobgzHb7zp1HsrB7';
const NOMBRE_REMITENTE = 'MerlinsMKT · Agencia de Marketing Digital';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let extra = {};
    if      (d.tipo === 'cotizacion') extra = guardarCotizacion(ss, d);
    else if (d.tipo === 'lead')       guardarLead(ss, d);
    else if (d.tipo === 'agenda')     agendarCalendar(d, ss);
    else throw new Error('Tipo no reconocido: ' + d.tipo);
    return json(Object.assign({ ok: true }, extra));
  } catch (err) {
    return json({ ok: false, err: err.message });
  }
}

// Permite comprobar en el navegador que la URL está bien desplegada
function doGet() { return json({ ok: true, servicio: 'cotizador-merlinsmkt' }); }

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function esEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim()); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── COTIZACIONES ───────────────────────────────────────────────
function guardarCotizacion(ss, d) {
  const sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0 || sh.getRange(1, 1).getValue() === '') {
    sh.getRange(1, 1, 1, 10).setValues([[
      'Empresa', 'Servicios', 'Cotización N°', 'Correo',
      'OC', 'Enviado', 'X Enviar', 'Teléfono', 'Total', 'Fecha'
    ]]);
    formatHeader(sh, 10);
  }

  let enviado = false, motivo = '';
  if (d.enviarCorreo && esEmail(d.email)) {
    try { enviarCotizacionCliente(d); enviado = true; }
    catch (e) { motivo = e.message; }
  } else if (d.enviarCorreo) {
    motivo = 'Email del cliente no válido';
  }

  sh.appendRow([
    d.empresa, d.servicios, d.num, d.email,
    'Pendiente ⏳', enviado ? '✅ ' + new Date().toLocaleString('es-CL') : '',
    enviado ? '' : '✅ Enviar', d.telefono, d.total, d.fecha
  ]);

  // Aviso interno a los correos oficiales (si no se envió ya en copia)
  if (!enviado) {
    notificar('🧾 Cotización ' + d.num + ' — ' + d.empresa,
      'Empresa: ' + d.empresa + '\nEmail: ' + d.email +
      '\nServicios: ' + d.servicios + '\nTotal: ' + d.total +
      (motivo ? '\n⚠️ No se envió al cliente: ' + motivo : '') +
      '\nVer: https://docs.google.com/spreadsheets/d/' + SHEET_ID);
  }
  return { correoEnviado: enviado, motivo: motivo };
}

function enviarCotizacionCliente(d) {
  const nombre = d.representante || d.empresa || 'cliente';
  const waTxt = encodeURIComponent('Hola MerlinsMKT, recibí la cotización ' + d.num + ' y quiero avanzar.');
  const waLink = 'https://wa.me/' + WHATSAPP_NUM + '?text=' + waTxt;
  const filas = (d.items || []).map(i =>
    '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">' + esc(i.name) + '</td>' +
    '<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">' + esc(i.qty) + '</td>' +
    '<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">' + esc(i.total) + '</td></tr>').join('');

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#222">' +
    '<div style="background:#0c1929;padding:18px 22px;border-radius:10px 10px 0 0">' +
    '<span style="color:#c9a44a;font-size:20px;font-weight:bold">MERLINSMKT</span>' +
    '<span style="color:#9aa;font-size:12px;display:block">Agencia de Marketing Digital</span></div>' +
    '<div style="padding:22px;border:1px solid #e5dfd0;border-top:none;border-radius:0 0 10px 10px">' +
    '<p>Estimado/a <strong>' + esc(nombre) + '</strong>:</p>' +
    '<p>Junto con saludarle cordialmente, y agradeciendo de antemano su interés en nuestros servicios, ' +
    'le hacemos llegar la cotización <strong>' + esc(d.num) + '</strong> preparada especialmente para ' +
    '<strong>' + esc(d.empresa) + '</strong>. Encontrará el documento completo en PDF adjunto a este correo.</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:14px 0">' +
    '<tr style="background:#f6f1e7"><th style="padding:6px 8px;text-align:left">Servicio</th>' +
    '<th style="padding:6px 8px">Cant.</th><th style="padding:6px 8px;text-align:right">Valor</th></tr>' + filas +
    '<tr><td colspan="2" style="padding:6px 8px;text-align:right">Subtotal neto</td><td style="padding:6px 8px;text-align:right">' + esc(d.subtotal) + '</td></tr>' +
    '<tr><td colspan="2" style="padding:6px 8px;text-align:right">IVA 19%</td><td style="padding:6px 8px;text-align:right">' + esc(d.iva) + '</td></tr>' +
    '<tr><td colspan="2" style="padding:6px 8px;text-align:right;font-weight:bold">TOTAL</td><td style="padding:6px 8px;text-align:right;font-weight:bold;color:#a8862f">' + esc(d.total) + '</td></tr>' +
    '</table>' +
    (d.obs ? '<p style="font-size:13px;color:#555"><strong>Observaciones:</strong> ' + esc(d.obs) + '</p>' : '') +
    '<p>Si desea avanzar o resolver cualquier duda, puede escribirnos directamente por WhatsApp:</p>' +
    '<p style="text-align:center;margin:18px 0"><a href="' + waLink + '" style="background:#25D366;color:#fff;' +
    'padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">💬 WhatsApp ' + WHATSAPP_TXT + '</a></p>' +
    '<p>Para formalizar la contratación puede completar la orden de compra aquí: <a href="' + FORM_OC + '">' + FORM_OC + '</a></p>' +
    '<p>Quedamos atentos a sus comentarios.</p>' +
    '<p>Saludos cordiales,<br><strong>Equipo MerlinsMKT</strong><br>' +
    'WhatsApp: <a href="' + waLink + '">' + WHATSAPP_TXT + '</a><br>' +
    CORREOS_OFICIALES.map(c => '<a href="mailto:' + c + '">' + c + '</a>').join(' · ') + '</p>' +
    '</div></div>';

  const texto =
    'Estimado/a ' + nombre + ':\n\n' +
    'Junto con saludarle cordialmente, le hacemos llegar la cotización ' + d.num + ' para ' + d.empresa +
    '. Encontrará el documento en PDF adjunto.\n\nTOTAL: ' + d.total +
    '\n\nWhatsApp: ' + WHATSAPP_TXT + ' (' + waLink + ')\nCorreos: ' + CORREOS_OFICIALES.join(' · ') +
    '\n\nSaludos cordiales,\nEquipo MerlinsMKT';

  const opciones = {
    name: NOMBRE_REMITENTE,
    htmlBody: html,
    cc: CORREOS_OFICIALES.join(','),
    replyTo: CORREOS_OFICIALES[0]
  };
  if (d.pdfBase64) {
    opciones.attachments = [Utilities.newBlob(
      Utilities.base64Decode(d.pdfBase64), 'application/pdf',
      d.pdfNombre || ('Cotizacion-' + d.num + '.pdf'))];
  }
  MailApp.sendEmail(String(d.email).trim(),
    'Cotización ' + d.num + ' · MerlinsMKT — ' + d.empresa, texto, opciones);
}

// ── LEADS ──────────────────────────────────────────────────────
function guardarLead(ss, d) {
  let sh = ss.getSheetByName('Leads');
  if (!sh) {
    sh = ss.insertSheet('Leads');
    sh.getRange(1, 1, 1, 9).setValues([[
      'Fecha', 'Nombre', 'Email', 'Teléfono',
      'Empresa', 'Servicio Interés', 'Mensaje', 'Estado', 'Seguimiento'
    ]]);
    formatHeader(sh, 9);
  }
  sh.appendRow([d.fecha, d.nombre, d.email, d.telefono,
    d.empresa || '', d.servicio || '', d.mensaje || '', '🟢 Nuevo', '']);
  notificar('🟢 Lead: ' + d.nombre,
    'Nombre: ' + d.nombre + '\nEmail: ' + d.email + '\nTel: ' + d.telefono +
    '\nEmpresa: ' + (d.empresa || '-') + '\nInterés: ' + (d.servicio || '-') +
    '\nVer: https://docs.google.com/spreadsheets/d/' + SHEET_ID);
}

// ── AGENDA CALENDAR ────────────────────────────────────────────
function agendarCalendar(d, ss) {
  const cal = CalendarApp.getDefaultCalendar();
  const inicio = new Date(d.fechaReunion);
  const fin = new Date(inicio.getTime() + 60 * 60 * 1000);
  const opts = {
    description: '👤 ' + d.nombre + '\n🏢 ' + d.empresa + '\n📧 ' + d.email +
      '\n📞 ' + d.telefono + '\n💼 ' + d.servicio + '\n\n📝 ' + (d.mensaje || '') +
      '\n\n📋 OC/Contrato: ' + FORM_OC + '\n💬 WhatsApp: ' + WHATSAPP_TXT,
    sendInvites: true
  };
  if (esEmail(d.email)) opts.guests = d.email;
  cal.createEvent('📋 MerlinsMKT — ' + d.empresa, inicio, fin, opts);
  let sh = ss.getSheetByName('Agendamientos');
  if (!sh) {
    sh = ss.insertSheet('Agendamientos');
    sh.getRange(1, 1, 1, 7).setValues([[
      'Fecha Registro', 'Fecha Reunión', 'Nombre', 'Empresa', 'Email', 'Teléfono', 'Servicio'
    ]]);
    formatHeader(sh, 7);
  }
  sh.appendRow([new Date().toLocaleDateString('es-CL'), d.fechaReunion,
    d.nombre, d.empresa, d.email, d.telefono, d.servicio]);
  notificar('📅 Reunión: ' + d.empresa,
    'Fecha: ' + d.fechaReunion + '\nContacto: ' + d.nombre + '\nEmail: ' + d.email);
}

function formatHeader(sh, cols) {
  sh.getRange(1, 1, 1, cols).setFontWeight('bold')
    .setBackground('#0c1929').setFontColor('#c9a44a');
}

function notificar(asunto, cuerpo) {
  try { MailApp.sendEmail(CORREOS_OFICIALES.join(','), asunto, cuerpo, { name: NOMBRE_REMITENTE }); } catch (e) {}
}
