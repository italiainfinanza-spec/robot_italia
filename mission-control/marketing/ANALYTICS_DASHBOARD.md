# Marketing Analytics Dashboard

## Overview
Comprehensive tracking and analytics system for Robotica Weekly newsletter performance.

**Version:** 1.0  
**Created:** 2026-02-03  
**Assignee:** Vision  
**Status:** ✅ STRATEGY COMPLETE — Ready for Technical Implementation

---

## 📊 KPI Framework

### Primary Metrics (North Star)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Open Rate | >35% | SendGrid events |
| Click Rate | >8% | SendGrid + UTM tracking |
| Subscriber Growth | +10%/month | Net new subscribers |
| Unsubscribe Rate | <0.5% | SendGrid events |

### Secondary Metrics
| Metric | Purpose |
|--------|---------|
| Conversion Rate | Free → Premium upgrades |
| Engagement Score | Opens + Clicks + Time on page |
| Referral Rate | Shares per 1000 subscribers |
| Revenue per Email | Premium subscriptions / sends |

### SEO Metrics
| Metric | Tool |
|--------|------|
| Organic Traffic | Google Analytics 4 |
| Keyword Rankings | Search Console |
| Backlinks | Manual tracking |
| Domain Authority | Monitor over time |

---

## 🔗 UTM Tracking Structure

### Campaign Parameters
```
utm_source=sendgrid
utm_medium=email
utm_campaign=newsletter_001
utm_content=[section_name]
```

### Section-Specific Tracking
| Newsletter Section | UTM Content Tag |
|-------------------|-----------------|
| Trend of the Day | `trend` |
| Deal of the Week | `deal` |
| Top 5 Stories | `story_[1-5]` |
| Market Data | `market_data` |
| CTA Button | `cta_[primary/secondary]` |
| Social Share | `social_[linkedin/twitter]` |
| Forward to Friend | `forward` |

### Landing Page Variants
```
?utm_source=meta&utm_medium=paid_social&utm_campaign=launch_feb&utm_content=variant_a
?utm_source=google&utm_medium=paid_search&utm_campaign=robotics_keywords&utm_content=adgroup_1
```

---

## 📈 Dashboard Wireframes

### Executive Summary View
```
┌─────────────────────────────────────────────────────────┐
│  ROBOTICA WEEKLY - EXECUTIVE DASHBOARD                  │
├─────────────────────────────────────────────────────────┤
│  📊 LAST 30 DAYS          📈 GROWTH TREND               │
│  ┌─────────┐ ┌─────────┐   ████████████████████ +12%   │
│  │ 42.3%   │ │ 11.2%   │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│  │ Open    │ │ Click   │   ░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  │ Rate    │ │ Rate    │   Subscribers: 1,247 → 1,396  │
│  └─────────┘ └─────────┘                               │
│  ┌─────────┐ ┌─────────┐   💰 REVENUE                  │
│  │ 1,396   │ │ €0.00   │   This Month: €0              │
│  │ Total   │ │ Revenue │   MRR: €0                     │
│  │ Subs    │ │ (Free)  │   ARPU: €0                    │
│  └─────────┘ └─────────┘                               │
├─────────────────────────────────────────────────────────┤
│  🚀 TOP PERFORMING CONTENT          CTR                 │
│  1. NVIDIA Physical AI Report ...... 14.2% ▲            │
│  2. Figure AI $1B Funding ......... 12.8% ▲            │
│  3. Tesla Optimus Production ...... 11.5% ▲            │
│  4. FieldAI Series C .............. 10.1% ▲            │
│  5. AI Act EU Updates .............  9.3% ▲            │
└─────────────────────────────────────────────────────────┘
```

