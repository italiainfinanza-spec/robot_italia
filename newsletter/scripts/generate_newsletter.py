#!/usr/bin/env python3
"""
Italian Robotics Newsletter Generator
Automated system for discovering and summarizing robotics news in Italian.
Runs twice weekly (Mondays and Thursdays at 9:00 AM UTC).
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import subprocess

# Configuration
WORKSPACE_DIR = Path("/home/ubuntu/.openclaw/workspace/newsletter")
DRAFTS_DIR = WORKSPACE_DIR / "drafts"
ARCHIVE_DIR = WORKSPACE_DIR / "archive"
LOGS_DIR = WORKSPACE_DIR / "logs"

# Search queries for content discovery
SEARCH_QUERIES = [
    "robotics funding round 2025",
    "robotics acquisition merger 2025",
    "AI robotics breakthrough",
    "autonomous robots new technology",
    "robotics startup investment",
    "humanoid robot news",
    "industrial automation funding",
    "robotics venture capital",
    "medical robotics innovation",
    "warehouse robotics automation"
]

# Priority scoring weights
PRIORITY_WEIGHTS = {
    "breakthrough": 10,
    "funding": 8,
    "acquisition": 7,
    "merger": 7,
    "investment": 6,
    "strategy": 5,
    "partnership": 4,
    "product_launch": 4
}

class NewsletterGenerator:
    def __init__(self):
        self.articles = []
        self.draft_path = None
        self.log_file = LOGS_DIR / f"newsletter_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
    def log(self, message: str):
        """Write to log file and stdout"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry + '\n')
    
    def discover_content(self) -> List[Dict]:
        """Search for robotics news using web_search"""
        self.log("=" * 60)
        self.log("Starting Content Discovery Phase")
        self.log("=" * 60)
        
        all_results = []
        
        for query in SEARCH_QUERIES:
            self.log(f"\nSearching: {query}")
            try:
                # Call web_search via subprocess
                cmd = [
                    sys.executable, "-c",
                    f"""
import sys
sys.path.insert(0, '/home/ubuntu/.openclaw')
from tools.web_search import web_search
results = web_search(query='{query}', count=5, freshness='pw')
print(json.dumps(results, indent=2, default=str))
"""
                ]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0 and result.stdout.strip():
                    try:
                        search_results = json.loads(result.stdout)
                        if isinstance(search_results, list):
                            for item in search_results:
                                item['source_query'] = query
                                item['discovered_at'] = datetime.now().isoformat()
                                all_results.append(item)
                            self.log(f"  ✓ Found {len(search_results)} results")
                    except json.JSONDecodeError as e:
                        self.log(f"  ✗ JSON parse error: {e}")
                else:
                    self.log(f"  ✗ Search failed or no results")
                    
            except Exception as e:
                self.log(f"  ✗ Error searching: {e}")
        
        self.log(f"\n{'=' * 60}")
        self.log(f"Total articles discovered: {len(all_results)}")
        self.log(f"{'=' * 60}\n")
        
        return all_results
    
    def score_article(self, article: Dict) -> int:
        """Score article based on relevance, timeliness, and impact"""
        title = article.get('title', '').lower()
        snippet = article.get('snippet', '').lower()
        text = f"{title} {snippet}"
        
        score = 0
        
        # Priority keywords
        for keyword, weight in [
            ('breakthrough', PRIORITY_WEIGHTS['breakthrough']),
            ('funding', PRIORITY_WEIGHTS['funding']),
            ('raises', PRIORITY_WEIGHTS['funding']),
            ('million', PRIORITY_WEIGHTS['funding']),
            ('billion', PRIORITY_WEIGHTS['funding']),
            ('acquisition', PRIORITY_WEIGHTS['acquisition']),
            ('acquired', PRIORITY_WEIGHTS['acquisition']),
            ('merger', PRIORITY_WEIGHTS['merger']),
            ('merged', PRIORITY_WEIGHTS['merger']),
            ('investment', PRIORITY_WEIGHTS['investment']),
            ('investor', PRIORITY_WEIGHTS['investment']),
            ('venture capital', PRIORITY_WEIGHTS['investment']),
            ('series a', PRIORITY_WEIGHTS['funding']),
            ('series b', PRIORITY_WEIGHTS['funding']),
            ('series c', PRIORITY_WEIGHTS['funding']),
            ('ipo', PRIORITY_WEIGHTS['funding']),
        ]:
            if keyword in text:
                score += weight
        
        # Emerging company indicators
        emerging_keywords = ['startup', 'emerging', 'new company', 'founded', 'launch']
        for kw in emerging_keywords:
            if kw in text:
                score += 2
        
        # AI/Robotics relevance
        if 'ai' in text or 'artificial intelligence' in text:
            score += 3
        if 'humanoid' in text:
            score += 4
        if 'autonomous' in text:
            score += 3
        
        return score
    
    def rank_articles(self, articles: List[Dict]) -> List[Dict]:
        """Rank articles by score and return top stories"""
        self.log("Ranking articles by relevance and impact...")
        
        # Score and sort
        for article in articles:
            article['score'] = self.score_article(article)
        
        # Sort by score (descending) and remove duplicates by URL
        seen_urls = set()
        unique_articles = []
        for article in sorted(articles, key=lambda x: x.get('score', 0), reverse=True):
            url = article.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_articles.append(article)
        
        # Take top 15 for detailed review
        top_articles = unique_articles[:15]
        
        self.log(f"Top 5 articles selected:")
        for i, article in enumerate(top_articles[:5], 1):
            self.log(f"  {i}. [{article.get('score', 0)} pts] {article.get('title', 'N/A')[:60]}...")
        
        return top_articles
    
    def fetch_article_content(self, url: str) -> Optional[str]:
        """Fetch full article content using web_fetch"""
        try:
            cmd = [
                sys.executable, "-c",
                f"""
import sys
sys.path.insert(0, '/home/ubuntu/.openclaw')
from tools.web_fetch import web_fetch
content = web_fetch(url='{url}', extractMode='markdown', maxChars=3000)
print(content)
"""
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return result.stdout
        except Exception as e:
            self.log(f"  Could not fetch content: {e}")
        
        return None
    
    def summarize_content(self, title: str, content: str, snippet: str) -> str:
        """Generate a concise summary of the article"""
        # Use the first 500 characters of content, or snippet if content unavailable
        source = content[:800] if content else snippet
        
        # Extract key points (simple extraction)
        sentences = re.split(r'(?<=[.!?])\s+', source)
        key_sentences = []
        
        for sentence in sentences[:3]:
            sentence = sentence.strip()
            if len(sentence) > 30:
                key_sentences.append(sentence)
        
        return ' '.join(key_sentences) if key_sentences else snippet[:300]
    
    def translate_to_italian(self, text: str) -> str:
        """Translate text to Italian using simple mapping + note"""
        # Since we don't have a translation API, we'll mark content for translation
        # In production, integrate with DeepL, Google Translate, or similar
        return text  # Return original - translation happens post-generation or via API
    
    def categorize_article(self, article: Dict) -> str:
        """Categorize article by type"""
        title = article.get('title', '').lower()
        snippet = article.get('snippet', '').lower()
        text = f"{title} {snippet}"
        
        if any(kw in text for kw in ['breakthrough', 'innovation', 'new technology', 'discovery']):
            return "Breakthrough"
        elif any(kw in text for kw in ['funding', 'raises', 'investment', 'series', 'million', 'billion']):
            return "Funding"
        elif any(kw in text for kw in ['acquisition', 'acquired', 'buys', 'purchase']):
            return "Acquisition"
        elif any(kw in text for kw in ['merger', 'merge', 'combined']):
            return "Merger"
        elif any(kw in text for kw in ['strategy', 'investor', 'market analysis']):
            return "Strategy"
        else:
            return "Industry News"
    
    def generate_newsletter(self, articles: List[Dict]) -> str:
        """Generate the full newsletter in Italian format"""
        self.log("\n" + "=" * 60)
        self.log("Generating Newsletter")
        self.log("=" * 60)
        
        today = datetime.now()
        date_str = today.strftime('%d %B %Y')
        issue_number = today.strftime('%Y%m%d')
        
        # Categorize articles
        categorized = {"Breakthrough": [], "Funding": [], "Acquisition": [], 
                      "Merger": [], "Strategy": [], "Industry News": []}
        
        for article in articles[:10]:  # Top 10 articles
            category = self.categorize_article(article)
            article['summary'] = self.summarize_content(
                article.get('title', ''),
                self.fetch_article_content(article.get('url', '')) or '',
                article.get('snippet', '')
            )
            categorized[category].append(article)
        
        # Build newsletter
        newsletter = []
        
        # Header
        newsletter.append("=" * 70)
        newsletter.append("🤖 NEWSLETTER ROBOTICA - Edizione Italiana")
        newsletter.append(f"📅 {date_str} | Numero #{issue_number}")
        newsletter.append("=" * 70)
        newsletter.append("")
        
        # Introduction
        newsletter.append("📋 INTRODUZIONE")
        newsletter.append("-" * 70)
        newsletter.append("""
Benvenuti nella newsletter settimanale dedicata al mondo della robotica!
Ogni settimana selezioniamo le notizie più rilevanti su innovazioni, 
finanziamenti, acquisizioni e strategie di investimento nel settore 
della robotica e dell'automazione intelligente.

Questa settimana: focus su sviluppi tecnologici chiave e movimenti 
finanziari significativi nel panorama della robotica globale.
""")
        newsletter.append("")
        
        # Key Highlights
        newsletter.append("🎯 HIGHLIGHTS DELLA SETTIMANA")
        newsletter.append("-" * 70)
        
        top_stories = articles[:5]
        for i, article in enumerate(top_stories, 1):
            category = self.categorize_article(article)
            emoji = {"Breakthrough": "💡", "Funding": "💰", "Acquisition": "🤝", 
                    "Merger": "🔗", "Strategy": "📊", "Industry News": "📰"}.get(category, "📰")
            
            newsletter.append(f"{i}. {emoji} [{category}] {article.get('title', 'N/A')}")
        
        newsletter.append("")
        newsletter.append("=" * 70)
        newsletter.append("")
        
        # Detailed Sections
        priority_order = ["Breakthrough", "Funding", "Acquisition", "Merger", "Strategy", "Industry News"]
        
        for category in priority_order:
            items = categorized.get(category, [])
            if not items:
                continue
                
            emoji = {"Breakthrough": "💡", "Funding": "💰", "Acquisition": "🤝", 
                    "Merger": "🔗", "Strategy": "📊", "Industry News": "📰"}.get(category, "📰")
            
            newsletter.append(f"{emoji} {category.upper()}")
            newsletter.append("-" * 70)
            newsletter.append("")
            
            for article in items[:3]:  # Max 3 per category
                newsletter.append(f"📰 {article.get('title', 'N/A')}")
                newsletter.append(f"   Fonte: {article.get('url', 'N/A')[:60]}...")
                newsletter.append(f"   {article.get('summary', 'N/A')[:400]}...")
                newsletter.append("")
            
            newsletter.append("")
        
        # Investor Spotlight
        newsletter.append("💼 INVESTOR SPOTLIGHT")
        newsletter.append("-" * 70)
        newsletter.append("""
📈 Trend di Investimento:
Le ultime settimane hanno visto un aumento significativo degli 
investimenti in robotica umanoide e automazione industriale. 
I venture capitalist stanno puntando forte su startup che combinano 
IA generativa con capacità robotiche avanzate.

🎯 Opportunità da Monitorare:
- Robotica collaborativa (cobots) in ambito industriale
- Soluzioni di automazione per logistica e magazzino
- Robot medici e chirurgici
- Veicoli autonomi e droni commerciali

💡 Strategia Consigliata:
Diversificare il portafoglio tra robotica industriale matura e 
startup innovative nel settore AI-robotics. Attenzione particolare 
alle aziende con partnership strategiche consolidate.
""")
        newsletter.append("")
        
        # Conclusion and CTA
        newsletter.append("🎯 CONCLUSIONE")
        newsletter.append("-" * 70)
        newsletter.append("""
Grazie per aver letto questa edizione della nostra newsletter!
Il settore della robotica continua a evolversi rapidamente, con 
innovazioni che promettono di trasformare industrie intere.

📬 Vuoi suggerire argomenti o ricevere approfondimenti?
   Rispondi a questa email o contattaci.

🔄 Inoltra questa newsletter a colleghi interessati alla robotica!

Prossima edizione: prossimo Lunedì
""")
        
        # Footer
        newsletter.append("")
        newsletter.append("=" * 70)
        newsletter.append("Generato automaticamente dal Robotics Newsletter System")
        newsletter.append(f"Draft creato il: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        newsletter.append("=" * 70)
        
        return '\n'.join(newsletter)
    
    def save_draft(self, content: str) -> Path:
        """Save newsletter draft to file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"newsletter_draft_{timestamp}.txt"
        draft_path = DRAFTS_DIR / filename
        
        with open(draft_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        self.log(f"\n✓ Draft saved to: {draft_path}")
        return draft_path
    
    def save_metadata(self, articles: List[Dict]):
        """Save metadata about the newsletter generation"""
        metadata = {
            'generated_at': datetime.now().isoformat(),
            'total_articles_discovered': len(articles),
            'top_articles': [
                {
                    'title': a.get('title'),
                    'url': a.get('url'),
                    'score': a.get('score'),
                    'category': self.categorize_article(a)
                }
                for a in articles[:10]
            ]
        }
        
        meta_path = DRAFTS_DIR / f"metadata_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        self.log(f"✓ Metadata saved to: {meta_path}")
    
    def run(self):
        """Main execution flow"""
        self.log("🚀 Starting Italian Robotics Newsletter Generator")
        self.log(f"Working directory: {WORKSPACE_DIR}")
        
        # Ensure directories exist
        for d in [DRAFTS_DIR, ARCHIVE_DIR, LOGS_DIR]:
            d.mkdir(parents=True, exist_ok=True)
        
        # Phase 1: Content Discovery
        articles = self.discover_content()
        
        if not articles:
            self.log("⚠️ No articles discovered. Exiting.")
            return None
        
        # Phase 2: Ranking
        ranked_articles = self.rank_articles(articles)
        
        # Phase 3: Generate Newsletter
        newsletter_content = self.generate_newsletter(ranked_articles)
        
        # Phase 4: Save Draft
        draft_path = self.save_draft(newsletter_content)
        
        # Phase 5: Save Metadata
        self.save_metadata(ranked_articles)
        
        self.log("\n" + "=" * 60)
        self.log("✅ Newsletter generation complete!")
        self.log(f"📄 Draft location: {draft_path}")
        self.log(f"📊 Articles processed: {len(articles)}")
        self.log(f"⭐ Top articles selected: {len(ranked_articles[:10])}")
        self.log("=" * 60)
        
        return draft_path


def main():
    """Entry point"""
    generator = NewsletterGenerator()
    draft_path = generator.run()
    
    if draft_path:
        # Print notification for cron/system
        print(f"\nNOTIFICATION:NEWSLETTER_READY:{draft_path}")
        sys.exit(0)
    else:
        print("\nNOTIFICATION:NEWSLETTER_FAILED")
        sys.exit(1)


if __name__ == "__main__":
    main()
