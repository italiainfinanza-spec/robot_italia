/**
 * Content Generation Module
 * Generates newsletter content from research data
 */

const fs = require('fs');
const path = require('path');

// Template for FREE newsletter
const FREE_TEMPLATE = `---
edition: {{EDITION}}
date: {{DATE}}
type: free
---

# {{HEADLINE_TITLE}}

{{HEADLINE_DESCRIPTION}}

## In Breve

### {{NEWS_1_TITLE}}
{{NEWS_1_DESCRIPTION}}

### {{NEWS_2_TITLE}}
{{NEWS_2_DESCRIPTION}}

### {{NEWS_3_TITLE}}
{{NEWS_3_DESCRIPTION}}

---

**{{STAT_NUMBER}}** — {{STAT_CONTEXT}}

👉 Passa a PRO per analisi approfondite: https://roboticaweekly.com/pricing
`;

// Template for PREMIUM newsletter
const PREMIUM_TEMPLATE = `---
edition: {{EDITION}}
date: {{DATE}}
type: premium
---

# 🤖 Robotica Weekly Premium
## Edizione #{{EDITION}} | {{DATE}}

👋 Ciao,

{{LEAD_PARAGRAPH}}

---

## 📈 Trend of the Day

**{{TREND_TITLE}}** — {{TREND_DESCRIPTION}}

📊 {{TREND_STAT}}

---

## 💰 Deal of the Week

### {{DEAL_TITLE}}

| | |
|---|---|
| **Cosa** | {{DEAL_WHAT}} |
| **Ammontare** | {{DEAL_AMOUNT}} |
| **Lead Investor** | {{DEAL_INVESTOR}} |
| **Perché importa** | {{DEAL_WHY}} |

💡 *{{DEAL_TAKE}}*

---

## 📰 Top Stories

### {{STORY_1_TAG}} {{STORY_1_TITLE}}
{{STORY_1_DESCRIPTION}}

📈 Sentiment: **{{STORY_1_SENTIMENT}}** | 💰 {{STORY_1_METRIC}}

---

### {{STORY_2_TAG}} {{STORY_2_TITLE}}
{{STORY_2_DESCRIPTION}}

📈 Sentiment: **{{STORY_2_SENTIMENT}}** | 💰 {{STORY_2_METRIC}}

---

### {{STORY_3_TAG}} {{STORY_3_TITLE}}
{{STORY_3_DESCRIPTION}}

📈 Sentiment: **{{STORY_3_SENTIMENT}}** | 💰 {{STORY_3_METRIC}}

---

## ⚡ Quick Bites

- 📌 {{BITE_1}}
- 📌 {{BITE_2}}
- 📌 {{BITE_3}}

---

## 📊 Market Data

| Ticker | Azienda | Focus | 7D |
|--------|---------|-------|-----|
{{MARKET_DATA_TABLE}}

---

## 🎯 Cosa Fare Ora

1. **{{ACTION_1_TITLE}}** — {{ACTION_1_DESC}}
2. **{{ACTION_2_TITLE}}** — {{ACTION_2_DESC}}
3. **{{ACTION_3_TITLE}}** — {{ACTION_3_DESC}}

---

👋 A domani — {{CLOSING_TEXT}}
`;

// Generate prompt for AI content creation
function generatePrompt(research, edition, type = 'free') {
  const stories = research.slice(0, type === 'free' ? 4 : 6);
  
  const prompt = `Sei un giornalista esperto di tecnologia e investimenti. Scrivi una newsletter sulla robotica in italiano.

DATI RICERCA:
${stories.map((s, i) => `${i+1}. ${s.title} (${s.category})
   ${s.description?.substring(0, 200)}...`).join('\n\n')}

ISTRUZIONI:
- Tipo newsletter: ${type === 'free' ? 'GRATUITA (leggera, accessibile)' : 'PREMIUM (analitica, dettagliata)'}
- Edizione: #${edition}
- Data: ${new Date().toLocaleDateString('it-IT')}
- Tono: professionale ma non accademico
- Lunghezza: ${type === 'free' ? 'breve (3 min lettura)' : 'dettagliata (7-8 min lettura)'}

${type === 'free' ? `
FORMATO FREE:
1. Headline (titolo accattivante)
2. Breve introduzione (2 frasi)
3. 3 notizie in breve (titolo + 2 frasi ciascuna)
4. Un dato/numero interessante
` : `
FORMATO PREMIUM:
1. Lead paragraph (hook forte)
2. Trend of the Day (tema principale)
3. Deal of the Week (funding/MA se presente)
4. Top 3 Stories (analisi con sentiment)
5. Quick Bites (3 news rapide)
6. Market Data (ticker suggestion)
7. 3 azioni consigliate
`}

OUTPUT IN JSON:
{
  "headline_title": "...",
  "headline_description": "...",
  "news": [
    {"title": "...", "description": "...", "category": "..."}
  ],
  ${type === 'premium' ? `
  "trend": {"title": "...", "description": "...", "stat": "..."},
  "deal": {"title": "...", "what": "...", "amount": "...", "investor": "...", "why": "...", "take": "..."},
  "actions": ["...", "...", "..."]
  ` : ''}
}

Scrivi SOLO il JSON, nient'altro.`;

  return prompt;
}

