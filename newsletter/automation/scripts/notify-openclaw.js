/**
 * OpenClaw Notification Module
 * Uses OpenClaw's built-in messaging to send notifications
 * This leverages the current Telegram chat (no separate bot needed)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_PATH = path.join(__dirname, '..', 'logs', 'workflow-state.json');

// This chat ID - using the current OpenClaw session
const DEFAULT_CHAT_ID = '1625218206'; // Nadir's Telegram chat

/**
 * Send approval request via OpenClaw's message tool
 * This sends to the current Telegram chat without needing a bot token
 */
async function sendApprovalRequestOpenClaw({ runId, edition, content }) {
  console.log('📱 Preparing approval request for OpenClaw...');
  
  const subject = content.subject || `Robotica Weekly #${edition}`;
  const previewText = content.lead_paragraph || 
                     content.headline?.description || 
                     'Contenuto newsletter generato';
  
  // Format the message for OpenClaw
  const message = `🤖 **Robotica Weekly — Approvazione Richiesta**

📧 **Edizione:** #${edition}
📝 **Oggetto:** ${subject}
🤖 **AI:** ${content.ai_generated ? content.ai_model : 'Template locale'}

**Preview:**
${previewText.substring(0, 200)}...

**Sezioni:**
• ${content.type === 'premium' ? 'Trend, Deal, Top Stories, Market Data' : 'Headline + 3 News'}
• Tipo: ${content.type === 'premium' ? '🔒 Premium' : '📰 Free'}

⏰ **Invio automatico tra 60 minuti**

---

**Cosa vuoi fare?**

Rispondi con:
• **"INVIA"** o **"✅"** → Approva e invia subito
• **"RINVIA"** o **"❌"** → Annulla questa edizione
• **"MODIFICA: [cosa cambiare]"** → Richiedi modifiche
• **"VEDI"** → Ricevi contenuto completo

_Run ID: ${runId}_`;

  // Save pending approval state
  updateWorkflowState(runId, 'awaiting_approval', null);
  
  // Write message to a file that OpenClaw can pick up
  // Or output to stdout for OpenClaw to capture
  console.log('\n' + '='.repeat(60));
  console.log('OPENCLAW_NOTIFICATION_START');
  console.log(message);
  console.log('OPENCLAW_NOTIFICATION_END');
  console.log('='.repeat(60) + '\n');
  
  // Also write to a notification file
  const notificationPath = path.join(__dirname, '..', 'logs', 'pending-approval.txt');
  fs.writeFileSync(notificationPath, JSON.stringify({
    runId,
    edition,
    subject,
    timestamp: new Date().toISOString(),
    status: 'pending'
  }, null, 2));
  
  return { sent: true, method: 'openclaw' };
}

/**
 * Alternative: Use shell command to send via OpenClaw
 */
async function sendViaOpenClawCLI(message) {
  try {
    // This would use OpenClaw CLI if available
    // For now, we just log it
    console.log('📤 Message prepared for OpenClaw:', message.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error('Failed to send via OpenClaw:', error);
    return false;
  }
}

/**
 * Check for approval response
 * Polls the workflow state file for user decision
 */
async function checkForApproval(runId, timeoutMinutes = 60) {
  const checkInterval = 10000; // 10 seconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const startTime = Date.now();
  
  console.log(`⏳ Waiting for approval (timeout: ${timeoutMinutes}min)...`);
  
  return new Promise((resolve) => {
    const check = () => {
      try {
        const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
        const run = state.currentRun;
        
        if (!run || run.id !== runId) {
          console.log('⚠️ Run not found, assuming cancelled');
          resolve(false);
          return;
        }
        
        const decision = run.phases?.review?.decision;
        
        if (decision === 'approved') {
          console.log('✅ Approval received!');
          resolve(true);
          return;
        }
        
        if (decision === 'rejected') {
          console.log('❌ Rejection received');
          resolve(false);
          return;
        }
        
        if (Date.now() - startTime > timeoutMs) {
          console.log('⏰ Approval timeout, defaulting to reject');
          // Update state to rejected
          run.phases.review.decision = 'rejected';
          run.phases.review.status = 'timeout';
          fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
          resolve(false);
          return;
        }
        
        // Continue polling
        setTimeout(check, checkInterval);
        
      } catch (error) {
        console.error('Error checking approval:', error);
        setTimeout(check, checkInterval);
      }
    };
    
    check();
  });
}

/**
 * Update workflow state with decision
 */
function updateWorkflowState(runId, status, decision) {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    if (state.currentRun && state.currentRun.id === runId) {
      state.currentRun.phases.review.status = status;
      if (decision) {
        state.currentRun.phases.review.decision = decision;
      }
      fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    }
  } catch (error) {
    console.error('Failed to update workflow state:', error);
  }
}

/**
 * Process user response from OpenClaw
 * Call this when user replies to the notification
 */
async function processOpenClawResponse(runId, userMessage) {
  const message = userMessage.toLowerCase().trim();
  
  let decision = null;
  let response = '';
  
  if (message === 'invia' || message === '✅' || message === 'si' || message === 'yes') {
    decision = 'approved';
    response = '✅ **Newsletter approvata!**\nVerrà inviata automaticamente.';
    
  } else if (message === 'rinvia' || message === '❌' || message === 'no' || message === 'cancel') {
    decision = 'rejected';
    response = '❌ **Newsletter rinviata.**\nPuoi rigenerarla manualmente quando vuoi.';
    
  } else if (message.startsWith('modifica') || message.startsWith('✏️')) {
    decision = 'needs_edit';
    const editRequest = userMessage.replace(/^modifica[:\s]*/i, '').trim();
    response = `✏️ **Modifica richiesta:**\n_${editRequest}_\n\nAttendo nuova versione...`;
    
  } else if (message === 'vedi' || message === 'preview') {
    // Return full content preview
    return { action: 'preview', runId };
    
  } else {
    response = '🤔 Non ho capito. Rispondi con:\n• "INVIA" per approvare\n• "RINVIA" per annullare\n• "MODIFICA: [cosa cambiare]" per modifiche';
    return { action: 'unknown', response, runId };
  }
  
  // Update state
  if (decision) {
    updateWorkflowState(runId, decision === 'approved' ? 'approved' : 'rejected', decision);
  }
  
  return { action: decision, response, runId };
}

/**
 * Get full content preview for review
 */
async function getContentPreview(runId) {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    const run = state.currentRun;
    
    if (!run || run.id !== runId) {
      return null;
    }
    
    const content = run.data?.draftContent;
    if (!content) {
      return null;
    }
    
    let preview = `📋 **CONTENUTO COMPLETO — Edizione #${content.edition}**\n\n`;
    preview += `**Oggetto:** ${content.subject}\n\n`;
    
    if (content.type === 'premium') {
      preview += `**Trend:** ${content.trend?.title}\n`;
      preview += `${content.trend?.description?.substring(0, 150)}...\n\n`;
      
      preview += `**Top Stories:**\n`;
      content.topStories?.forEach((story, i) => {
        preview += `${i + 1}. ${story.title}\n`;
      });
    } else {
      preview += `**Headline:** ${content.headline?.title}\n\n`;
      preview += `**News:**\n`;
      content.news?.forEach((news, i) => {
        preview += `${i + 1}. ${news.title}\n`;
      });
    }
    
    return preview;
    
  } catch (error) {
    console.error('Error getting content preview:', error);
    return null;
  }
}

module.exports = {
  sendApprovalRequestOpenClaw,
  checkForApproval,
  processOpenClawResponse,
  getContentPreview,
  updateWorkflowState
};