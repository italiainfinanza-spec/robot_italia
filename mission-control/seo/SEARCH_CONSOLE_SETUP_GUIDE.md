# Google Search Console Setup Guide
## Robotica Weekly

---

## Overview
Google Search Console (GSC) is essential for monitoring your website's presence in Google search results. It helps you:
- Track search performance and rankings
- Submit sitemaps for indexing
- Identify and fix SEO issues
- Monitor Core Web Vitals
- Receive alerts about problems

---

## Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add property"

---

## Step 2: Add Your Property

Choose verification method:

### Option A: Domain Property (Recommended)
- Enter: `roboticaweekly.com`
- Covers all subdomains and protocols
- Requires DNS verification

### Option B: URL Prefix
- Enter: `https://roboticaweekly.com`
- Easier to verify but limited scope
- Multiple verification methods available

---

## Step 3: Verify Ownership

### Method 1: HTML File Upload (Easiest for Static Sites)
1. Download the verification HTML file from GSC
2. Upload to: `/home/ubuntu/.openclaw/workspace/newsletter/website/googleXXXXXX.html`
3. Verify it's accessible at: `https://roboticaweekly.com/googleXXXXXX.html`
4. Click "Verify" in GSC

### Method 2: HTML Meta Tag
Add this to your `<head>` section in `index.html`:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

### Method 3: DNS TXT Record (Domain Property)
1. Go to your DNS provider
2. Add TXT record:
   - **Name:** @
   - **Value:** `google-site-verification=YOUR_CODE`
3. Wait 24-48 hours for DNS propagation
4. Click "Verify" in GSC

---

## Step 4: Submit Your Sitemap

1. In GSC sidebar, click "Sitemaps"
2. Enter sitemap URL: `sitemap.xml`
3. Click "Submit"
4. Wait for status: "Success"

**Your sitemap is located at:** `https://roboticaweekly.com/sitemap.xml`

---

## Step 5: Configure Settings

### Target Country
1. Go to "Legacy tools and reports" → "International targeting"
2. Set country: Italy
3. This helps with local rankings

### URL Parameters (If Applicable)
- Currently not needed for static site
- Add if you implement filtering/sorting

### User Management
Add team members:
1. Go to Settings → Users and permissions
2. Click "Add user"
3. Enter email addresses
4. Set permission level: "Full" or "Restricted"

---

## Step 6: Monitor Performance

### Overview Tab
Check these metrics weekly:
- **Total clicks** - How many users clicked from search
- **Total impressions** - How many times you appeared
- **Average CTR** - Click-through rate (target: > 2%)
- **Average position** - Your ranking (target: top 10)

### Queries Report
Find your top keywords:
1. Go to "Performance" → "Queries"
2. Sort by clicks or impressions
3. Identify opportunities:
   - High impressions, low CTR → Improve titles
   - Position 11-20 → Optimize content

### Pages Report
Identify top-performing content:
1. Go to "Performance" → "Pages"
2. See which pages rank best
3. Double-down on successful topics

---

## Step 7: Monitor Indexing

### Coverage Report
Check monthly:
1. Go to "Pages" (under Indexing)
2. Review:
   - ✅ **Indexed** - Good!
   - ⚠️ **Excluded** - Check reasons
   - ❌ **Error** - Fix immediately

### Common Issues to Fix
| Issue | Solution |
|-------|----------|
| Submitted URL not found (404) | Fix broken links |
| Duplicate without canonical | Add canonical tags |
| Blocked by robots.txt | Update robots.txt |
| Crawled - currently not indexed | Improve content quality |

---

## Step 8: Core Web Vitals

Monitor page speed:
1. Go to "Experience" → "Core Web Vitals"
2. Check both Mobile and Desktop
3. Target metrics:
   - **LCP** (Largest Contentful Paint): < 2.5s
   - **FID** (First Input Delay): < 100ms
   - **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Tips
- Use lazy loading for images
- Minify CSS/JS
- Use CDN (Vercel provides this)
- Optimize images (WebP format)

---

## Step 9: Mobile Usability

Check mobile-friendliness:
1. Go to "Experience" → "Mobile Usability"
2. Fix any errors:
   - Text too small
   - Clickable elements too close
   - Viewport not set

---

## Step 10: Set Up Alerts

Configure email notifications:
1. Go to Settings → Preferences
2. Enable:
   - ☑️ Email notifications for critical issues
   - ☑️ Weekly performance summary
   - ☑️ Monthly index coverage report

---

## Key SEO Metrics to Track

| Metric | Where to Find | Target |
|--------|--------------|--------|
| **Indexed Pages** | Pages report | All pages indexed |
| **Average Position** | Performance | Top 10 (page 1) |
| **CTR** | Performance | > 2% |
| **Core Web Vitals** | Experience | All "Good" |
| **Mobile Usability** | Experience | No errors |

---

## Weekly SEO Checklist

- [ ] Check Performance report for changes
- [ ] Review new queries you rank for
- [ ] Check for crawl errors
- [ ] Monitor Core Web Vitals
- [ ] Review any security/manual actions

---

## Monthly SEO Tasks

- [ ] Export performance data
- [ ] Analyze top 10 queries
- [ ] Check indexing status
- [ ] Review Core Web Vitals trends
- [ ] Compare month-over-month growth
- [ ] Identify new keyword opportunities

---

## Integration with GA4

Link GSC to GA4 for combined insights:
1. In GA4, go to Admin → Search Console Linking
2. Click "Link"
3. Select your GSC property
4. Select your GA4 web data stream
5. Complete linking

**Benefits:**
- See search queries in GA4
- Combined traffic and ranking data
- Better attribution

---

## Important Notes

### Indexing Timeline
- New sites: 1-4 weeks to appear
- New pages: 3-7 days typically
- Sitemap processing: 1-3 days

### What to Expect
- **Week 1:** Site submitted, awaiting indexing
- **Week 2-3:** Initial pages indexed
- **Month 1:** Basic data available
- **Month 2-3:** Meaningful trends emerge
- **Month 6+:** Solid optimization foundation

---

## Resources

- [Search Console Help](https://support.google.com/webmasters)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Core Web Vitals](https://web.dev/vitals/)

---

**Status:** ⏳ Awaiting Google Account Setup  
**Priority:** HIGH - Critical for SEO visibility  
**Owner:** Vision (SEO/Marketing)  
**Due:** Before Feb 5, 2026
