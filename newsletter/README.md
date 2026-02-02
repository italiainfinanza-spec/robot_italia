# 🤖 Italian Robotics Newsletter Automation System

A fully automated system for discovering, curating, and generating Italian-language robotics newsletters twice weekly.

## 📋 Overview

This system automatically:
1. **Discovers** robotics news from multiple sources (funding, acquisitions, breakthroughs)
2. **Ranks** articles by relevance, timeliness, and impact
3. **Generates** professional newsletters in Italian
4. **Delivers** drafts ready for human review

## 📅 Schedule

- **Monday**: 9:00 AM UTC
- **Thursday**: 9:00 AM UTC

## 🗂️ Directory Structure

```
newsletter/
├── scripts/
│   ├── run_newsletter.py      # Main automation script
│   ├── generate_newsletter.py  # Standalone generator
│   ├── setup_cron.sh          # Cron job installer
│   └── generate_now.sh        # Manual trigger
├── drafts/                    # Generated newsletter drafts
├── archive/                   # Archived newsletters
├── logs/                      # Execution logs
└── templates/                 # Newsletter templates
```

## 🚀 Quick Start

### 1. Install Cron Jobs (Automated)

```bash
cd /home/ubuntu/.openclaw/workspace/newsletter/scripts
bash setup_cron.sh
```

This installs the twice-weekly schedule automatically.

### 2. Generate Newsletter Manually

```bash
cd /home/ubuntu/.openclaw/workspace/newsletter/scripts
bash generate_now.sh
```

Or directly with Python:
```bash
cd /home/ubuntu/.openclaw/workspace/newsletter/scripts
PYTHONPATH=/home/ubuntu/.openclaw python3 run_newsletter.py
```

### 3. Check Output

Drafts are saved to:
```
/home/ubuntu/.openclaw/workspace/newsletter/drafts/newsletter_YYYYMMDD_HHMMSS.txt
```

## 📊 Content Discovery

The system searches for:

| Category | Keywords |
|----------|----------|
| **Funding** | funding round, raises, series A/B/C, investment |
| **Acquisitions** | acquisition, acquired, merger, merged |
| **Breakthroughs** | breakthrough, innovation, new technology |
| **AI Robotics** | AI robotics, humanoid robot, autonomous robots |
| **Industry** | industrial automation, venture capital, startups |

## 🎯 Prioritization

Articles are scored based on:
- **Breakthroughs**: 10 points
- **Funding/Billion**: 9 points
- **Series C/IPO**: 8-9 points
- **Acquisitions/Mergers**: 7 points
- **AI/Humanoid mentions**: 3-4 points

## 📝 Newsletter Structure

```
🤖 NEWSLETTER ROBOTICA
├── 📋 Introduzione
├── 🎯 Highlights della Settimana (Top 5)
├── 💡 Breakthrough (Top stories)
├── 💰 Funding (Investment news)
├── 🤝 Acquisitions
├── 🔗 Mergers
├── 📊 Strategy
├── 💼 Investor Spotlight
└── 🎯 Conclusione + CTA
```

## 📧 Email Integration Guide

### Option 1: SendGrid Integration

Add to `scripts/email_sender.py`:

```python
import sendgrid
from sendgrid.helpers.mail import Mail

def send_newsletter(draft_path: str, recipients: list):
    sg = sendgrid.SendGridAPIClient(api_key='YOUR_API_KEY')
    
    with open(draft_path, 'r') as f:
        content = f.read()
    
    message = Mail(
        from_email='newsletter@yourdomain.com',
        to_emails=recipients,
        subject='🤖 Newsletter Robotica - Edizione del {}'.format(date.today()),
        plain_text_content=content
    )
    
    response = sg.send(message)
    return response.status_code
```

### Option 2: AWS SES Integration

```python
import boto3

def send_via_ses(draft_path: str, recipients: list):
    client = boto3.client('ses', region_name='us-east-1')
    
    with open(draft_path, 'r') as f:
        content = f.read()
    
    response = client.send_email(
        Source='newsletter@yourdomain.com',
        Destination={'ToAddresses': recipients},
        Message={
            'Subject': {'Data': '🤖 Newsletter Robotica'},
            'Body': {'Text': {'Data': content}}
        }
    )
    return response['MessageId']
```

### Option 3: SMTP Integration

```python
import smtplib
from email.mime.text import MIMEText

def send_via_smtp(draft_path: str, recipients: list):
    with open(draft_path, 'r') as f:
        content = f.read()
    
    msg = MIMEText(content)
    msg['Subject'] = '🤖 Newsletter Robotica'
    msg['From'] = 'newsletter@yourdomain.com'
    msg['To'] = ', '.join(recipients)
    
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('your-email@gmail.com', 'app-password')
        server.send_message(msg)
```

### Integration Steps

1. **Create email config file**:
```bash
touch /home/ubuntu/.openclaw/workspace/newsletter/config/email.conf
```

2. **Add API keys** (never commit to git!):
```json
{
  "provider": "sendgrid",
  "api_key": "your-api-key",
  "from_email": "newsletter@yourdomain.com",
  "recipients": ["subscriber1@example.com", "subscriber2@example.com"]
}
```

3. **Modify run_newsletter.py** to call email sender after generation

## 🔧 Customization

### Modify Search Queries

Edit `run_newsletter.py` and update the `queries` list:

```python
queries = [
    "your custom query",
    "another query",
    # ...
]
```

### Change Schedule

Edit cron jobs:
```bash
crontab -e
```

Modify the timing:
```
# Format: minute hour day month weekday
0 9 * * 1  # Monday 9 AM
0 9 * * 4  # Thursday 9 AM
```

### Adjust Prioritization

Edit the `score_article()` function in `run_newsletter.py` to change weights.

## 📜 Logs

View execution logs:
```bash
# Today's log
tail -f /home/ubuntu/.openclaw/workspace/newsletter/logs/runner_$(date +%Y%m%d).log

# All logs
ls -la /home/ubuntu/.openclaw/workspace/newsletter/logs/
```

## 🔔 Notifications

The system outputs status notifications:
```
NEWSLETTER_READY:/path/to/draft.txt
```

Hook into this for Slack/Discord notifications:
```bash
# Add to cron job
./run_newsletter.py | grep NEWSLETTER_READY | xargs -I {} curl -X POST YOUR_WEBHOOK_URL
```

## 🛠️ Troubleshooting

### No articles found
- Check web_search tool availability
- Verify internet connectivity
- Review logs for errors

### Cron job not running
- Verify cron is installed: `which cron`
- Check cron logs: `grep CRON /var/log/syslog`
- Ensure scripts are executable: `chmod +x *.sh *.py`

### Permission errors
```bash
chmod -R 755 /home/ubuntu/.openclaw/workspace/newsletter/scripts/
```

## 📈 Future Enhancements

- [ ] Translation API integration (DeepL/Google Translate)
- [ ] Subscriber management system
- [ ] HTML email templates
- [ ] Click/open tracking
- [ ] A/B testing for subject lines
- [ ] RSS feed integration
- [ ] Social media auto-posting

## 📄 License

Private use only - customize for your needs!

---

**Created**: OpenClaw Automation System
**Last Updated**: 2025
