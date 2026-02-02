#!/usr/bin/env python3
"""
Newsletter Runner - Direct execution version
Uses exec calls for web search/fetch
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

WORKSPACE_DIR = Path("/home/ubuntu/.openclaw/workspace/newsletter")
DRAFTS_DIR = WORKSPACE_DIR / "drafts"
LOGS_DIR = WORKSPACE_DIR / "logs"

def log_message(msg: str):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] {msg}"
    print(log_entry)
    
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOGS_DIR / f"runner_{datetime.now().strftime('%Y%m%d')}.log"
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(log_entry + '\n')

def web_search_query(query: str, count: int = 5):
    """Execute web search using openclaw CLI"""
    try:
        cmd = [
            "python3", "-c",
            f"""
import sys
sys.path.insert(0, '/home/ubuntu/.openclaw')
# Import and execute search
try:
    from skills.web_search import web_search
    results = web_search('{query}', count={count}, freshness='pw')
    print(json.dumps(results, default=str))
except Exception as e:
    print(json.dumps({{}}))
"""
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0 and result.stdout.strip():
            try:
                return json.loads(result.stdout)
            except:
                pass
    except Exception as e:
        log_message(f"Search error: {e}")
    return []

def main():
    log_message("=" * 60)
    log_message("NEWSLETTER AUTOMATION RUNNER STARTED")
    log_message("=" * 60)
    
    try:
        # Search queries
        queries = [
            "robotics funding round 2025",
            "robotics acquisition merger 2025", 
            "AI robotics breakthrough",
            "humanoid robot news",
            "autonomous robots technology",
            "industrial automation funding",
            "robotics startup investment",
        ]
        
        all_results = []
        
        for query in queries:
            log_message(f"Searching: {query}")
            try:
                results = web_search_query(query, count=5)
                if results and isinstance(results, list):
                    for item in results:
                        if isinstance(item, dict):
                            item['source_query'] = query
                            item['discovered_at'] = datetime.now().isoformat()
                    all_results.extend(results)
                    log_message(f"  ✓ Found {len(results)} results")
                else:
                    log_message(f"  ✗ No results")
            except Exception as e:
                log_message(f"  ✗ Error: {e}")
        
        log_message(f"\nTotal articles discovered: {len(all_results)}")
        
        if not all_results:
            log_message("⚠️ No articles found. Creating fallback newsletter.")
            create_fallback_newsletter()
            return
        
        # Rank articles
        ranked = rank_articles(all_results)
        
        # Generate newsletter
        newsletter = generate_newsletter_content(ranked)
        
        # Save draft
        draft_path = save_newsletter(newsletter, ranked)
        
        log_message("\n" + "=" * 60)
        log_message("✅ NEWSLETTER GENERATION COMPLETE")
        log_message(f"📄 Draft saved: {draft_path}")
        log_message("=" * 60)
        
        # Output for notification system
        print(f"\nNEWSLETTER_READY:{draft_path}")
        
        # Send Telegram notification
        send_telegram_notification(draft_path)
        
    except Exception as e:
        log_message(f"\n❌ ERROR: {e}")
        import traceback
        log_message(traceback.format_exc())
        sys.exit(1)

def score_article(article: dict) -> int:
    """Score article relevance"""
    title = str(article.get('title', '')).lower()
    snippet = str(article.get('snippet', '')).lower()
    text = f"{title} {snippet}"
    
    score = 0
    keywords = [
        ('breakthrough', 10), ('funding', 8), ('raises', 8), ('million', 7),
        ('billion', 9), ('acquisition', 7), ('acquired', 7), ('merger', 7),
        ('investment', 6), ('venture capital', 6), ('series a', 7),
        ('series b', 8), ('series c', 9), ('ipo', 8), ('startup', 3),
        ('ai', 3), ('humanoid', 4), ('autonomous', 3)
    ]
    
    for keyword, weight in keywords:
        if keyword in text:
            score += weight
    
    return score

def rank_articles(articles: list) -> list:
    """Rank and deduplicate articles"""
    for article in articles:
        article['score'] = score_article(article)
    
    sorted_articles = sorted(articles, key=lambda x: x.get('score', 0), reverse=True)
    
    seen_urls = set()
    unique = []
    for article in sorted_articles:
        url = article.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique.append(article)
    
    return unique[:5]  # Top 5 articles only

def categorize_article(article: dict) -> str:
    """Categorize article"""
    text = f"{article.get('title', '')} {article.get('snippet', '')}".lower()
    
    if any(kw in text for kw in ['breakthrough', 'innovation', 'new technology']):
        return "Breakthrough"
    elif any(kw in text for kw in ['funding', 'raises', 'investment', 'series']):
        return "Funding"
    elif any(kw in text for kw in ['acquisition', 'acquired']):
        return "Acquisition"
    elif any(kw in text for kw in ['merger', 'merged']):
        return "Merger"
    elif any(kw in text for kw in ['strategy', 'investor']):
        return "Strategy"
    return "Industry News"

def generate_newsletter_content(articles: list) -> str:
    """Generate newsletter content in Italian"""
    today = datetime.now()
    date_str = today.strftime('%d %B %Y')
    issue_num = today.strftime('%Y%m%d')
    
    lines = []
    
    # Header
    lines.extend([
        "=" * 70,
        "🤖 NEWSLETTER ROBOTICA - Edizione Italiana",
        f"📅 {date_str} | Numero #{issue_num}",
        "=" * 70,
        ""
    ])
    
    # Introduction
    lines.extend([
        "📋 INTRODUZIONE",
        "-" * 70,
        "",
        "Benvenuti nella newsletter settimanale dedicata al mondo della robotica!",
        "Ogni settimana selezioniamo le notizie più rilevanti su innovazioni,",
        "finanziamenti, acquisizioni e strategie di investimento nel settore",
        "della robotica e dell'automazione intelligente.",
        "",
        f"In questa edizione: I 5 articoli più rilevanti della settimana",
        "nel panorama robotics globale, selezionati per te.",
        "",
    ])
    
    # Highlights
    lines.extend([
        "🎯 HIGHLIGHTS DELLA SETTIMANA",
        "-" * 70,
        ""
    ])
    
    emojis = {"Breakthrough": "💡", "Funding": "💰", "Acquisition": "🤝",
              "Merger": "🔗", "Strategy": "📊", "Industry News": "📰"}
    
    for i, article in enumerate(articles[:5], 1):
        cat = categorize_article(article)
        title = article.get('title', 'N/A')[:70]
        lines.append(f"{i}. {emojis.get(cat, '📰')} [{cat}] {title}")
    
    lines.extend(["", "=" * 70, ""])
    
    # Detailed sections - Top 5 Articles
    lines.extend([
        "📰 TOP 5 ARTICOLI DETTAGLIATI",
        "-" * 70,
        ""
    ])
    
    for i, article in enumerate(articles[:5], 1):
        cat = categorize_article(article)
        title = article.get('title', 'N/A')
        url = article.get('url', '')
        snippet = str(article.get('snippet', 'N/A'))[:400]
        
        lines.extend([
            f"{i}. {emojis.get(cat, '📰')} [{cat}] {title}",
            f"   🔗 {url[:65]}..." if len(str(url)) > 65 else f"   🔗 {url}",
            f"   📝 {snippet}...",
            ""
        ])
    
    # Investor Spotlight
    lines.extend([
        "💼 INVESTOR SPOTLIGHT",
        "-" * 70,
        "",
        "📈 Trend di Investimento:",
        "Le ultime settimane hanno visto un aumento significativo degli investimenti",
        "in robotica umanoide e automazione industriale. I venture capitalist",
        "stanno puntando forte su startup che combinano IA generativa con",
        "capacità robotiche avanzate.",
        "",
        "🎯 Opportunità da Monitorare:",
        "• Robotica collaborativa (cobots) in ambito industriale",
        "• Soluzioni di automazione per logistica e magazzino", 
        "• Robot medici e chirurgici",
        "• Veicoli autonomi e droni commerciali",
        "",
        "💡 Strategia Consigliata:",
        "Diversificare il portafoglio tra robotica industriale matura e startup",
        "innovative nel settore AI-robotics. Attenzione alle aziende con",
        "partnership strategiche consolidate.",
        "",
    ])
    
    # Conclusion
    lines.extend([
        "🎯 CONCLUSIONE",
        "-" * 70,
        "",
        "Grazie per aver letto questa edizione della nostra newsletter!",
        "Il settore della robotica continua a evolversi rapidamente.",
        "",
        "📬 Suggerimenti o approfondimenti? Contattaci per feedback.",
        "",
        "🔄 Inoltra questa newsletter a colleghi interessati alla robotica!",
        "",
        f"Prossima edizione: {'Giovedì' if datetime.now().weekday() == 0 else 'Lunedì'}",
        "",
    ])
    
    # Footer
    lines.extend([
        "=" * 70,
        "Generato dal Robotics Newsletter Automation System",
        f"Data generazione: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "=" * 70,
    ])
    
    return '\n'.join(lines)

def save_newsletter(content: str, articles: list) -> Path:
    """Save newsletter to file"""
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    draft_path = DRAFTS_DIR / f"newsletter_{timestamp}.txt"
    
    with open(draft_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Save metadata
    meta_path = DRAFTS_DIR / f"metadata_{timestamp}.json"
    metadata = {
        'generated_at': datetime.now().isoformat(),
        'article_count': len(articles),
        'top_articles': [
            {'title': a.get('title'), 'url': a.get('url'), 'score': a.get('score')}
            for a in articles[:5]
        ]
    }
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    return draft_path

def create_fallback_newsletter():
    """Create a fallback newsletter"""
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    
    content = f"""
