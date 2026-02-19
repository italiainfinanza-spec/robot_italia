/**
 * Telegram Bot Setup Verification
 * Run this to test your Telegram bot configuration
 */

const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

if (!CHAT_ID) {
  console.error('❌ TELEGRAM_ADMIN_CHAT_ID not set');
  process.exit(1);
}

console.log('🤖 Testing Telegram Bot...');
console.log(`   Token: ${TOKEN.substring(0, 10)}...`);
console.log(`   Chat ID: ${CHAT_ID}`);

// Test getMe
function getMe() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${TOKEN}/getMe`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Test send message
function sendTestMessage() {
  return new Promise((resolve, reject) => {
    const message = encodeURIComponent(
      '🤖 *Test Robotica Weekly Bot*\n\n' +
      'Se leggi questo messaggio, il bot è configurato correttamente!\n\n' +
      'Rispondi con uno di questi comandi di test:\n' +
      '• *"INVIA"* — Simula approvazione\n' +
      '• *"RINVIA"* — Simula rifiuto\n\n' +
      `_Chat ID: ${CHAT_ID}_`
    );
    
    https.get(
      `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${message}&parse_mode=Markdown`,
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on('error', reject);
  });
}

async function main() {
  try {
    console.log('\n1️⃣ Testing bot connection...');
    const me = await getMe();
    
    if (me.ok) {
      console.log(`✅ Bot connected: @${me.result.username}`);
      console.log(`   Name: ${me.result.first_name}`);
    } else {
      console.error('❌ Bot error:', me.description);
      process.exit(1);
    }
    
    console.log('\n2️⃣ Sending test message...');
    const msg = await sendTestMessage();
    
    if (msg.ok) {
      console.log('✅ Test message sent!');
      console.log('   Check your Telegram for the message');
      console.log('\n🎉 Bot is configured correctly!');
    } else {
      console.error('❌ Failed to send message:', msg.description);
      console.log('\n⚠️ Common issues:');
      console.log('   • You haven\'t started a chat with the bot');
      console.log('   • Chat ID is incorrect');
      console.log('   • Bot was blocked by user');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();