# 🐦 X (Twitter) API Integration Guide

X (formerly Twitter) is where most robotics builders and investors hang out. Here's how to integrate it into your newsletter.

## ⚠️ Important: X API Pricing Changes

X completely changed their API pricing in 2023. Current tiers:

| Tier | Price | Access | Best For |
|------|-------|--------|----------|
| **Free** | $0 | Very limited (1,500 tweets/month read-only) | Testing only |
| **Basic** | $100/month | 10,000 tweets/month | Small apps |
| **Pro** | $5,000/month | 1M tweets/month | Commercial use |
| **Enterprise** | Custom | Unlimited | Large platforms |

**Reality Check**: For newsletter curation, the **Basic tier ($100/month)** is the minimum viable option.

---

## 🔄 Alternative: Nitter/RSS Workarounds

Since X API is expensive, here are practical alternatives:

### Option 1: RSS Feeds via Nitter Instances

Nitter is a free alternative frontend for Twitter that provides RSS feeds:

```python
# Follow robotics accounts via RSS
RSS_FEEDS = [
    "https://nitter.net/SpaceX/rss",           # SpaceX
    "https://nitter.net/Tesla/rss",            # Tesla/Boston Dynamics
    "https://nitter.net/AndrewYNg/rss",        # Andrew Ng
    "https://nitter.net/davidautomation/rss",  # Automation experts
    # Add more robotics influencers
]
```

**Pros**: Free
**Cons**: Nitter instances often get blocked/rate-limited

### Option 2: Manual Curation + Web Search

Use web search to find X content:

```python
search_queries = [
    "site:twitter.com robotics funding",
    "site:x.com robotics startup",
    "site:twitter.com humanoid robot",
    "site:x.com venture capital robotics",
]
```

### Option 3: Third-Party Services

| Service | Price | Notes |
|---------|-------|-------|
| **SocialSearch** | ~$50/month | Aggregates social media |
| **Mention** | ~$41/month | Social listening tool |
| **Brand24** | ~$79/month | Good for tracking keywords |
| **Talkwalker** | Enterprise | Comprehensive but pricey |

---

## 🛠️ Implementation (If You Get X API Access)

### Step 1: Get API Credentials

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a project and app
3. Generate API Key, Secret, Bearer Token
4. Subscribe to Basic tier ($100/month)

### Step 2: Install Tweepy

```bash
pip install tweepy
```

### Step 3: Create X Scraper Module

Create `scripts/x_scraper.py`:

