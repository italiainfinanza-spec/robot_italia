/**
 * AI Content Generation Module
 * Uses Claude API (Anthropic) for high-quality newsletter generation
 * Falls back to local templates if API unavailable
 */

const https = require('https');

// Claude API configuration
const CLAUDE_API_HOST = 'api.anthropic.com';
const CLAUDE_API_PATH = '/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'; // or 'claude-3-opus-20240229' for premium

/**
 * Generate newsletter content using Claude AI
 * @param {Object} params - Generation parameters
 * @param {Array} params.research - Research data/stories
 * @param {number} params.edition - Edition number
 * @param {Date} params.date - Publication date
 * @param {string} params.type - 'free' or 'premium'
 * @returns {Promise<Object>} Generated content
 */
async function generateWithClaude({ research, edition, date, type = 'free' }) {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ No Claude API key, falling back to local generation');
    return null; // Will trigger fallback
  }
  
  console.log('🤖 Generating content with Claude AI...');
  
  const prompt = buildClaudePrompt(research, edition, date, type);
  
  try {
    const response = await callClaudeAPI(prompt, apiKey);
    const content = parseClaudeResponse(response, type);
    
    console.log('✅ Claude generated content successfully');
    return content;
    
  } catch (error) {
    console.error('❌ Claude API error:', error.message);
    return null; // Will trigger fallback
  }
}

/**
 * Build the prompt for Claude
 */
function buildClaudePrompt(research, edition, date, type) {
  const storiesText = research.map((story, i) => {
    return `${i + 1}. ${story.title} (${story.category})
   ${story.description || 'No description'}
   Fonte: ${story.source || 'Unknown'}
   Link: ${story.link || 'N/A'}`;
  }).join('\n\n');
  
  const isPremium = type === 'premium';
  
  return `Sei un giornalista esperto di tecnologia e investimenti. Scrivi una newsletter professionale in italiano sulla robotica e intelligenza artificiale.

DATI RICERCA (articoli trovati):
${storiesText}

ISTRUZIONI:
- Edizione: #${edition}
- Data: ${date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
- Tipo: ${isPremium ? 'PREMIUM (analisi approfondita per investitori)' : 'FREE (news leggere e accessibili)'}
- Tono: professionale ma conversazionale, mai accademico
- Pubblico: ${isPremium ? 'investitori e professionisti tech' : 'appassionati di tecnologia'}

${isPremium ? `
STRUTTURA PREMIUM (rispondi in JSON):
{
  "subject": "Oggetto email accattivante (max 60 char)",
  "preheader": "Sottotitolo visibile in anteprima (max 100 char)",
  "lead_paragraph": "Paragrafo introduttivo forte (2-3 frasi) con hook",
  "trend": {
    "title": "Titolo trend (es: 'Physical AI', 'Robotica collaborativa')",
    "description": "Spiegazione del trend (3-4 frasi)",
    "stat": "Statistica/dato rilevante con fonte"
  },
  "deal": {
    "title": "Nome deal/investimento principale",
    "what": "Cosa è stato annunciato/finanziato",
    "amount": "Ammontare investimento/financing",
    "investor": "Chi ha investito",
    "why": "Perché è importante (2 frasi)",
    "take": "Il nostro take/commento analitico"
  },
  "top_stories": [
    {
      "tag": "Categoria (Funding|Product|Company|Market)",
      "title": "Titolo news",
      "description": "Descrizione analitica (3-4 frasi)",
      "sentiment": "Molto positivo|Positivo|Neutrale|Cautelativo",
      "metric": "Metrica rilevante (es: '$675M', '+34%')"
    }
  ],
  "quick_bites": [
    "News breve 1 (1 frase con enfasi)",
    "News breve 2",
    "News breve 3"
  ],
  "actions": [
    "Azione concreta 1 per investitori",
    "Azione concreta 2",
    "Azione concreta 3"
  ],
  "closing": "Frase di chiusura che anticipa prossima edizione"
}
` : `
STRUTTURA FREE (rispondi in JSON):
{
  "subject": "Oggetto email (max 50 char)",
  "preheader": "Sottotitolo anteprima (max 80 char)",
  "headline": {
    "title": "Titolo principale accattivante",
    "description": "Sintesi della notizia principale (4-5 frasi), spiega perché è importante"
  },
  "news": [
    {
      "category": "Categoria (FUNDING|PRODUCT|COMPANY|INDUSTRY)",
      "title": "Titolo news breve",
      "description": "2-3 frasi che spiegano la notizia"
    }
  ],
  "stat": {
    "number": "Numero/dato interessante",
    "context": "Contesto del numero"
  }
}
`}

REGOLE IMPORTANTI:
1. Scrivi SOLO il JSON valido, nient'altro
2. Non includere markdown \`\`\`json o simili
3. Tutti i testi devono essere in italiano
4. Sii specifico, nomina aziende reali dai dati ricerca
5. Usa numeri e metriche quando disponibili
6. Il tono deve essere professionale ma non noioso`;
}

/**
 * Call Claude API
 */
function callClaudeAPI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const options = {
      hostname: CLAUDE_API_HOST,
      path: CLAUDE_API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error.message));
          } else if (result.content && result.content[0]) {
            resolve(result.content[0].text);
          } else {
            reject(new Error('Unexpected API response format'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (err) => reject(new Error(`Request failed: ${err.message}`)));
    req.write(payload);
    req.end();
    
    // 60 second timeout
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('API request timeout'));
    });
  });
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(responseText, type) {
  try {
    // Try to extract JSON if wrapped in markdown
    let jsonText = responseText;
    
    // Remove markdown code blocks if present
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Add metadata
    parsed.type = type;
    parsed.ai_generated = true;
    parsed.ai_model = CLAUDE_MODEL;
    
    return parsed;
    
  } catch (e) {
    console.error('Failed to parse Claude response:', e);
    console.error('Raw response:', responseText.substring(0, 500));
    throw new Error('Invalid JSON from Claude');
  }
}

/**
 * Generate with Grok (xAI) - Alternative to Claude
 */
async function generateWithGrok({ research, edition, date, type = 'free' }) {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  console.log('🤖 Generating content with Grok AI...');
  
  // Grok API implementation (when available)
  // For now, fallback to Claude or local
  console.log('⚠️ Grok API not yet implemented, trying Claude...');
  return generateWithClaude({ research, edition, date, type });
}

/**
 * Main generation function - tries AI, falls back to local
 */
async function generateNewsletterAI({ research, edition, date, type = 'free' }) {
  // Try AI generation in order of preference
  let content = null;
  
  // 1. Try Claude
  if (!content && process.env.CLAUDE_API_KEY) {
    content = await generateWithClaude({ research, edition, date, type });
  }
  
  // 2. Try Grok
  if (!content && (process.env.GROK_API_KEY || process.env.XAI_API_KEY)) {
    content = await generateWithGrok({ research, edition, date, type });
  }
  
  // 3. Fallback to local template generation
  if (!content) {
    console.log('📝 Using local template generation (no AI keys)');
    const { generateWithLocalTemplate } = require('./generator');
    content = generateWithLocalTemplate(research, edition, date, type);
  }
  
  return content;
}

module.exports = {
  generateWithClaude,
  generateWithGrok,
  generateNewsletterAI,
  // Backwards compatibility
  generateNewsletter: generateNewsletterAI
};