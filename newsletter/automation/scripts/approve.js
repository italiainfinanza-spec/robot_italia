#!/usr/bin/env node
/**
 * Approve Newsletter Workflow via Command Line
 * Usage: node approve.js APPROVE <run-id> [edition]
 *        node approve.js REJECT <run-id> [edition]
 * 
 * This is called by OpenClaw when user responds on Telegram
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_PATH = path.join(__dirname, '..', 'logs', 'workflow-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    }
  } catch (e) {}
  return { currentRun: null, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function commitAndPush(message) {
  try {
    execSync('git config user.email "automation@roboticaweekly.com"');
    execSync('git config user.name "Newsletter AutoPilot"');
    execSync('git add logs/workflow-state.json');
    execSync(`git commit -m "${message}"`);
    execSync('git push origin main');
    console.log('✅ Changes pushed to GitHub');
    return true;
  } catch (e) {
    console.error('❌ Failed to push:', e.message);
    return false;
  }
}

async function main() {
  const action = process.argv[2]?.toUpperCase();
  const runId = process.argv[3];
  const edition = process.argv[4] || 'unknown';
  
  if (!action || !runId) {
    console.log('Usage: node approve.js [APPROVE|REJECT] <run-id> [edition]');
    process.exit(1);
  }
  
  const state = loadState();
  
  if (!state.currentRun || state.currentRun.id !== runId) {
    // Check if already in history
    const historyEntry = state.history?.find(h => h.id === runId);
    if (historyEntry) {
      console.log(`⚠️ Run ${runId} already completed`);
      process.exit(0);
    }
    console.error(`❌ Run ${runId} not found`);
    process.exit(1);
  }
  
  if (action === 'APPROVE') {
    state.currentRun.phases.review.decision = 'approved';
    state.currentRun.phases.review.status = 'approved';
    state.currentRun.phases.review.approvedAt = new Date().toISOString();
    state.currentRun.phases.review.approvedBy = 'telegram-user';
    saveState(state);
    
    console.log(`✅ Approved newsletter #${edition} (run: ${runId})`);
    
    // Try to push to GitHub so GitHub Actions sees it
    const pushed = commitAndPush(`approve: Newsletter #${edition} approved via Telegram`);
    
    if (pushed) {
      console.log('🚀 GitHub Actions will detect this and send the newsletter');
    } else {
      console.log('⚠️ Could not push - GitHub Actions may not see this immediately');
    }
    
  } else if (action === 'REJECT') {
    state.currentRun.phases.review.decision = 'rejected';
    state.currentRun.phases.review.status = 'rejected';
    state.currentRun.phases.review.rejectedAt = new Date().toISOString();
    saveState(state);
    
    console.log(`❌ Rejected newsletter #${edition} (run: ${runId})`);
    commitAndPush(`reject: Newsletter #${edition} rejected via Telegram`);
    
  } else {
    console.error('❌ Invalid action. Use APPROVE or REJECT');
    process.exit(1);
  }
}

main().catch(console.error);