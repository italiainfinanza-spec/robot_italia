# Google Search Console Setup Guide

## Overview
Google Search Console monitors search performance, indexing status, and SEO health.

---

## Step 1: Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Choose **Domain** option for best coverage
4. Enter: `roboticaweekly.com` (no https/www)
5. Click **Continue**

---

## Step 2: Domain Verification

### Method A: DNS TXT Record (Recommended)

1. Copy the TXT record provided by Google (looks like `google-site-verification=xxxxx`)
2. Go to your domain registrar (e.g., Vercel, Namecheap, Cloudflare)
3. Add a **TXT record**:
   - Name/Host: `@` or leave blank
   - Value: `google-site-verification=xxxxx`
   - TTL: Default
4. Wait 5-60 minutes for DNS propagation
5. Click **Verify** in Search Console

### Method B: HTML File Upload

If using Vercel:
1. Download the HTML verification file from Google
2. Place it in `/public/` folder of your project
3. Deploy to Vercel
4. Click **Verify** in Search Console

---

## Step 3: Submit Sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter sitemap URL: `sitemap.xml`
3. Click **Submit**
4. Wait for "Success" status (may take a few hours)

---

## Step 4: Key Settings

### Target Country
1. Go to **Settings** → **Target Country**
2. Select: **Italy**
3. This helps Google understand your primary audience

### Crawl Rate
1. Go to **Settings** → **Crawl Rate**
2. Leave as **Let Google optimize** (recommended)

---

## Step 5: Monitor Reports

### Performance Report
Check weekly:
- **Total clicks** - How many users clicked from search
- **Total impressions** - How many times you appeared
- **Average CTR** - Click-through rate (target: >3%)
- **Average position** - Your ranking (target: <10)

### Coverage Report
- **Valid** pages - Indexed and appearing in search ✅
- **Excluded** pages - Intentionally not indexed
- **Errors** - Pages with issues ⚠️

### Page Experience
- Core Web Vitals (loading speed)
- Mobile usability
- HTTPS status

---

## Step 6: Set Up Email Alerts

1. Click **Settings** (gear icon)
2. Go to **Email Preferences**
3. Enable:
   - [x] Search performance updates
   - [x] Index coverage issues
   - [x] Page experience updates
   - [x] Manual actions

---

## Step 7: Connect to GA4

1. In Search Console, click **Settings**
2. Click **Google Analytics Property**
3. Select your GA4 property
4. Now you can see Search Console data in GA4!

---

## SEO Keywords to Track

Add these as "Queries" filters in Performance report:

### Primary Keywords
- `newsletter robotica`
- `investimenti robotica`
- `azioni robotics`

### Secondary Keywords
- `startup robotica`
- `funding robotica`
- `mercato robotica 2026`
- `physical AI`
- `ETF robotics`

---

## Regular Checks (Weekly)

| Check | Why It Matters |
|-------|----------------|
| Performance tab | Track ranking improvements |
| Coverage errors | Fix broken pages |
| Mobile usability | Ensure mobile-friendly |
| Core Web Vitals | Page speed issues |
| Security issues | Hacking/malware alerts |
| Manual actions | Google penalties |

---

## Common Issues & Fixes

### "Submitted URL not found (404)"
- Page doesn't exist → Create it or remove from sitemap
- Wrong URL → Fix link in sitemap

### "Page not indexed"
- Check robots.txt isn't blocking
- Ensure no `noindex` meta tag
- Wait 1-2 weeks for crawling

### "Duplicate without user-selected canonical"
- Add `<link rel="canonical">` tag
- Or use 301 redirects

---

## XML Sitemap Requirements

Already implemented:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://roboticaweekly.com/</loc>
    <lastmod>2026-02-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

✅ Sitemap URL: `https://roboticaweekly.com/sitemap.xml`

---

## robots.txt Verification

Already implemented:
```
User-agent: *
Allow: /
Sitemap: https://roboticaweekly.com/sitemap.xml
```

✅ robots.txt URL: `https://roboticaweekly.com/robots.txt`

---

## Rich Results Test

Test structured data:
1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter URL: `https://roboticaweekly.com`
3. Check for:
   - ✅ FAQ schema
   - ✅ Organization schema
   - ✅ Product/Offers schema

---

## Timeline Expectations

| Milestone | Timeframe |
|-----------|-----------|
| Verification | Immediate (after DNS propagation) |
| First indexing | 1-7 days |
| Search appearance | 1-4 weeks |
| Performance data | 2-3 days after clicks |
| Full ranking impact | 4-12 weeks |

---

## Success Metrics

Track monthly:
- 🎯 100+ clicks from search
- 🎯 1,000+ impressions
- 🎯 Average position <15
- 🎯 CTR >2%
- 🎯 0 coverage errors

---

**Setup Date:** 2026-02-03  
**Agent:** Vision  
**Status:** Ready to implement