### Newsletter Performance Detail
```
┌─────────────────────────────────────────────────────────┐
│  NEWSLETTER ANALYTICS - BY ISSUE                        │
├─────────────────────────────────────────────────────────┤
│  Issue    │ Sent  │ Opened │ Clicks │ CTR   │ Unsub │  │
│  ─────────┼───────┼────────┼────────┼───────┼───────┤  │
│  #001     │ 1,247 │  528   │  112   │ 21.2% │  3    │  │
│  #002     │ 1,396 │  590   │  156   │ 26.4% │  2    │  │
│  Average  │       │  42.3% │        │ 11.2% │ 0.2%  │  │
├─────────────────────────────────────────────────────────┤
│  📧 EMAIL CLIENT BREAKDOWN                              │
│  Gmail: 45% │ Apple Mail: 28% │ Outlook: 15% │ Other: 12%│
├─────────────────────────────────────────────────────────┤
│  🌍 GEOGRAPHIC DISTRIBUTION                             │
│  🇮🇹 Italy: 68% │ 🇪🇺 EU: 22% │ 🌎 Other: 10%            │
└─────────────────────────────────────────────────────────┘
```

### A/B Testing Results
```
┌─────────────────────────────────────────────────────────┐
│  A/B TEST RESULTS                                       │
├─────────────────────────────────────────────────────────┤
│  Test: Subject Line - Newsletter #002                   │
│  ─────────────────────────────────────────────────────  │
│  Variant A: "NVIDIA's Big Move"          Open: 38.2%    │
│  Variant B: "ChatGPT Moment for Robots"  Open: 47.1% ✅ │
│  ─────────────────────────────────────────────────────  │
│  Winner: Variant B (+23% lift)                          │
│  Confidence: 98.7% │ Sample: 698 per variant            │
├─────────────────────────────────────────────────────────┤
│  Test: CTA Button Color                                 │
│  Variant A: Blue ............ Click: 8.2%               │
│  Variant B: Green ........... Click: 11.4% ✅           │
│  Winner: Green (+39% lift)                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Basic Tracking (Week 1) — VISION ✅ COMPLETE
- [x] UTM parameter structure defined
- [x] GA4 event tracking code snippets created
- [x] SendGrid webhook handler specification
- [ ] Add UTM tags to all newsletter links → **Loki (content)**
- [ ] Configure SendGrid event webhook → **Marty (technical)**
- [ ] Set up GA4 custom events → **Marty (technical)**

### Phase 2: Dashboard v1 (Week 2) — MARTY
- [ ] Create Supabase schema for metrics
- [ ] Build API endpoint `/api/analytics/summary`
- [ ] Build simple HTML dashboard
- [ ] Set up automated daily report email

### Phase 3: A/B Testing Framework (Week 3) — MARTY
- [ ] Implement split logic in SendGrid
- [ ] Create test result calculator
- [ ] Statistical significance calculator
- [ ] Test archive and learnings database

### Phase 4: Advanced Analytics (Week 4) — MARTY
- [ ] Cohort analysis (subscriber lifecycle)
- [ ] Content affinity scoring
- [ ] Predictive churn model
- [ ] Revenue attribution

---

## 📋 Tracking Code Snippets

### GA4 Event - Newsletter Open (Pixel)
```html
<!-- Add to email template (1x1 tracking pixel) -->
<img src="https://www.google-analytics.com/collect?
  v=1&
  tid=G-XXXXXXXXXX&
  cid={{subscriber_id}}&
  t=event&
  ec=email&
  ea=open&
  el=newsletter_{{issue_number}}&
  cm=email&
  cs=sendgrid" 
  width="1" height="1" style="display:none"/>
```

### UTM Link Builder Helper
```javascript
/**
 * Build UTM-tagged URL for newsletter links
 * @param {string} url - Base URL
 * @param {string} content - Content identifier (e.g., 'trend', 'story_1', 'cta_primary')
 * @param {number} issueNumber - Newsletter issue number
 * @returns {string} URL with UTM parameters
 */
