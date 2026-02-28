/**
 * Save Newsletter for Admin Approval
 * Called by GitHub Actions after generating content
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const LATEST_FILE = path.join(LOGS_DIR, 'latest-newsletter.json');

// Save newsletter data for admin review
async function saveForApproval(content, edition, runId) {
  console.log('💾 Saving newsletter for admin approval...');
  
  // Ensure logs directory exists
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
  
  const data = {
    status: 'ready',
    edition: edition,
    runId: runId,
    subject: content.subject,
    preheader: content.preheader,
    headline: content.headline,
    news: content.news,
    type: content.type,
    ai_generated: content.ai_generated,
    ai_model: content.ai_model,
    generatedAt: new Date().toISOString(),
    html: content.html
  };
  
  // Save to file
  fs.writeFileSync(LATEST_FILE, JSON.stringify(data, null, 2));
  
  console.log('✅ Newsletter saved to:', LATEST_FILE);
  
  // Send notification to Telegram
  await notifyAdmin(data);
  
  return data;
}

// Send notification to admin on Telegram
async function notifyAdmin(data) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  
  if (!token || !chatId) {
    console.log('⚠️ Telegram not configured, skipping notification');
    return;
  }
  
  const message = encodeURIComponent(
    `🤖 *Newsletter #${data.edition} Pronta!*

📧 *Oggetto:* ${data.subject}
🤖 *AI:* ${data.ai_model || 'Template'}
📰 *News:* ${data.news?.length || 0} articoli

*Preview:*
${data.headline?.title}

👉 Vai su: https://roboticaweekly.com/admin/
🔐 Password: blablabla

✅ Clicca "INVIA NEWSLETTER" quando sei pronto!`
  );
  
  return new Promise((resolve, reject) => {
    https.get(
      `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=Markdown`,
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.ok) {
              console.log('📱 Admin notified on Telegram');
              resolve(result);
            } else {
              reject(new Error(result.description));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on('error', reject);
  });
}

// Mark as sent after approval
function markAsSent(messageId, recipients) {
  const data = JSON.parse(fs.readFileSync(LATEST_FILE, 'utf8'));
  data.status = 'sent';
  data.sentAt = new Date().toISOString();
  data.messageId = messageId;
  data.recipients = recipients;
  fs.writeFileSync(LATEST_FILE, JSON.stringify(data, null, 2));
  console.log('✅ Newsletter marked as sent');
}

// CLI usage
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'notify') {
    // Load content from workflow-state
    const statePath = path.join(__dirname, '..', 'logs', 'workflow-state.json');
    
    console.log('📂 Loading state from:', statePath);
    
    if (!fs.existsSync(statePath)) {
      console.error('❌ State file not found:', statePath);
      process.exit(1);
    }
    
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    
    console.log('📊 State loaded. Current run:', state.currentRun?.id || 'none');
    console.log('📝 Draft content:', state.currentRun?.data?.draftContent ? 'found' : 'NOT FOUND');
    
    if (state.currentRun && state.currentRun.data?.draftContent) {
      const edition = state.currentRun.edition;
      const runId = state.currentRun.id;
      const content = state.currentRun.data.draftContent;
      
      console.log(`🎯 Saving edition #${edition}, run ${runId}`);
      
      saveForApproval(content, edition, runId).then(() => {
        console.log('✅ Ready for admin approval!');
        process.exit(0);
      }).catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
      });
    } else {
      console.error('❌ No draft content found in state');
      console.error('State keys:', Object.keys(state));
      if (state.currentRun) {
        console.error('Current run keys:', Object.keys(state.currentRun));
        console.error('Data keys:', Object.keys(state.currentRun.data || {}));
      }
      process.exit(1);
    }
  }
}

module.exports = { saveForApproval, markAsSent };