🤖 NEWSLETTER ROBOTICA - Edizione Italiana
📅 {datetime.now().strftime('%d %B %Y')}

📋 NOTA
Purtroppo non sono stati trovati articoli rilevanti per questa edizione.
Riproveremo nella prossima sessione programmata.

Grazie per la pazienza.
"""
    draft_path = DRAFTS_DIR / f"newsletter_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(draft_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"NEWSLETTER_READY:{draft_path}")

def send_telegram_notification(draft_path: Path):
    """Send Telegram notification when newsletter is ready"""
    try:
        # Load notification config
        config_path = WORKSPACE_DIR / "config/notifications.json"
        if not config_path.exists():
            log_message("⚠️ Notification config not found")
            return
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        telegram_config = config.get('telegram', {})
        if not telegram_config.get('enabled', False):
            return
        
        # Get notification details
        notify_on_ready = telegram_config.get('notify_on_ready', True)
        if not notify_on_ready:
            return
        
        # Prepare message
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M UTC')
        message = f"""🤖 *Newsletter Pronta!*

📄 Draft: `{draft_path.name}`
🕐 {timestamp}
📍 Path: `{str(draft_path)}`

✅ Il draft è pronto per la revisione!
Controlla e premi 'Invia' quando sei pronto.
"""
        
        # Log the notification
        log_message("📱 Telegram notification would be sent:")
        log_message(f"   Message: {message[:100]}...")
        
        # Save notification to file for OpenClaw to pick up
        notify_file = WORKSPACE_DIR / "notifications" / f"telegram_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        notify_file.parent.mkdir(parents=True, exist_ok=True)
        with open(notify_file, 'w') as f:
            f.write(message)
        
        log_message(f"   ✓ Notification saved to: {notify_file}")
        
    except Exception as e:
        log_message(f"⚠️ Telegram notification error: {e}")

if __name__ == "__main__":
    main()
