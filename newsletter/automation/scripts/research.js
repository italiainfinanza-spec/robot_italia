/**
 * News Research Module
 * Aggregates news from multiple sources
 */

const https = require('https');
const { parseString } = require('xml2js');

// Web search using Brave API
async function webSearch(query, count = 5) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.search.brave.com',
      path: `/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&search_lang=it&country=IT`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.BRAVE_API_KEY || ''
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.web?.results || []);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Fetch and parse RSS feed
async function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        fetchRSS(res.headers.location).then(resolve).catch(reject);
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        parseString(data, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          
          const items = result.rss?.channel?.[0]?.item || [];
          const parsed = items.slice(0, 5).map(item => ({
            title: item.title?.[0] || '',
            link: item.link?.[0] || '',
            description: item.description?.[0] || '',
            pubDate: item.pubDate?.[0] || '',
            source: new URL(url).hostname
          }));
          
          resolve(parsed);
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('RSS fetch timeout'));
    });
  });
}

// Score relevance of a news item
function scoreRelevance(item, keywords) {
  let score = 0;
  const text = `${item.title} ${item.description}`.toLowerCase();
  
  // Primary keywords (high weight)
  keywords.primary.forEach(kw => {
    if (text.includes(kw.toLowerCase())) score += 3;
  });
  
  // Secondary keywords (medium weight)
  keywords.secondary.forEach(kw => {
    if (text.includes(kw.toLowerCase())) score += 2;
  });
  
  // Tertiary keywords (low weight)
  keywords.tertiary.forEach(kw => {
    if (text.includes(kw.toLowerCase())) score += 1;
  });
  
  // Recency bonus (within 48 hours)
  if (item.pubDate) {
    const pubDate = new Date(item.pubDate);
    const hoursAgo = (Date.now() - pubDate) / (1000 * 60 * 60);
    if (hoursAgo < 48) score += 2;
    if (hoursAgo < 24) score += 1;
  }
  
  return score;
}

// Main research function
async function researchNews(config) {
  const results = [];
  
  console.log('🔍 Searching for robotics news...');
  
  // 1. Search via Brave API
  if (process.env.BRAVE_API_KEY) {
    try {
      console.log('  → Querying Brave API...');
      for (const query of config.api_sources?.newsapi?.queries || []) {
        const searchResults = await webSearch(query, 3);
        results.push(...searchResults.map(r => ({
          title: r.title,
          link: r.url,
          description: r.description,
          source: r.profile?.name || 'Web Search',
          pubDate: r.age || new Date().toISOString(),
          type: 'search'
        })));
      }
    } catch (error) {
      console.warn('  ⚠️ Brave API error:', error.message);
    }
  } else {
    console.log('  ⚠️ BRAVE_API_KEY not set, skipping web search');
  }
  
  // 2. Fetch RSS feeds
  console.log('  → Fetching RSS feeds...');
  for (const feedUrl of config.rss_feeds || []) {
    try {
      const feedResults = await fetchRSS(feedUrl);
      results.push(...feedResults.map(r => ({
        ...r,
        type: 'rss'
      })));
      console.log(`    ✅ ${new URL(feedUrl).hostname}: ${feedResults.length} items`);
    } catch (error) {
      console.warn(`    ⚠️ RSS error for ${feedUrl}:`, error.message);
    }
  }
  
  // 3. Deduplicate by URL
  const seen = new Set();
  const unique = results.filter(item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
  
  // 4. Score and rank
  console.log('  → Scoring relevance...');
  const scored = unique.map(item => ({
    ...item,
    relevanceScore: scoreRelevance(item, config.keywords)
  }));
  
  // 5. Sort by score and filter minimum
  const ranked = scored
    .filter(item => item.relevanceScore >= 3)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
  
  console.log(`✅ Research complete: ${ranked.length} relevant stories found`);
  
  // Categorize stories
  return ranked.map(item => ({
    ...item,
    category: categorizeStory(item)
  }));
}

function categorizeStory(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  
  if (text.includes('fund') || text.includes('invest') || text.includes('million') || text.includes('billion') || text.includes('€') || text.includes('$')) {
    return 'funding';
  }
  if (text.includes('nvidia') || text.includes('tesla') || text.includes('boston dynamics') || text.includes('figure ai')) {
    return 'company';
  }
  if (text.includes('ipo') || text.includes('acquisition') || text.includes('merger')) {
    return 'market';
  }
  if (text.includes('new') || text.includes('launch') || text.includes('unveil')) {
    return 'product';
  }
  return 'industry';
}

module.exports = {
  researchNews,
  webSearch,
  fetchRSS
};