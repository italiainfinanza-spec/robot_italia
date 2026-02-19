/**
 * GitHub State Updater
 * Updates workflow state via GitHub API
 * Called by OpenClaw when user responds on Telegram
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GH_WORKFLOW_TOKEN || process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'italiainfinanza-spec';
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'robot_italia';

/**
 * Update workflow state file via GitHub API
 */
async function updateWorkflowStateViaAPI(newState) {
  if (!GITHUB_TOKEN) {
    throw new Error('GH_WORKFLOW_TOKEN not set');
  }

  const path = 'newsletter/automation/logs/workflow-state.json';
  const message = `Update workflow state: ${newState.phases?.review?.decision || 'updated'}`;
  
  // First, get current file to get SHA
  const currentFile = await getFileContents(path);
  const content = Buffer.from(JSON.stringify(newState, null, 2)).toString('base64');
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      content: content,
      sha: currentFile.sha
    });
    
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Robotica-Weekly-Automation',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(result.message || `HTTP ${res.statusCode}`));
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

/**
 * Get file contents from GitHub
 */
async function getFileContents(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Robotica-Weekly-Automation'
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

/**
 * Trigger workflow dispatch (alternative method)
 */
async function triggerWorkflowDispatch(eventType, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      event_type: eventType,
      client_payload: payload
    });
    
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Robotica-Weekly-Automation',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 204) {
          resolve({ success: true });
        } else {
          try {
            const result = JSON.parse(responseData);
            reject(new Error(result.message));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Approve workflow (for OpenClaw to call)
 */
async function approveWorkflow(runId, edition) {
  const state = {
    currentRun: {
      id: runId,
      edition: edition,
      phases: {
        review: {
          decision: 'approved',
          status: 'approved',
          approvedAt: new Date().toISOString()
        }
      }
    }
  };
  
  return await updateWorkflowStateViaAPI(state);
}

/**
 * Reject workflow
 */
async function rejectWorkflow(runId, edition) {
  const state = {
    currentRun: {
      id: runId,
      edition: edition,
      phases: {
        review: {
          decision: 'rejected',
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        }
      }
    }
  };
  
  return await updateWorkflowStateViaAPI(state);
}

module.exports = {
  updateWorkflowStateViaAPI,
  approveWorkflow,
  rejectWorkflow,
  triggerWorkflowDispatch
};