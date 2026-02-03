# Google Analytics 4 (GA4) Setup Guide

## Overview
Google Analytics 4 tracks website traffic, user behavior, and conversions.

---

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Admin** (gear icon) in bottom left
3. Click **Create Property**
4. Enter:
   - Property name: `Robotica Weekly`
   - Time zone: `Europe/Rome`
   - Currency: `EUR`
5. Click **Next**
6. Select industry: `Finance` or `News & Media`
7. Select business size: `Small`
8. Click **Create**

---

## Step 2: Set Up Data Stream

1. Choose **Web** platform
2. Enter website URL: `https://roboticaweekly.com`
3. Stream name: `Robotica Weekly Website`
4. Click **Create stream**
5. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

---

## Step 3: Install GA4 Tag

Add this code to the `<head>` of every page, just before `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'cookie_flags': 'SameSite=None;Secure',
    'anonymize_ip': true
  });
</script>
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID**

---

## Step 4: Configure Events

### Automatic Events (Already Tracked)
- Page views
- Scroll depth
- Outbound clicks
- Site search

### Custom Events to Set Up

**Newsletter Signup Conversion:**
```javascript
// Add this when user subscribes
gtag('event', 'newsletter_signup', {
  'plan_type': 'free',  // or 'premium'
  'source': 'homepage'
});
```

**Premium Purchase:**
```javascript
gtag('event', 'purchase', {
  'transaction_id': 'order_123',
  'value': 4.99,
  'currency': 'EUR',
  'items': [{
    'item_name': 'Premium Subscription',
    'item_category': 'Newsletter',
    'price': 4.99,
    'quantity': 1
  }]
});
```

---

## Step 5: Set Up Conversions

1. In GA4, go to **Configure** → **Events**
2. Find `newsletter_signup` event
3. Toggle **Mark as conversion**
4. Find `purchase` event
5. Toggle **Mark as conversion**

---

## Step 6: Key Reports to Monitor

| Report | What It Shows |
|--------|---------------|
| Realtime | Live traffic |
| Acquisition → Traffic Acquisition | Where users come from |
| Engagement → Pages & Screens | Popular pages |
| Monetization → Ecommerce Purchases | Revenue tracking |
| Retention | User return rate |

---

## Step 7: Set Up Goals

**Monthly Targets:**
- Page views: 10,000
- Unique visitors: 3,000
- Newsletter signups: 200
- Conversion rate: 2%+
- Bounce rate: <60%

---

## Privacy Compliance (GDPR)

✅ **Anonymize IP enabled**  
✅ **Cookie consent banner required**  
✅ **Data retention: 14 months**  
✅ **No PII (personally identifiable information)**

Add this to your privacy policy:
```
We use Google Analytics to understand how visitors use our website. 
Google Analytics uses cookies to collect anonymous information. 
You can opt out using the cookie banner or by installing the 
Google Analytics Opt-out Browser Add-on.
```

---

## Verification

1. Install [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Visit your website
3. Open DevTools → Console
4. Check for `gtag` events firing

---

## Next Steps

- [ ] Link GA4 with Google Search Console
- [ ] Set up Google Ads integration (if running ads)
- [ ] Create custom dashboards
- [ ] Set up weekly email reports

---

**Setup Date:** 2026-02-03  
**Agent:** Vision  
**Status:** Ready to implement