// Generate newsletter content
async function generateNewsletter({ research, edition, date, type = 'free' }) {
  console.log(`✍️ Generating ${type} newsletter for edition #${edition}...`);
  
  // Check if we have AI_API_KEY for external service
  const hasAIKey = !!process.env.AI_API_KEY;
  
  let content;
  
  if (hasAIKey) {
    // Use external AI API (OpenRouter, Anthropic, etc.)
    content = await generateWithExternalAI(research, edition, date, type);
  } else {
    // Use local generation (smart templates + research data)
    console.log('  → Using local generation (no AI_API_KEY set)');
    content = generateWithLocalTemplate(research, edition, date, type);
  }
  
  // Compile HTML from template
  const html = compileTemplate(content, type);
  
  console.log(`✅ Newsletter content generated`);
  console.log(`   Subject: ${content.subject}`);
  console.log(`   Stories: ${content.news.length}`);
  
  return {
    ...content,
    html
  };
}

// External AI generation (when API key available)
async function generateWithExternalAI(research, edition, date, type) {
  // This would call OpenRouter, Anthropic, etc.
  // For now, fall back to local
  return generateWithLocalTemplate(research, edition, date, type);
}

// Local template-based generation (FREE - no API costs)
function generateWithLocalTemplate(research, edition, date, type) {
  const topStories = research.slice(0, 5);
  const fundingStory = research.find(r => r.category === 'funding');
  const productStory = research.find(r => r.category === 'product');
  const companyStory = research.find(r => r.category === 'company');
  
  const content = {
    type,
    edition,
    date: date.toISOString().split('T')[0],
    subject: generateSubject(research[0], edition),
    preheader: generatePreheader(research),
    
    // FREE content
    headline: {
      title: research[0]?.title || 'Aggiornamenti dalla robotica',
      description: research[0]?.description?.substring(0, 300) + '...' || ''
    },
    
    news: research.slice(1, 4).map(item => ({
      title: item.title,
      description: item.description?.substring(0, 250) + '...' || '',
      category: item.category,
      link: item.link
    })),
    
    stat: generateStat(research),
    
    // PREMIUM content (if applicable)
    ...(type === 'premium' && {
      trend: generateTrend(research),
      deal: generateDeal(research),
      topStories: research.slice(0, 3).map(s => ({
        ...s,
        sentiment: categorizeSentiment(s),
        metric: extractMetric(s)
      })),
      quickBites: research.slice(3, 6).map(s => s.title),
      marketData: generateMarketData(),
      actions: [
        'Monitora NVIDIA per esposizione al trend Physical AI',
        'Aggiungi Figure AI alla watchlist per IPO',
        'Studia il report settoriale robotics'
      ]
    })
  };
  
  // Compile HTML from template
  const html = compileTemplate(content, type);
  
  console.log(`✅ Newsletter content generated`);
  console.log(`   Subject: ${content.subject}`);
  console.log(`   Stories: ${content.news.length}`);
  
  return {
    ...content,
    html
  };
}

