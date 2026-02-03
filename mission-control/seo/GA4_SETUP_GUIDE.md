# Google Analytics 4 (GA4) Setup Guide
## Robotica Weekly

---

## Overview
Google Analytics 4 is essential for tracking website traffic, user behavior, and conversion goals. This guide walks you through setting up GA4 for Robotica Weekly.

---

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Admin" (gear icon) in bottom left
4. Click "+ Create Property"
5. Enter:
   - **Property name:** Robotica Weekly
   - **Reporting time zone:** Europe/Rome (or your timezone)
   - **Currency:** Euro (EUR)
6. Click "Next"
7. Select industry: "Finance" or "Technology"
8. Select business size: "Small" (1-10 employees)
9. Click "Create"

---

## Step 2: Set Up Data Stream

1. Choose "Web" as your platform
2. Enter website URL: `https://roboticaweekly.com`
3. Enter stream name: "Robotica Weekly Website"
4. Enable "Enhanced measurement" (recommended)
5. Click "Create stream"
6. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

---

## Step 3: Install GA4 Tracking Code

Add this code to the `<head>` section of your `index.html`, just before the closing `</head>` tag:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID.**

---

## Step 4: Configure Events

### Automatic Events (Enabled by Default)
- page_view
- scroll
- click
- file_download

### Custom Events to Track

Add this script after the GA4 code to track newsletter subscriptions:

```html
<script>
// Track subscription button clicks
document.querySelectorAll('.btn-primary').forEach(button => {
  button.addEventListener('click', function() {
    gtag('event', 'subscription_click', {
      'plan': this.textContent.includes('Premium') ? 'premium' : 'free',
      'location': 'hero_section'
    });
  });
});

// Track pricing section views
const pricingObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      gtag('event', 'pricing_viewed');
    }
  });
});
pricingObserver.observe(document.getElementById('pricing'));
</script>
```

---

## Step 5: Set Up Conversion Goals

### Goal 1: Free Subscription Click
1. Go to Admin → Events → "Create event"
2. Event name: `free_subscription_click`
3. Click "Mark as conversion"

### Goal 2: Premium Subscription Click
1. Event name: `premium_subscription_click`
2. Click "Mark as conversion"

### Goal 3: Pricing Section View
1. Event name: `pricing_viewed`
2. Click "Mark as conversion"

---

## Step 6: Configure Audiences

Create these audiences for remarketing:

### Audience 1: All Users
- **Condition:** All users who visited website
- **Membership duration:** 30 days

### Audience 2: Engaged Users
- **Condition:** Users who spent > 60 seconds OR viewed > 2 pages
- **Membership duration:** 90 days

### Audience 3: Pricing Viewers (High Intent)
- **Condition:** Users who triggered `pricing_viewed` event
- **Membership duration:** 180 days

---

## Step 7: Link to Google Ads (Future)

When you start running ads:
1. Go to Admin → Google Ads Links
2. Click "Link"
3. Select your Google Ads account
4. Enable "Auto-tagging"
5. Enable "Personalized advertising"

---

## Step 8: Verify Installation

1. Install [Google Tag Assistant](https://chromewebstore.google.com/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk) Chrome extension
2. Visit your website
3. Click the Tag Assistant icon
4. Verify "Global site tag (gtag.js)" is detected
5. Check that your Measurement ID matches

---

## Key Metrics to Monitor

| Metric | What It Tells You | Target |
|--------|------------------|--------|
| **Users** | Unique visitors | Growth 10% weekly |
| **Sessions** | Total visits | Track trends |
| **Bounce Rate** | % who leave immediately | < 50% |
| **Avg. Session Duration** | Engagement quality | > 2 min |
| **Conversion Rate** | % who click subscribe | > 2% |
| **Traffic Sources** | Where users come from | Diversify |

---

## Monthly Review Checklist

- [ ] Check user growth trend
- [ ] Analyze top traffic sources
- [ ] Review conversion funnel
- [ ] Identify top-performing pages
- [ ] Check mobile vs desktop split
- [ ] Review geographic distribution
- [ ] Export monthly report

---

## Privacy Compliance (GDPR)

**Required:** Add cookie consent before GA4 loads

```html
<!-- Add this BEFORE the GA4 script -->
<script>
// Check for consent
if (localStorage.getItem('cookieConsent') === 'accepted') {
  // Load GA4
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  document.head.appendChild(script);
}
</script>
```

---

## Resources

- [GA4 Help Center](https://support.google.com/analytics/topic/9143232)
- [GA4 Demo Account](https://support.google.com/analytics/answer/6367342)
- [Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

---

**Status:** ⏳ Awaiting Google Account Setup  
**Priority:** HIGH - Set up before first marketing campaign  
**Owner:** Vision (SEO/Marketing)  
**Due:** Before Feb 5, 2026