```python
#!/usr/bin/env python3
"""X (Twitter) scraper for robotics newsletter"""

import tweepy
import json
from datetime import datetime, timedelta
from pathlib import Path

# X API Credentials - Add to config!
BEARER_TOKEN = "YOUR_BEARER_TOKEN"

# Robotics accounts to follow
ROBOTICS_ACCOUNTS = [
    "SpaceX",           # Rockets, future robotics
    "Tesla",            # Optimus robot
    "BostonDynamics",   # Spot, Atlas
    "AgilityRobotics",  # Digit humanoid
    "Figure_robot",     # Figure AI
    "1X_Technologies",  # Humanoid robots
    " SanctuaryAI",     # Phoenix robot
    "AndrewYNg",        # AI/robotics thought leader
    "ptraughber",       # Google Robotics
    "chelseabfinn",     # Stanford AI Lab
]

# Keywords to track
ROBOTICS_KEYWORDS = [
    "robotics funding",
    "robotics startup",
    "humanoid robot",
    "autonomous robots",
    "robotics investment",
    "AI robotics",
]

class XScraper:
    def __init__(self, bearer_token: str):
        self.client = tweepy.Client(bearer_token=bearer_token)
    
    def get_user_tweets(self, username: str, max_results: int = 10):
        """Get recent tweets from a user"""
        try:
            user = self.client.get_user(username=username)
            if not user.data:
                return []
            
            tweets = self.client.get_users_tweets(
                id=user.data.id,
                max_results=max_results,
                tweet_fields=['created_at', 'public_metrics', 'context_annotations'],
                exclude=['retweets', 'replies']
            )
            
            return tweets.data if tweets else []
        except Exception as e:
            print(f"Error fetching {username}: {e}")
            return []
    
    def search_robotics_tweets(self, query: str, max_results: int = 20):
        """Search for robotics-related tweets"""
        try:
            # Add filters for quality
            full_query = f"{query} lang:en -is:retweet -is:reply"
            
            tweets = self.client.search_recent_tweets(
                query=full_query,
                max_results=max_results,
                tweet_fields=['created_at', 'public_metrics', 'author_id'],
                expansions=['author_id'],
                user_fields=['username', 'public_metrics']
            )
            
            if not tweets.data:
                return []
            
            # Build author lookup
            users = {u.id: u for u in tweets.includes['users']} if tweets.includes else {}
            
            results = []
            for tweet in tweets.data:
                author = users.get(tweet.author_id, None)
                results.append({
                    'text': tweet.text,
                    'author': author.username if author else 'unknown',
                    'followers': author.public_metrics['followers_count'] if author else 0,
                    'likes': tweet.public_metrics['like_count'],
                    'retweets': tweet.public_metrics['retweet_count'],
                    'created_at': str(tweet.created_at),
                    'url': f"https://twitter.com/{author.username}/status/{tweet.id}" if author else None
                })
            
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    def discover_content(self) -> list:
        """Full content discovery from X"""
        all_content = []
        
        # Search by keywords
        for keyword in ROBOTICS_KEYWORDS:
            print(f"Searching X for: {keyword}")
            tweets = self.search_robotics_tweets(keyword, max_results=10)
            
            for tweet in tweets:
                tweet['source'] = 'x_search'
                tweet['keyword'] = keyword
                all_content.append(tweet)
        
        # Get tweets from key accounts
        for account in ROBOTICS_ACCOUNTS[:5]:  # Limit to save API calls
            print(f"Fetching from @{account}")
            tweets = self.get_user_tweets(account, max_results=5)
            
            if tweets:
                for tweet in tweets:
                    all_content.append({
                        'text': tweet.text,
                        'author': account,
                        'source': 'x_account',
                        'created_at': str(tweet.created_at),
                        'url': f"https://twitter.com/{account}/status/{tweet.id}"
                    })
        
        return all_content

if __name__ == "__main__":
    scraper = XScraper(BEARER_TOKEN)
    content = scraper.discover_content()
    
    # Save results
    output_path = Path("/home/ubuntu/.openclaw/workspace/newsletter/x_content.json")
    with open(output_path, 'w') as f:
        json.dump(content, f, indent=2)
    
    print(f"Saved {len(content)} items to {output_path}")
```

### Step 4: Integrate with Newsletter

Update `run_newsletter.py` to include X content:

```python
def fetch_x_content():
    """Fetch content from X/Twitter"""
    try:
        import subprocess
        result = subprocess.run(
            ["python3", "x_scraper.py"],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            # Load results
            with open(WORKSPACE_DIR / "x_content.json", 'r') as f:
                return json.load(f)
    except Exception as e:
        log_message(f"X content fetch failed: {e}")
    
    return []
```

---

## 💡 Recommended Approach

**For now, use this hybrid strategy:**

1. **Web Search** (Free) - Primary source
2. **RSS Feeds** (Free) - Secondary backup
3. **Manual X Monitoring** (Free) - You check X manually, add interesting links to a "sources" file

**When budget allows ($100/month):**
- Add X Basic API for real-time builder insights
- Track investor accounts for funding signals
- Monitor hashtag trends

---

## 📋 X Accounts to Follow (Manual List)

Save this for when you get API access:

```json
{
  "robotics_builders": [
    "BostonDynamics",
    "AgilityRobotics", 
    "Figure_robot",
    "1X_Technologies",
    "SanctuaryAI",
    "Tesla",
    "SpaceX"
  ],
  "investors": [
    "eladgil",
    "sama",
    "paulg",
    "sequoia",
    "BessemerVP"
  ],
  "researchers": [
    "AndrewYNg",
    "chelseabfinn",
    "karpathy",
    "drfeifei"
  ]
}
```

---

## 🎯 Bottom Line

**Without X API ($0/month):**
- Web search works great
- RSS feeds as backup
- Manual curation of X content

**With X Basic ($100/month):**
- Automated monitoring of 50+ accounts
- Real-time funding alerts
- Trending topics tracking

**Recommendation**: Start free, upgrade when newsletter revenue justifies it!
