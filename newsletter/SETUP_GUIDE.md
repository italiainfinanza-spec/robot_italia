# 🔧 Setup Guide - SendGrid & Telegram

## 1️⃣ SendGrid Email Setup

### Get Your API Key

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Go to Settings → API Keys
3. Create API Key with "Full Access" or "Mail Send" permissions
4. Copy the key (starts with `SG.`)

### Configure the Newsletter

Edit the config file:
```bash
nano /home/ubuntu/.openclaw/workspace/newsletter/config/email_config.json
```

Replace:
```json
{
  "email_provider": "sendgrid",
  "providers": {
    "sendgrid": {
      "api_key": "SG.your_api_key_here",
      "enabled": true
    }
  },
  "newsletter": {
    "from_name": "Robotics Newsletter Italia",
    "from_email": "newsletter@yourdomain.com",
    "reply_to": "your-email@example.com",
    "subject_template": "🤖 Newsletter Robotica - {date}"
  },
  "recipients": {
    "subscribers": [
      "subscriber1@gmail.com",
      "subscriber2@gmail.com"
    ],
    "admin": [
      "your-email@example.com"
    ]
  },
  "delivery": {
    "auto_send": false,
    "require_approval": true,
    "send_test_first": true
  }
}
```

### Test Email

```bash
cd /home/ubuntu/.openclaw/workspace/newsletter/scripts
python3 email_sender.py --test
```

---

## 2️⃣ Telegram Notifications

You already have Telegram set up! The system will:

1. Generate the newsletter draft
2. Send you a Telegram message when it's ready
3. You review and approve

### Notification Format

You'll receive:
```
🤖 Newsletter Pronta!

📄 Draft: newsletter_20250203_073000.txt
🕐 2025-02-03 07:30 UTC
📍 Path: /home/ubuntu/.openclaw/workspace/newsletter/drafts/...

✅ Il draft è pronto per la revisione!
Controlla e premi 'Invia' quando sei pronto.
```

### View Draft

When you get the notification:
```bash
cat /home/ubuntu/.openclaw/workspace/newsletter/drafts/newsletter_*.txt | head -50
```

---

## 3️⃣ Schedule Summary

✅ **Updated Schedule: 7:30 AM UTC**
- Monday 7:30 AM (perfect for commute!)
- Thursday 7:30 AM

**Timezone Reference:**
| UTC | Italy | NY | SF |
|-----|-------|-----|-----|
| 7:30 AM | 8:30 AM | 2:30 AM | 11:30 PM (prev) |

Perfect timing for European commute! 🇮🇹

---

## 4️⃣ Top 5 Articles Only

✅ **Updated to Top 5 articles**
- Concise, scannable format
- Perfect for mobile reading
- Quick commute consumption

---

## 5️⃣ Quick Test

### Test Now

```bash
cd /home/ubuntu/.openclaw/workspace/newsletter/scripts
bash generate_now.sh
```

### Check Output

```bash
ls -la /home/ubuntu/.openclaw/workspace/newsletter/drafts/
cat /home/ubuntu/.openclaw/workspace/newsletter/drafts/newsletter_*.txt
```

---

## 6️⃣ X (Twitter) Integration

See `docs/X_API_INTEGRATION.md` for full details.

**Quick Summary:**
- X API Basic: $100/month
- Alternative: Use web search + manual curation
- Recommendation: Start free, upgrade later

---

## 📋 Pre-Flight Checklist

- [ ] SendGrid API key obtained
- [ ] Email config updated with your API key
- [ ] Subscribers list added
- [ ] Test email sent successfully
- [ ] Telegram notifications working
- [ ] Cron schedule verified (7:30 AM)
- [ ] Manual test run completed

---

## 🚀 You're Ready!

Your newsletter will now:
1. Run automatically at 7:30 AM Monday & Thursday
2. Generate Top 5 robotics articles
3. Send you Telegram notification
4. Wait for your review
5. Send via SendGrid when you approve

**Next Monday at 7:30 AM UTC — your first automated newsletter!** 🤖
