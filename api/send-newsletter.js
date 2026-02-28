/**
 * Vercel Serverless API
 * Sends newsletter via Brevo API
 * Protected by admin password
 */

const https = require('https');

const ADMIN_PASSWORD = 'blablabla';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { password } = req.body;
    
    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Fetch newsletter data from GitHub
    const newsletterData = await fetchNewsletterData();
    
    if (!newsletterData || newsletterData.status !== 'ready') {
      return res.status(400).json({ error: 'No newsletter ready to send' });
    }
    
    // Send via Brevo
    const result = await sendViaBrevo(newsletterData);
    
    // Update status to sent
    await updateStatusToSent(newsletterData.edition, result);
    
    res.json({
      success: true,
      messageId: result.messageId,
      recipients: result.recipients
    });
    
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: error.message });
  }
};

async function fetchNewsletterData() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/italiainfinanza-spec/robot_italia/main/newsletter/automation/logs/latest-newsletter.json';
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function sendViaBrevo(newsletter) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY not configured');
  }
  
  const htmlContent = newsletter.html || generateSimpleHtml(newsletter);
  
  const payload = JSON.stringify({
    sender: {
      email: 'ciao@roboticaweekly.com',
      name: 'Robotica Weekly'
    },
    to: [{ email: 'test@example.com' }], // Will use actual list in production
    subject: newsletter.subject,
    htmlContent: htmlContent,
    textContent: generateTextVersion(newsletter)
  });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              messageId: result.messageId,
              recipients: 1 // Would be actual count in production
            });
          } else {
            reject(new Error(result.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function updateStatusToSent(edition, result) {
  // In production, this would update GitHub via API
  // For now, just log
  console.log(`Newsletter #${edition} marked as sent`, result);
}

function generateSimpleHtml(newsletter) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h1>${newsletter.headline?.title || 'Newsletter'}</h1>
  <p>${newsletter.headline?.description || ''}</p>
  <hr>
  ${newsletter.news?.map(n => `<h3>${n.title}</h3><p>${n.description}</p>`).join('') || ''}
</body>
</html>`;
}

function generateTextVersion(newsletter) {
  let text = `Robotica Weekly - ${newsletter.subject}\n\n`;
  text += `${newsletter.headline?.title}\n\n`;
  text += `${newsletter.headline?.description}\n\n`;
  newsletter.news?.forEach((n, i) => {
    text += `${i+1}. ${n.title}\n${n.description}\n\n`;
  });
  return text;
}