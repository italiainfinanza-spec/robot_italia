/**
 * Notification Module
 * Sends approval requests via Telegram
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', 'logs', 'workflow-state.json');

// Send Telegram message
async function sendTelegramMessage(chatId, text, options = {}) {
  return new Promise((resolve, reject) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      reject(new Error('TELEGRAM_BOT_TOKEN not set'));
      return;
    }
    
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    };
    
    const data = JSON.stringify(payload);
    
    const reqOptions = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(reqOptions, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(result.description));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Send approval request
async function sendApprovalRequest({ runId, edition, content, config }) {
  const chatId = config.admin_chat_id || process.env.TELEGRAM_ADMIN_CHAT_ID;
  
  if (!chatId) {
    console.warn('⚠️ No admin chat ID configured, skipping notification');
    return { skipped: true };
  }
  
  // Truncate content for preview
  const previewText = content.headline?.description?.substring(0, 300) || '';
  const subject = content.subject || `Robotica Weekly #${edition}`;
  
  const message = `
<b>🤖 Robotica Weekly — Approvazione Richiesta</b>

📧 <b>Edizione:</b> #${edition}
📝 <b>Oggetto:</b> ${subject}

<b>Preview contenuto:</b>
${previewText}...

<b>Sezioni:</b>
• Headline: ${content.headline?.title?.substring(0, 50)}...
• Notizie: ${content.news?.length || 0} stories
• Tipo: ${content.type === 'premium' ? '🔒 Premium' : '📰 Free'}

⏰ <b>Invio automatico tra 60 minuti</b>

Cosa vuoi fare?
`;
  
  // Inline keyboard for approval
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ INVIA ORA', callback_data: `approve:${runId}` },
        { text: '❌ RINVIA', callback_data: `reject:${runId}` }
      ],
      [
        { text: '✏️ MODIFICA', callback_data: `edit:${runId}` },
        { text: '📋 VEDI TUTTO', callback_data: `preview:${runId}` }
      ]
    ]
  };
  
  try {
    const result = await sendTelegramMessage(chatId, message, {
      reply_markup: inlineKeyboard
    });
    
    console.log(`📱 Approval request sent (message_id: ${result.message_id})`);
    return { messageId: result.message_id };
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error.message);
    throw error;
  }
}

// Handle webhook/updates (for processing responses)
async function processUpdate(update) {
  if (!update.callback_query) return null;
  
  const callbackData = update.callback_query.data;
  const [action, runId] = callbackData.split(':');
  
  const chatId = update.callback_query.message.chat.id;
  const messageId = update.callback_query.message.message_id;
  
  console.log(`📨 Received ${action} for run ${runId}`);
  
  // Update workflow state
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  
  if (!state.currentRun || state.currentRun.id !== runId) {
    await sendTelegramMessage(chatId, '⚠️ Questa richiesta è scaduta o già processata.', {
      reply_to_message_id: messageId
    });
    return null;
  }
  
  switch (action) {
    case 'approve':
      state.currentRun.phases.review.decision = 'approved';
      await sendTelegramMessage(chatId, '✅ <b>Newsletter approvata!</b>\nVerrà inviata automaticamente.', {
        reply_to_message_id: messageId
      });
      break;
      
    case 'reject':
      state.currentRun.phases.review.decision = 'rejected';
      await sendTelegramMessage(chatId, '❌ <b>Newsletter rinviata.</b>\nPuoi modificarla manualmente e riprovare.', {
        reply_to_message_id: messageId
      });
      break;
      
    case 'edit':
      state.currentRun.phases.review.decision = 'needs_edit';
      await sendTelegramMessage(chatId, '✏️ <b>Modalità modifica attivata.</b>\nDescrivi cosa cambiare:', {
        reply_to_message_id: messageId
      });
      // In a full implementation, this would wait for follow-up message
      break;
      
    case 'preview':
      // Send full content preview
      const fullContent = state.currentRun.data.draftContent;
      const previewMsg = `
<b>📋 CONTENUTO COMPLETO</b>

<b>Oggetto:</b> ${fullContent.subject}

<b>HEADLINE:</b>
${fullContent.headline?.title}

<b>NEWS:</b>
${fullContent.news?.map((n, i) => `${i+1}. ${n.title}`).join('\n')}

<b>STAT:</b> ${fullContent.stat?.number} — ${fullContent.stat?.context}
`;
      await sendTelegramMessage(chatId, previewMsg);
      break;
  }
  
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  
  return { action, runId };
}

// Setup webhook (for production)
async function setupWebhook(url) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not set');
  }
  
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ url });
    
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/setWebhook`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.ok) {
          console.log('✅ Telegram webhook configured');
          resolve(result);
        } else {
          reject(new Error(result.description));
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Get bot info
async function getBotInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${token}/getMe`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ok ? result.result : null);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = {
  sendApprovalRequest,
  processUpdate,
  setupWebhook,
  getBotInfo,
  sendTelegramMessage
};