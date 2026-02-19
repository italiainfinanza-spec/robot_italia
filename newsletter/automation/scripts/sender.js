/**
 * Sender Module
 * Sends newsletters via Brevo API
 */

const https = require('https');

// Send email via Brevo API
async function sendEmail({ to, subject, htmlContent, textContent, sender, replyTo }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      reject(new Error('BREVO_API_KEY not set'));
      return;
    }
    
    const payload = JSON.stringify({
      sender: {
        email: sender.email,
        name: sender.name
      },
      to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent || '',
      replyTo: replyTo ? { email: replyTo } : undefined,
      tags: ['newsletter', 'automation']
    });
    
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'Content-Length': payload.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              messageId: result.messageId,
              status: 'sent',
              recipients: Array.isArray(to) ? to.length : 1
            });
          } else {
            reject(new Error(result.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Send newsletter to list
async function sendNewsletter({ content, brevoConfig, edition }) {
  console.log('📧 Sending newsletter via Brevo...');
  
  // In production, this would fetch the contact list from Brevo
  // For now, we'll simulate
  
  const sender = {
    email: brevoConfig.sender_email,
    name: brevoConfig.sender_name
  };
  
  // Add tracking pixels, unsubscribe links, etc.
  const enhancedHtml = enhanceEmailHtml(content.html, {
    edition,
    type: content.type
  });
  
  // For testing, just log the send
  console.log(`   Subject: ${content.subject}`);
  console.log(`   Type: ${content.type}`);
  console.log(`   HTML length: ${enhancedHtml.length} chars`);
  
  // In production, uncomment this:
  /*
  const result = await sendEmail({
    to: 'test@example.com', // Would be the actual list
    subject: content.subject,
    htmlContent: enhancedHtml,
    textContent: generateTextVersion(content),
    sender: sender,
    replyTo: sender.email
  });
  */
  
  // Simulated result
  const result = {
    messageId: `simulated-${Date.now()}`,
    status: 'sent_simulation',
    recipients: content.type === 'premium' ? 87 : 2543 // Example numbers
  };
  
  console.log(`✅ Newsletter sent (simulation mode)`);
  return result;
}

// Enhance HTML with tracking and required elements
function enhanceEmailHtml(html, options) {
  // Add tracking pixel
  const trackingPixel = `<img src="https://roboticaweekly.com/track/open?e=${options.edition}&t=${Date.now()}" width="1" height="1" alt="" />`;
  
  // Add unsubscribe footer
  const unsubscribe = `
    <div style="text-align: center; padding: 20px; color: #737373; font-size: 12px;">
      <p>Hai ricevuto questa email perché sei iscritto a Robotica Weekly.</p>
      <p><a href="https://roboticaweekly.com/unsubscribe?e={{EMAIL}}" style="color: #737373;">Annulla iscrizione</a> | 
         <a href="https://roboticaweekly.com/privacy" style="color: #737373;">Privacy Policy</a></p>
    </div>
  `;
  
  // Insert before closing body tag
  let enhanced = html;
  if (html.includes('</body>')) {
    enhanced = html.replace('</body>', `${trackingPixel}\n${unsubscribe}\n</body>`);
  }
  
  return enhanced;
}

// Generate plain text version
function generateTextVersion(content) {
  let text = `Robotica Weekly - Edizione #${content.edition}\n\n`;
  text += `${content.headline?.title}\n\n`;
  text += `${content.headline?.description}\n\n`;
  
  text += '---\n\n';
  text += 'IN BREVE:\n\n';
  
  content.news?.forEach((news, i) => {
    text += `${i + 1}. ${news.title}\n`;
    text += `${news.description}\n\n`;
  });
  
  text += '---\n\n';
  text += `Scopri di più: https://roboticaweekly.com\n`;
  text += `Gestisci preferenze: https://roboticaweekly.com/preferences`;
  
  return text;
}

// Get Brevo account info
async function getAccountInfo() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY not set');
  }
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/account',
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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

// Get contact lists
async function getContactLists() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY not set');
  }
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/contacts/lists?limit=50',
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.lists || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = {
  sendNewsletter,
  sendEmail,
  getAccountInfo,
  getContactLists,
  generateTextVersion
};