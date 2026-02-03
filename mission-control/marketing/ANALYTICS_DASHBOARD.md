# Marketing Analytics Dashboard

## Overview
Comprehensive tracking and analytics system for Robotica Weekly newsletter performance.

**Version:** 1.0  
**Created:** 2026-02-03  
**Assignee:** Vision  
**Status:** In Progress

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

### Phase 1: Basic Tracking (Week 1)
- [x] UTM parameter structure defined
- [ ] Add UTM tags to all newsletter links
- [ ] Configure SendGrid event webhook
- [ ] Set up GA4 custom events

### Phase 2: Dashboard v1 (Week 2)
- [ ] Create Supabase schema for metrics
- [ ] Build API endpoint `/api/analytics/summary`
- [ ] Build simple HTML dashboard
- [ ] Set up automated daily report email

### Phase 3: A/B Testing Framework (Week 3)
- [ ] Implement split logic in SendGrid
- [ ] Create test result calculator
- [ ] Statistical significance calculator
- [ ] Test archive and learnings database

### Phase 4: Advanced Analytics (Week 4)
- [ ] Cohort analysis (subscriber lifecycle)
- [ ] Content affinity scoring
- [ ] Predictive churn model
- [ ] Revenue attribution

---

## 📋 Tracking Code Snippets

### GA4 Event - Newsletter Open (Pixel)
```html
<img src="https://www.google-analytics.com/collect?
  v=1&
  tid=GA_MEASUREMENT_ID&
  cid={{subscriber_id}}&
  t=event&
  ec=email&
  ea=open&
  el=newsletter_{{issue_number}}&
  cm=email&
  cs=sendgrid" 
  width="1" height="1" style="display:none"/>
```

### UTM Link Builder
```javascript
function buildUTM(url, content) {
  const params = new URLSearchParams({
    utm_source: 'sendgrid',
    utm_medium: 'email',
    utm_campaign: `newsletter_${issueNumber}`,
    utm_content: content
  });
  return `${url}?${params.toString()}`;
}
```

### SendGrid Event Webhook Handler
```javascript
// /api/webhooks/sendgrid-events
export default async function handler(req, res) {
  const events = req.body;
  
  for (const event of events) {
    await supabase.from('email_events').insert({
      event_type: event.event,
      email: event.email,
      newsletter_id: event.newsletter_id,
      timestamp: event.timestamp,
      user_agent: event.useragent,
      ip: event.ip
    });
  }
  
  res.status(200).json({ received: true });
}
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

**Next Steps:**
1. Implement UTM tags in next newsletter
2. Set up SendGrid webhook endpoint
3. Build Phase 1 dashboard
4. Run first A/B test on subject lines

*Vision - SEO/Marketing Strategist*  
*Last updated: 2026-02-03 03:30 UTC*
