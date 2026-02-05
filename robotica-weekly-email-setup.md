# Robotica Weekly - Email Platform Setup Guide

## Executive Summary

**RECOMMENDED PLATFORM: Beehiiv (Scale Plan)**

For Robotica Weekly's needs—a paid newsletter targeting Italian SME owners with free and premium tiers—Beehiiv offers the best balance of native monetization, automation capabilities, and cost-effectiveness.

---

## 1. Platform Comparison

### Detailed Comparison Table

| Feature | Beehiiv (Scale) | Substack | Mailchimp (Standard) | SendGrid (Pro) |
|---------|-----------------|----------|---------------------|----------------|
| **Monthly Cost @ 1,000 subs** | $43/mo | Free (10% revenue fee) | ~$35/mo | $89.95/mo |
| **Monthly Cost @ 5,000 subs** | $43/mo* | Free (10% revenue fee) | ~$85/mo | $249/mo |
| **Paid Subscription Fee** | 0% + Stripe fees | 10% + Stripe fees | Not native | Not native |
| **Native Monetization** | ✅ Built-in | ✅ Built-in | ❌ Requires integration | ❌ Requires integration |
| **Automation Workflows** | ✅ Advanced | ❌ Basic only | ✅ Advanced | ✅ Advanced |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **GDPR Compliance** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **GA4 Integration** | ✅ Native | ❌ Limited | ✅ Native | ✅ Via API |
| **Double Opt-in** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| **Referral Program** | ✅ Built-in | ❌ No | ❌ Add-on required | ❌ No |

*Beehiiv Scale includes up to 100,000 subscribers

### Revenue Impact Analysis (€4.99/month Pro Tier)

**Scenario: 100 Paid Subscribers (€499/month revenue)**

| Platform | Monthly Fee | Revenue Share | Processing Fees | Net Monthly |
|----------|-------------|---------------|-----------------|-------------|
| **Beehiiv** | $43 | €0 | ~€17 (Stripe) | **~€439** |
| **Substack** | €0 | €50 (10%) | ~€17 (Stripe) | **~€432** |
| **Mailchimp** | ~$35 | N/A* | N/A* | **N/A** |

*Mailchimp doesn't support native paid subscriptions—requires third-party integration (Stripe + Memberful/Pico = additional 5-10% fees)

**Winner at 100+ paid subscribers: Beehiiv**

---

## 2. Why Beehiiv for Robotica Weekly

### ✅ Pros
- **0% take rate on paid subscriptions** (only pay Stripe fees)
- **Native monetization** with automatic billing and subscriber management
- **Advanced automations** for nurture sequences and segmentation
- **Built-in referral program** to grow organically
- **Ad network access** for additional revenue
- **Excellent deliverability** and newsletter-focused infrastructure
- **Custom domains** and full branding control

### ⚠️ Considerations
- Monthly subscription cost ($43/mo) regardless of revenue
- Less "discovery" network than Substack
- Newer platform with smaller ecosystem

---

## 3. Account Setup - Step by Step

### Phase 1: Sign Up (10 minutes)

