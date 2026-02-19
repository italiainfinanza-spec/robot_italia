#!/usr/bin/env node
/**
 * Robotica Weekly - AutoPilot Newsletter System
 * Main workflow orchestrator
 * 
 * Usage: node workflow.js [command]
 * Commands:
 *   research    - Run news research phase
 *   draft       - Generate newsletter content
 *   review      - Prepare content for review
 *   send        - Send approved newsletter
 *   status      - Check current workflow status
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_DIR = path.join(__dirname, '..');
const CONFIG_PATH = path.join(WORKFLOW_DIR, 'config', 'workflow.json');
const STATE_PATH = path.join(WORKFLOW_DIR, 'logs', 'workflow-state.json');
const LOG_PATH = path.join(WORKFLOW_DIR, 'logs', 'automation.log');

// Load configuration
function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config;
  } catch (error) {
    console.error('❌ Failed to load config:', error.message);
    process.exit(1);
  }
}

// Workflow state management
function loadState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️ Could not load state, starting fresh');
  }
  return {
    currentRun: null,
    history: []
  };
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  console.log(logEntry);
  
  // Append to log file
  fs.appendFileSync(LOG_PATH, logEntry + '\n');
}

// Initialize new workflow run
async function initRun() {
  const config = loadConfig();
  const state = loadState();
  
  const runId = `run-${Date.now()}`;
  const editionNumber = getNextEditionNumber(state);
  
  state.currentRun = {
    id: runId,
    edition: editionNumber,
    date: new Date().toISOString(),
    status: 'initialized',
    phases: {
      research: { status: 'pending', startedAt: null, completedAt: null },
      draft: { status: 'pending', startedAt: null, completedAt: null },
      review: { status: 'pending', startedAt: null, completedAt: null, approved: null },
      send: { status: 'pending', startedAt: null, completedAt: null }
    },
    data: {
      researchResults: null,
      draftContent: null,
      approvedContent: null
    }
  };
  
  saveState(state);
  log(`🚀 Initialized workflow run ${runId} for Edition #${editionNumber}`);
  return state.currentRun;
}

function getNextEditionNumber(state) {
  if (state.history.length === 0) return 1;
  const lastEdition = Math.max(...state.history.map(h => h.edition || 0));
  return lastEdition + 1;
}

// Phase: Research
async function runResearch(runId) {
  log('🔍 Starting research phase...');
  
  const config = loadConfig();
  const state = loadState();
  const run = state.currentRun;
  
  if (!run || run.id !== runId) {
    throw new Error('No active run found');
  }
  
  run.phases.research.status = 'in_progress';
  run.phases.research.startedAt = new Date().toISOString();
  saveState(state);
  
  // Research will be implemented in research.js
  const { researchNews } = require('./research');
  
  try {
    const results = await researchNews(config.news_sources);
    
    run.phases.research.status = 'completed';
    run.phases.research.completedAt = new Date().toISOString();
    run.data.researchResults = results;
    
    log(`✅ Research completed. Found ${results.length} relevant stories`);
    saveState(state);
    
    return results;
  } catch (error) {
    run.phases.research.status = 'failed';
    run.phases.research.error = error.message;
    saveState(state);
    throw error;
  }
}

// Phase: Draft
async function runDraft(runId) {
  log('✍️ Starting draft phase...');
  
  const state = loadState();
  const run = state.currentRun;
  
  if (!run || run.id !== runId) {
    throw new Error('No active run found');
  }
  
  if (run.phases.research.status !== 'completed') {
    throw new Error('Research phase must be completed first');
  }
  
  run.phases.draft.status = 'in_progress';
  run.phases.draft.startedAt = new Date().toISOString();
  saveState(state);
  
  // Content generation will be implemented in generator.js
  const { generateNewsletter } = require('./generator');
  
  try {
    const content = await generateNewsletter({
      research: run.data.researchResults,
      edition: run.edition,
      date: new Date()
    });
    
    run.phases.draft.status = 'completed';
    run.phases.draft.completedAt = new Date().toISOString();
    run.data.draftContent = content;
    
    log('✅ Draft completed');
    saveState(state);
    
    return content;
  } catch (error) {
    run.phases.draft.status = 'failed';
    run.phases.draft.error = error.message;
    saveState(state);
    throw error;
  }
}

// Phase: Review (send notification)
async function runReview(runId) {
  log('👀 Starting review phase...');
  
  const config = loadConfig();
  const state = loadState();
  const run = state.currentRun;
  
  if (!run || run.id !== runId) {
    throw new Error('No active run found');
  }
  
  if (run.phases.draft.status !== 'completed') {
    throw new Error('Draft phase must be completed first');
  }
  
  run.phases.review.status = 'awaiting_approval';
  run.phases.review.startedAt = new Date().toISOString();
  saveState(state);
  
  // Try OpenClaw notification first (current chat), fallback to Telegram bot
  let notificationMethod = 'openclaw';
  
  try {
    // Use OpenClaw notification (no bot token needed)
    const { sendApprovalRequestOpenClaw, checkForApproval } = require('./notify-openclaw');
    
    await sendApprovalRequestOpenClaw({
      runId: run.id,
      edition: run.edition,
      content: run.data.draftContent
    });
    
    log('📱 Approval request sent via OpenClaw (current chat)');
    log('⏳ Waiting for your response... (timeout: 60min)');
    log('   Reply with: INVIA / RINVIA / MODIFICA: [text]');
    
    // Wait for approval
    const approved = await checkForApproval(runId, config.approval.max_review_time_minutes);
    
    if (approved) {
      run.phases.review.status = 'approved';
      run.phases.review.approved = true;
      run.phases.review.completedAt = new Date().toISOString();
      run.data.approvedContent = run.data.draftContent;
      log('✅ Content approved');
    } else {
      run.phases.review.status = 'rejected';
      run.phases.review.approved = false;
      log('❌ Content rejected or timeout');
    }
    
    saveState(state);
    return approved;
    
  } catch (error) {
    // Fallback to Telegram bot if OpenClaw fails
    log('⚠️ OpenClaw notification failed, trying Telegram bot...');
    
    const { sendApprovalRequest } = require('./notify');
    
    try {
      await sendApprovalRequest({
        runId: run.id,
        edition: run.edition,
        content: run.data.draftContent,
        config: config.telegram
      });
      
      log('📱 Approval request sent via Telegram bot');
      
      const approved = await waitForApproval(runId, config.approval.max_review_time_minutes);
      
      if (approved) {
        run.phases.review.status = 'approved';
        run.phases.review.approved = true;
        run.phases.review.completedAt = new Date().toISOString();
        run.data.approvedContent = run.data.draftContent;
        log('✅ Content approved');
      } else {
        run.phases.review.status = 'rejected';
        run.phases.review.approved = false;
        log('❌ Content rejected or timeout');
      }
      
      saveState(state);
      return approved;
      
    } catch (telegramError) {
      run.phases.review.status = 'failed';
      run.phases.review.error = telegramError.message;
      saveState(state);
      throw telegramError;
    }
  }
}

async function waitForApproval(runId, timeoutMinutes) {
  const checkInterval = 5000; // 5 seconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const check = () => {
      const state = loadState();
      const run = state.currentRun;
      
      if (!run || run.id !== runId) {
        resolve(false);
        return;
      }
      
      if (run.phases.review.decision === 'approved') {
        resolve(true);
        return;
      }
      
      if (run.phases.review.decision === 'rejected') {
        resolve(false);
        return;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        log('⏰ Approval timeout');
        resolve(false);
        return;
      }
      
      setTimeout(check, checkInterval);
    };
    
    check();
  });
}

// Phase: Send
async function runSend(runId) {
  log('📧 Starting send phase...');
  
  const config = loadConfig();
  const state = loadState();
  const run = state.currentRun;
  
  if (!run || run.id !== runId) {
    throw new Error('No active run found');
  }
  
  if (run.phases.review.status !== 'approved') {
    throw new Error('Content must be approved before sending');
  }
  
  run.phases.send.status = 'in_progress';
  run.phases.send.startedAt = new Date().toISOString();
  saveState(state);
  
  // Send via Brevo API
  const { sendNewsletter } = require('./sender');
  
  try {
    const result = await sendNewsletter({
      content: run.data.approvedContent,
      brevoConfig: config.brevo,
      edition: run.edition
    });
    
    run.phases.send.status = 'completed';
    run.phases.send.completedAt = new Date().toISOString();
    run.status = 'completed';
    
    log(`✅ Newsletter sent! Message ID: ${result.messageId}`);
    
    // Archive this run
    state.history.push({
      ...run,
      archivedAt: new Date().toISOString()
    });
    state.currentRun = null;
    saveState(state);
    
    return result;
  } catch (error) {
    run.phases.send.status = 'failed';
    run.phases.send.error = error.message;
    saveState(state);
    throw error;
  }
}

// CLI Commands
async function main() {
  const command = process.argv[2] || 'status';
  
  switch (command) {
    case 'init':
      await initRun();
      break;
      
    case 'research':
      const run = await initRun();
      await runResearch(run.id);
      break;
      
    case 'draft':
      const state = loadState();
      if (!state.currentRun) {
        console.error('❌ No active run. Run: node workflow.js init');
        process.exit(1);
      }
      await runDraft(state.currentRun.id);
      break;
      
    case 'review':
      const reviewState = loadState();
      if (!reviewState.currentRun) {
        console.error('❌ No active run');
        process.exit(1);
      }
      await runReview(reviewState.currentRun.id);
      break;
      
    case 'send':
      const sendState = loadState();
      if (!sendState.currentRun) {
        console.error('❌ No active run');
        process.exit(1);
      }
      await runSend(sendState.currentRun.id);
      break;
      
    case 'full':
      // Run full workflow
      const fullRun = await initRun();
      await runResearch(fullRun.id);
      await runDraft(fullRun.id);
      const approved = await runReview(fullRun.id);
      if (approved) {
        await runSend(fullRun.id);
      }
      break;
      
    case 'status':
      const statusState = loadState();
      console.log('📊 Workflow Status');
      console.log('==================');
      if (statusState.currentRun) {
        console.log(`Current Run: ${statusState.currentRun.id}`);
        console.log(`Edition: #${statusState.currentRun.edition}`);
        console.log(`Status: ${statusState.currentRun.status}`);
        console.log('\nPhases:');
        Object.entries(statusState.currentRun.phases).forEach(([name, phase]) => {
          const icon = phase.status === 'completed' ? '✅' : 
                      phase.status === 'failed' ? '❌' : 
                      phase.status === 'in_progress' ? '🔄' : '⏳';
          console.log(`  ${icon} ${name}: ${phase.status}`);
        });
      } else {
        console.log('No active run');
        console.log(`Total historical runs: ${statusState.history.length}`);
      }
      break;
      
    default:
      console.log('Usage: node workflow.js [command]');
      console.log('Commands: init, research, draft, review, send, full, status');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});