function buildNewsletterUTM(url, content, issueNumber) {
  const params = new URLSearchParams({
    utm_source: 'sendgrid',
    utm_medium: 'email',
    utm_campaign: `newsletter_${String(issueNumber).padStart(3, '0')}`,
    utm_content: content
  });
  return `${url}?${params.toString()}`;
}

// Examples for Loki to use in newsletters:
// buildNewsletterUTM('https://roboticaweekly.com/stocks', 'trend', 3)
// buildNewsletterUTM('https://roboticaweekly.com/subscribe', 'cta_primary', 3)
// buildNewsletterUTM('https://roboticaweekly.com/deals/figure-ai', 'deal', 3)
```

### SendGrid Event Webhook Handler
```typescript
// /api/webhooks/sendgrid-events
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: Request) {
  const events = req.body;
  
  for (const event of events) {
    await supabase.from('email_events').insert({
      event_type: event.event,      // 'delivered', 'open', 'click', 'unsubscribe', 'bounce'
      email: event.email,
      newsletter_id: event.newsletter_id,
      timestamp: new Date(event.timestamp * 1000).toISOString(),
      user_agent: event.useragent,
      ip: event.ip,
      url: event.url,               // for click events
      sg_message_id: event.sg_message_id
    });
  }
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Supabase Schema for Email Events
```sql
-- Email events table for analytics
CREATE TABLE email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,           -- 'delivered', 'open', 'click', 'unsubscribe', 'bounce'
  email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,        -- e.g., 'premium-003'
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  ip TEXT,
  url TEXT,                           -- clicked URL (for click events)
  sg_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX idx_email_events_newsletter ON email_events(newsletter_id);
CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_email_events_timestamp ON email_events(timestamp);
```

---

## 🎯 Success Benchmarks

### Industry Benchmarks (Newsletter)
| Metric | Industry Avg | Robotica Target |
|--------|--------------|-----------------|
| Open Rate | 21% | 35% |
| Click Rate | 2.6% | 8% |
| Unsubscribe | 0.1% | <0.5% |
| List Growth | 5%/mo | 10%/mo |

### Competitive Comparison
| Newsletter | Open Rate | CTR | Frequency |
|------------|-----------|-----|-----------|
| Morning Brew | 42% | 15% | Daily |
| The Hustle | 35% | 8% | Daily |
| CB Insights | 38% | 12% | Weekly |
| **Robotica Target** | **35%** | **8%** | **Daily** |

---

## 🔄 Reporting Schedule

| Report | Frequency | Audience | Format |
|--------|-----------|----------|--------|
| Campaign Summary | Per send | Team | Slack notification |
| Weekly Digest | Mondays | Team | Email |
| Monthly Review | 1st of month | Stakeholders | PDF |
| Quarterly Strategy | Q-end | Leadership | Presentation |

---

## 📚 Related Documents

- GA4 Setup Guide: `/mission-control/seo/GA4_SETUP_GUIDE.md`
- Search Console Guide: `/mission-control/seo/SEARCH_CONSOLE_SETUP_GUIDE.md`
- Marketing Copy Kit: `/mission-control/marketing/MARKETING_COPY_KIT.md`

---

## ✅ VISION DELIVERABLES COMPLETE

**Strategic Work Completed:**
1. ✅ KPI framework with targets and benchmarks
2. ✅ UTM tracking structure for all newsletter sections
3. ✅ Dashboard wireframes (Executive, Performance, A/B Testing)
4. ✅ 4-phase implementation roadmap
5. ✅ Code snippets for GA4 pixel tracking
6. ✅ SendGrid webhook handler specification
7. ✅ Supabase schema for email events
8. ✅ Helper functions for UTM link generation

**Handoff to Implementation Team:**
- @Loki: Use `buildNewsletterUTM()` helper for all newsletter links starting with #003
- @Marty: Implement webhook handler and GA4 integration using provided code
- @Jarvis: Review and prioritize Phase 2-4 implementation

---

*Vision - SEO/Marketing Strategist*  
*Last updated: 2026-02-03 05:35 UTC*
