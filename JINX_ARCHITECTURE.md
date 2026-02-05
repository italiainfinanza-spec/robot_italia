# JINX ARCHITECTURE CONFIGURATION
## Claude + Kimi Multi-Agent System

**Last Updated:** 2026-02-05 14:46 UTC

---

## 🤖 MODEL CONFIGURATION

### Main Agent (JINX - You)
**Model:** Claude-4.5-opus (Anthropic)
**Role:** Central coordinator, planning, validation, final quality control
**API Key:** ✅ Configured

### Subagents (All Kimi)
**Default Model:** Moonshot Kimi-k2.5
**Fast Tasks:** Moonshot Kimi-k2.5-turbo
**Role:** Heavy lifting (research, writing, coding)

---

## 📋 DELEGATION FORMAT

```xml
<subagent name="researcher|analyst|writer|coder">
[Concise task description]
</subagent>
```

### Subagent Specializations:

**researcher** (Kimi-k2.5)
- Web search, data gathering
- RSS feeds, X/Twitter search
- Fact verification

**analyst** (Kimi-k2.5)
- Rank news by impact
- Investor relevance scoring
- Competitive analysis

**writer** (Kimi-k2.5)
- Draft content (Italian/English)
- 1200 words max
- Engaging investor tone

**coder** (Kimi-k2.5)
- Implementation tasks
- HTML/CSS/JS/React
- API integrations

---

## 💰 COST OPTIMIZATION

### Rules Applied:
✅ **Concise responses** enforced for all subagents
✅ **Max 180k tokens** per session (auto-prune)
✅ **Weekly session cleanup** enabled
✅ **Moonshot caching** maximized
✅ **Low temperature** (0.3) for consistency

### Expected Cost Savings:

| Scenario | Before (All Kimi) | After (Claude+Kimi) | Savings |
|----------|-------------------|---------------------|---------|
| **Per complex task** | $0.70 | $0.32 | **54%** |
| **Newsletter (2x/week)** | $1.40 | $0.64 | **54%** |
| **Monthly cost** | $5.60 | $2.56 | **$3.04 saved** |

**Annual projection:** ~$36 saved with better quality!

---

## 📧 NEWSLETTER WORKFLOW (AUTOMATED)

### Cron Schedule:
- **Monday 09:00 UTC** → Newsletter #1
- **Thursday 09:00 UTC** → Newsletter #2

### Pipeline:
```
1. researcher (Kimi) → Find top 5 news
2. analyst (Kimi) → Rank by impact
3. writer (Kimi) → Draft 1200 words
4. Jinx (Claude) → Review & polish
5. Send → Email/Substack/Beehiiv
```

### Cron Jobs Active:
✅ `newsletter-monday` - ID: 2c487f5a-76c7-4e3b-9aab-a5001c9894be
✅ `newsletter-thursday` - ID: a68b03e6-21a5-400e-a146-26ba78890be5

---

## 🔧 SYSTEM LIMITS

| Setting | Value |
|---------|-------|
| Max session tokens | 180,000 |
| Prune after | 7 days |
| Subagent timeout | 300 seconds |
| Default temperature | 0.3 |
| Response style | Concise |

---

## ✅ ARCHITECTURE STATUS

**Status:** 🟢 **LIVE**

- ✅ Claude API key configured
- ✅ Kimi subagents ready
- ✅ Newsletter cron jobs active
- ✅ Cost optimization rules enabled
- ✅ Session limits enforced

**Next test:** Next Monday 09:00 UTC (newsletter automation)

---

## 🚀 READY TO OPERATE

**Jinx is now the central coordinator.**
All heavy lifting delegated to Kimi subagents.
Final quality control by Claude.

**Let's build the best robotics newsletter! 🤖📈**