1. **Visit** [app.beehiiv.com/signup](https://app.beehiiv.com/signup)
2. **Select "Scale" plan** (required for paid subscriptions and automations)
3. **Enter details:**
   - Publication Name: "Robotica Weekly"
   - Subdomain: `roboticaweekly.beehiiv.com` (temporary)
4. **Verify email** and complete onboarding wizard

### Phase 2: Configure Publication Settings (15 minutes)

```
Settings → Publication
├── Publication Name: Robotica Weekly
├── Description: "Notizie settimanali sulla robotica per imprenditori Italiani"
├── Website Settings:
│   ├── Custom Domain: newsletter.roboticaweekly.com
│   ├── Logo: Upload brand logo (400x400px min)
│   └── Favicon: Upload favicon
├── Email Settings:
│   ├── Sender Name: "Robotica Weekly"
│   ├── Sender Email: noreply@newsletter.roboticaweekly.com
│   └── Reply-to: hello@roboticaweekly.com
└── Timezone: Europe/Rome (CET/CEST)
```

### Phase 3: DNS Configuration for Custom Domain

**Required DNS Records:**

```dns
; A Record for root domain
newsletter.roboticaweekly.com.    A    76.76.21.21

; CNAME for www (optional)
www.newsletter.roboticaweekly.com.    CNAME    newsletter.roboticaweekly.com.

; SPF Record (for email deliverability)
roboticaweekly.com.    TXT    "v=spf1 include:beehiiv.com ~all"

; DMARC Record
_dmarc.roboticaweekly.com.    TXT    "v=DMARC1; p=quarantine; rua=mailto:dmarc@roboticaweekly.com"
```

**Verification:**
- Go to Settings → Custom Domain in Beehiiv
- Enter `newsletter.roboticaweekly.com`
- Click "Verify Domain" (may take 24-48 hours)

### Phase 4: GDPR Compliance Setup

1. **Privacy Policy Page:**
   - Create at `/privacy`
   - Include: data collection, usage, retention, rights
   - Link to Beehiiv's DPA: [beehiiv.com/privacy](https://www.beehiiv.com/privacy)

2. **Cookie Consent:**
   - Enable in Settings → Website → Cookie Banner
   - Configure for Italian language

3. **Data Processing Agreement:**
   - Sign Beehiiv's DPA in Settings → Legal

---

## 4. Automation Workflows

### Workflow 1: Welcome Email (Free Tier Signup)

**Trigger:** New subscriber joins
**Delay:** Immediate

```yaml
Email Subject: "Benvenuto in Robotica Weekly! 🚀"
From: Marco & Team Robotica Weekly
Preview Text: "La tua guida alla robotica per imprese Italiane"

Content:
  - Header: Welcome image/logo
  - Body: 
      "Ciao! 👋
      
      Benvenuto nella community di Robotica Weekly!
      
      Ogni settimana riceverai:
      ✓ Notizie curate sulla robotica industriale
      ✓ Casi studio di successo in Italia
      ✓ Opportunità di finanziamento e incentivi
      ✓ Consigli pratici per la tua impresa
      
      La prossima edizione arriva Lunedì alle 9:00.
      
      Nel frattempo, scarica la nostra guida gratuita:
      '5 Modi in cui la Robotica Riduce i Costi Operativi'"
  - CTA Button: "Scarica la Guida Gratuita →"
  - Footer: Social links, unsubscribe
```

### Workflow 2: Lead Magnet Delivery (Immediate)

**Trigger:** Form submission with lead magnet request
**Delay:** Immediate

```yaml
Email Subject: "Ecco la tua guida: 5 Modi in cui la Robotica Riduce i Costi"
From: Robotica Weekly
Attachment/Download: Lead magnet PDF

Content:
  - Direct download link (hosted on Beehiiv or external)
  - Brief introduction to the guide
  - Preview of what they'll learn
  - Soft pitch: "Vuoi approfondire? Scopri L'Osservatorio Pro →"
```

### Workflow 3: 3-Day Nurture Sequence

**Email 1 (Day 1) - The Problem:**
```yaml
Subject: "Il 67% delle PMI Italiane perde competitività (scopri perché)"
Delay: 24 hours after welcome

Content Angle: Pain point - rising costs, labor shortage
Key Message: "La robotica non è più un lusso, è una necessità"
CTA: Read latest newsletter issue
```

**Email 2 (Day 2) - The Solution:**
```yaml
Subject: "Come un'azienda di Verona ha risparmiato €120K con un robot"
Delay: 48 hours after Email 1

Content Angle: Case study/success story
Key Message: "Risultati concreti, investimento accessibile"
CTA: "Leggi il caso completo →"
```

**Email 3 (Day 3) - The Opportunity:**
```yaml
Subject: "Le agevolazioni 2025 che pochi conoscono"
Delay: 48 hours after Email 2

Content Angle: Incentives and funding
Key Message: "Il 2025 è l'anno migliore per investire in robotica"
CTA: "Scopri L'Osservatorio Pro (solo €4.99/mese) →"
```

### Workflow 4: Upgrade Pitch (Day 7)

**Trigger:** 7 days after signup, if still on Free tier

```yaml
Subject: "Hai visto tutto quello che ti perdi?"
From: Marco - Robotica Weekly

Content Structure:
  - Personal note from founder
  - "What you're missing" comparison table
  - Social proof: "500+ imprenditori hanno già fatto l'upgrade"
  - Limited-time offer: "Primo mese a €1 con codice ROBOTICA1"
  - Clear CTA: "Passa a Pro Ora →"
  - Risk reversal: "Cancelli quando vuoi, nessuna domanda"
```

### Workflow 5: Paid Tier Onboarding

**Trigger:** New paid subscriber

```yaml
Welcome Email (Immediate):
Subject: "🎉 Benvenuto in L'Osservatorio Pro!"
Content:
  - Welcome to the Pro community
  - "Ecco i tuoi vantaggi esclusivi:"
    • Analisi approfondite ogni settimana
    • Accesso all'archivio completo
    • Report mensili sul settore
    • Consulenza prioritaria
  - Next steps: "La tua prima analisi approfondita arriva Lunedì"
  - Community invite (if applicable)

Follow-up (Day 3):
Subject: "Hai esplorato l'archivio Pro?"
Content: Curated list of "must-read" past issues
```

### Workflow 6: Re-engagement (30 Days Inactive)

**Trigger:** No opens in 30 days

```yaml
Email 1 (Day 30):
Subject: "Ci manchi! Un regalo per te 🎁"
Content:
  - "Non ti vediamo da un po'..."
  - "Ecco cosa ti sei perso:" [3 key recent stories]
  - Free gift: Exclusive report or guide
  - Preference center link: "Aggiorna le tue preferenze"
  - Unsubscribe option

Email 2 (Day 45 - if no response):
Subject: "Ultima chiamata: rimaniamo in contatto?"
Content:
  - "Vuoi ancora ricevere Robotica Weekly?"
  - One-click "Keep me subscribed" button
  - Automatic unsubscribe if no click

Sunset Policy: Unsubscribe non-responders after 60 days
```

---

## 5. Segmentation Strategy

### Segment Definitions

| Segment | Criteria | Use Case |
|---------|----------|----------|
| **Free Subscribers** | Subscription tier = Free | Weekly newsletter, upgrade campaigns |
| **Paid Subscribers (Founder)** | Subscription tier = Paid | Premium content, retention focus |
| **Inactive** | No open in 30 days | Re-engagement campaigns |
| **Engaged** | 3+ clicks in last 30 days | Special offers, referral requests |
| **New Subscribers** | Subscribed within 7 days | Welcome sequence, nurture flow |
| **Upgrade Candidates** | Free + 2+ opens + clicked pricing page | Targeted upgrade campaigns |

### How to Create Segments in Beehiiv

```
Audience → Segments → Create Segment

Segment: "Inactive (30 days)"
Conditions:
  - Subscription status: Active
  - Last opened email: More than 30 days ago
  - Subscription tier: Free OR Paid

Segment: "Engaged Clickers"
Conditions:
  - Clicked any email: At least 3 times
  - Timeframe: Last 30 days

Segment: "New Subscribers"
Conditions:
  - Date subscribed: Less than 7 days ago

Segment: "Paid Subscribers"
Conditions:
  - Subscription tier: Paid

Segment: "Free Subscribers"
Conditions:
  - Subscription tier: Free
```

---

## 6. Signup Form Integration

### Embedded Form HTML

```html
<!-- Robotica Weekly Signup Form -->
<div id="robotica-signup-form">
  <form action="https://api.beehiiv.com/v2/subscribers" method="POST" id="rw-form">
    <div class="form-group">
      <label for="email">Email *</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        placeholder="iltuo@email.com" 
        required
        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
      >
    </div>
    
    <div class="form-group gdpr">
      <input type="checkbox" id="gdpr" name="gdpr" required>
      <label for="gdpr">
        Acconsento al trattamento dei dati personali secondo la 
        <a href="/privacy" target="_blank">Privacy Policy</a> *
      </label>
    </div>
    
    <div class="form-group marketing">
      <input type="checkbox" id="marketing" name="marketing_consent" value="true">
      <label for="marketing">
        Accetto di ricevere comunicazioni commerciali (opzionale)
      </label>
    </div>
    
    <!-- Hidden fields -->
    <input type="hidden" name="publication_id" value="YOUR_PUB_ID">
    <input type="hidden" name="redirect_url" value="https://roboticaweekly.com/grazie">
    <input type="hidden" name="tier" value="free">
    
    <button type="submit" class="btn-primary">
      Iscriviti Gratuitamente
    </button>
    
    <p class="form-note">
      ✓ Iscrizione gratuita. ✓ Cancellazione immediata. ✓ GDPR compliant.
    </p>
  </form>
</div>

<style>
#robotica-signup-form {
  max-width: 400px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  font-family: system-ui, -apple-system, sans-serif;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input[type="email"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group.gdpr,
.form-group.marketing {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.form-group.gdpr input,
.form-group.marketing input {
  margin-top: 2px;
}

.form-group.gdpr label,
.form-group.marketing label {
  margin: 0;
  font-weight: normal;
  font-size: 13px;
  line-height: 1.4;
  color: #666;
}

.form-group.gdpr label a {
  color: #007bff;
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.form-note {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 12px;
}
</style>

<script>
document.getElementById('rw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Client-side validation
  if (!data.gdpr) {
    alert('Devi accettare la Privacy Policy per iscriverti.');
    return;
  }
  
  try {
    const response = await fetch('https://api.beehiiv.com/v2/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        email: data.email,
        publication_id: 'YOUR_PUB_ID',
        reactivate_existing: true,
        custom_fields: {
          gdpr_consent: true,
          marketing_consent: data.marketing_consent === 'true',
          source: 'website_embed'
        }
      })
    });
    
    if (response.ok) {
      window.location.href = data.redirect_url;
    } else {
      const error = await response.json();
      alert('Errore: ' + (error.message || 'Riprova più tardi'));
    }
  } catch (err) {
    console.error(err);
    alert('Errore di connessione. Riprova.');
  }
});
</script>
```

### Double Opt-in Configuration

```
Settings → Subscriptions → Double Opt-in

✅ Enable Double Opt-in (Recommended for deliverability)

Confirmation Email Subject: 
"Conferma la tua iscrizione a Robotica Weekly"

Confirmation Email Content:
"Clicca il link qui sotto per confermare la tua iscrizione:

[CONFERMA ISCRIZIONE]

Se non ti sei iscritto, ignora questa email."

Redirect After Confirmation: 
https://roboticaweekly.com/benvenuto
```

---

## 7. API & Integration Specs

### Beehiiv API Endpoints

**Base URL:** `https://api.beehiiv.com/v2`

#### Authentication
```http
Authorization: Bearer {YOUR_API_KEY}
Content-Type: application/json
```

#### Create Subscriber
```http
POST /subscribers

{
  "email": "user@example.com",
  "publication_id": "pub_YOUR_PUB_ID",
  "reactivate_existing": true,
  "custom_fields": {
    "source": "landing_page",
    "campaign": "winter_2025"
  }
}
```

#### Update Subscriber Tier
```http
PATCH /subscribers/{subscriber_id}

{
  "subscription_tier": "paid",
  "subscription_status": "active"
}
```

#### Get Subscriber Segments
```http
GET /subscribers/{subscriber_id}/segments
```

### Webhook Configuration

**Webhook URL:** `https://roboticaweekly.com/webhooks/beehiiv`

**Events to Subscribe:**
- `subscriber.created` - New signup
- `subscriber.confirmed` - Double opt-in confirmed
- `subscription.tier_changed` - Free → Paid upgrade
- `email.opened` - Engagement tracking
- `email.clicked` - Click tracking
- `subscriber.unsubscribed` - Unsubscribe event

```javascript
// Webhook Handler Example (Node.js)
app.post('/webhooks/beehiiv', async (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'subscriber.created':
      // Trigger welcome email workflow
      await triggerWorkflow('welcome', data.subscriber_id);
      break;
      
    case 'subscription.tier_changed':
      if (data.new_tier === 'paid') {
        // Send to GA4
        gtag('event', 'purchase', {
          transaction_id: data.subscription_id,
          value: 4.99,
          currency: 'EUR'
        });
        // Trigger onboarding
        await triggerWorkflow('paid_onboarding', data.subscriber_id);
      }
      break;
      
    case 'email.clicked':
      // Update engagement score
      await updateEngagementScore(data.subscriber_id, 'click');
      break;
  }
  
  res.status(200).send('OK');
});
```

### GA4 Integration

```javascript
// Global Site Tag (gtag.js) - Add to <head>
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
  
  // Newsletter Signup Event
  function trackNewsletterSignup(tier) {
    gtag('event', 'newsletter_signup', {
      'event_category': 'engagement',
      'event_label': tier, // 'free' or 'paid'
      'value': tier === 'paid' ? 4.99 : 0
    });
  }
  
  // Subscription Upgrade Event
  function trackSubscriptionUpgrade() {
    gtag('event', 'purchase', {
      'transaction_id': generateTransactionId(),
      'value': 4.99,
      'currency': 'EUR',
      'items': [{
        'item_name': 'L\'Osservatorio Pro',
        'item_id': 'pro_monthly',
        'price': 4.99,
        'quantity': 1
      }]
    });
  }
</script>
```

### Beehiiv + GA4 Native Integration

```
Settings → Integrations → Google Analytics 4

✅ Enable GA4 Integration
Measurement ID: G-XXXXXXXXXX

Track Events:
☑️ Page views on publication website
☑️ Newsletter opens (via pixel)
☑️ Link clicks in emails
☑️ Subscription conversions
```

---

## 8. Account Credentials Template

```yaml
# ROBOTICA WEEKLY - ACCOUNT CREDENTIALS
# Store securely in password manager

BEEHIIV:
  Login URL: https://app.beehiiv.com/login
  Email: [YOUR_EMAIL]
  Password: [SECURE_PASSWORD]
  Publication ID: pub_[PUB_ID]
  API Key: [API_KEY]
  
CUSTOM DOMAIN:
  Domain: newsletter.roboticaweekly.com
  DNS Provider: [CLOUDFLARE/NAMECHEAP/etc]
  DNS Editor URL: [DNS_LOGIN_URL]
  
STRIPE (for payments):
  Dashboard: https://dashboard.stripe.com
  Account: [ACCOUNT_ID]
  Webhook Endpoint: https://api.beehiiv.com/v1/stripe/webhook
  
GOOGLE ANALYTICS 4:
  Property: Robotica Weekly
  Measurement ID: G-XXXXXXXXXX
  Stream URL: newsletter.roboticaweekly.com
```

---

## 9. Weekly Send Schedule Configuration

```
Settings → Schedule

Default Send Time: Monday 09:00 UTC
(= 10:00 CET / 11:00 CEST)

Also configure:
Thursday Sends (L'Osservatorio Pro exclusive):
  Time: 09:00 UTC
  Segment: Paid Subscribers only

Automation Send Windows:
  - Welcome emails: Immediate
  - Nurture sequence: 9:00 AM UTC
  - Re-engagement: 10:00 AM UTC
```

---

## 10. Pre-Launch Checklist

- [ ] Beehiiv Scale plan activated
- [ ] Custom domain connected and verified
- [ ] DNS records (SPF, DMARC) configured
- [ ] Privacy Policy page published
- [ ] GDPR checkbox on signup form
- [ ] Double opt-in enabled
- [ ] Welcome email sequence created
- [ ] Lead magnet uploaded/hosted
- [ ] 3-day nurture sequence created
- [ ] Day 7 upgrade pitch configured
- [ ] Paid tier onboarding flow ready
- [ ] Re-engagement automation active
- [ ] All segments created
- [ ] GA4 integration connected
- [ ] Webhook endpoints configured
- [ ] Test signup flow end-to-end
- [ ] Test paid subscription flow
- [ ] Email deliverability tested (spam check)
- [ ] First newsletter drafted
- [ ] Team access configured

---

## 11. Support & Resources

**Beehiiv Support:**
- Help Center: [beehiiv.com/support](https://www.beehiiv.com/support)
- Email: support@beehiiv.com
- Slack Community: Available with Scale plan

**Useful Resources:**
- Beehiiv API Docs: [developers.beehiiv.com](https://developers.beehiiv.com)
- Newsletter Best Practices: [beehiiv.com/blog](https://www.beehiiv.com/blog)
- Deliverability Guide: Available in dashboard

---

*Document Version: 1.0*
*Created: 2026-02-05*
*Platform: Beehiiv Scale Plan*