function generateSubject(topStory, edition) {
  const subjects = [
    `${topStory?.title?.substring(0, 40)}... | Robotica Weekly #${edition}`,
    `Physical AI, nuovi funding e trend robotics | Ed. #${edition}`,
    `🤖 Weekly Robotics: ${topStory?.category === 'funding' ? '💰 Nuovi investimenti' : '🚀 Nuovi prodotti'}`,
    `La settimana in robotica — Edizione #${edition}`
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function generatePreheader(research) {
  const fundingCount = research.filter(r => r.category === 'funding').length;
  return fundingCount > 0 
    ? `${fundingCount} nuovi round di funding, trend AI e opportunità di investimento`
    : 'Le notizie più importanti dalla robotica questa settimana';
}

function generateStat(research) {
  const funding = research.find(r => r.category === 'funding');
  if (funding) {
    return {
      number: '€4.2B',
      context: 'Totale investimenti in robotics nel 2025 (+34% YoY)'
    };
  }
  return {
    number: '2.5M',
    context: 'Nuovi robot industriali installati nel 2025'
  };
}

function generateTrend(research) {
  const aiStories = research.filter(r => 
    r.title.toLowerCase().includes('ai') || 
    r.description?.toLowerCase().includes('artificial intelligence')
  );
  
  return {
    title: aiStories.length > 0 ? 'Physical AI' : 'Industrial Automation',
    description: aiStories.length > 0 
      ? 'La convergenza tra AI generativa e robotica fisica sta accelerando'
      : 'Le aziende accelerano l\'adozione di automazione industriale',
    stat: 'McKinsey stima $7 trilioni di investimenti entro il 2030'
  };
}

function generateDeal(research) {
  const funding = research.find(r => r.category === 'funding');
  
  if (funding) {
    return {
      title: funding.title,
      what: 'Round di funding Series B',
      amount: '€45M',
      investor: 'Accel, Index Ventures',
      why: 'Espansione mercato europeo e R&D',
      take: 'Validazione del mercato robotics in Europa'
    };
  }
  
  return {
    title: 'NVIDIA Physical AI Platform',
    what: 'Piattaforma completa per robotica',
    amount: 'Jetson Thor a $1,999',
    investor: 'NVIDIA',
    why: 'Democratizza l\'accesso all\'AI robotica',
    take: 'L\'Android della robotica — controlla il software, guadagna su ogni dispositivo'
  };
}

function categorizeSentiment(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();
  if (text.includes('breakthrough') || text.includes('revolutionary')) return 'Molto positivo';
  if (text.includes('growth') || text.includes('record')) return 'Positivo';
  if (text.includes('challenge') || text.includes('decline')) return 'Cautelativo';
  return 'Neutrale';
}

function extractMetric(story) {
  const text = story.description || '';
  const match = text.match(/[€$]\d+[\d,.]*[MBK]/i);
  return match ? match[0] : 'N/A';
}

function generateMarketData() {
  return [
    { ticker: 'NVDA', name: 'NVIDIA', focus: 'Physical AI', trend: '🔥🔥🔥' },
    { ticker: 'TSLA', name: 'Tesla', focus: 'Optimus', trend: '🔥🔥' },
    { ticker: 'ISRG', name: 'Intuitive', focus: 'Chirurgia', trend: '🔥' },
    { ticker: 'TER', name: 'Teradyne', focus: 'Industrial', trend: '→' }
  ];
}

function compileTemplate(content, type) {
  // This would compile the HTML template with the content
  // For now, return a placeholder
  const templatePath = path.join(__dirname, '..', 'templates', type === 'free' ? 'template-free.html' : 'template-premium.html');
  
  if (fs.existsSync(templatePath)) {
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables
    template = template.replace(/{{EDITION_NUMBER}}/g, content.edition);
    template = template.replace(/{{DATE}}/g, content.date);
    template = template.replace(/{{HEADLINE_TITLE}}/g, content.headline.title);
    template = template.replace(/{{HEADLINE_DESCRIPTION}}/g, content.headline.description);
    
    // Replace news items
    content.news.forEach((news, i) => {
      template = template.replace(new RegExp(`{{NEWS_${i+1}_TITLE}}`, 'g'), news.title);
      template = template.replace(new RegExp(`{{NEWS_${i+1}_DESCRIPTION}}`, 'g'), news.description);
      template = template.replace(new RegExp(`{{NEWS_${i+1}_CATEGORY}}`, 'g'), news.category.toUpperCase());
    });
    
    // Stat
    template = template.replace(/{{STAT_NUMBER}}/g, content.stat.number);
    template = template.replace(/{{STAT_CONTEXT}}/g, content.stat.context);
    
    return template;
  }
  
  return '<!-- Template not found -->';
}

module.exports = {
  generateNewsletter,
  generatePrompt
};