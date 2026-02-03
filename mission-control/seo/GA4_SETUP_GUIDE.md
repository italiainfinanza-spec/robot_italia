# Google Analytics 4 Setup Guide - Robotica Weekly

## Overview
Questa guida illustra come configurare Google Analytics 4 per tracciare le performance del sito Robotica Weekly.

## Prerequisiti
- Accesso a un account Google
- Proprietà del dominio roboticaweekly.com

## Step 1: Creare l'Account GA4

1. Vai su [Google Analytics](https://analytics.google.com)
2. Clicca "Inizia a misurare"
3. Inserisci i dettagli:
   - **Nome account**: Robotica Weekly
   - **Nome proprietà**: Robotica Weekly Website
   - **Fuso orario**: Italy (Rome) GMT+1
   - **Valuta**: Euro (€)
4. Clicca "Avanti"

## Step 2: Configurare la Proprietà

1. Seleziona:
   - **Categoria settore**: Finanza / Investimenti
   - **Dimensione azienda**: Piccola
2. Accetta i termini di servizio

## Step 3: Ottenere il Tracking ID

1. Vai su **Admin** → **Data Streams**
2. Clicca "Web"
3. Inserisci:
   - **URL sito**: https://roboticaweekly.com
   - **Nome stream**: Robotica Weekly Web
4. Clicca "Crea stream"
5. Copia il **Measurement ID** (formato: G-XXXXXXXXXX)

## Step 4: Installare il Codice di Tracciamento

Aggiungi questo codice nell'`<head>` del file `index.html`, subito dopo il tag `<meta charset>`:

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

**Nota**: Sostituisci `G-XXXXXXXXXX` con il tuo Measurement ID reale.

## Step 5: Eventi di Tracciamento Consigliati

Aggiungi questi eventi personalizzati nel `<script>` dopo la configurazione base:

### Tracciamento Iscrizione Newsletter
```javascript
// Quando l'utente si iscrive
gtag('event', 'newsletter_signup', {
  'event_category': 'engagement',
  'event_label': 'premium_plan',
  'value': 4.99
});
```

### Tracciamento Clic CTA Premium
```javascript
// Quando clicca su "Abbonati Ora"
gtag('event', 'cta_click', {
  'event_category': 'conversion',
  'event_label': 'premium_cta',
  'value': 1
});
```

### Tracciamento Scroll
```javascript
// Tracciamento scroll 50% e 90%
gtag('event', 'scroll', {
  'event_category': 'engagement',
  'event_label': 'depth_50_percent'
});
```

## Step 6: Verifica dell'Installazione

1. Installa l'estensione [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Apri il sito in una nuova scheda
3. Apri Console DevTools (F12)
4. Verifica che veda gli eventi GA4

## Step 7: Configurare Obiettivi (Conversioni)

In GA4, vai su **Configura** → **Eventi** → **Crea evento**:

### Evento Conversione: Iscrizione Newsletter
- **Nome evento**: `newsletter_signup`
- **Segna come conversione**: ✅ Sì

### Evento Conversione: Clic CTA Premium
- **Nome evento**: `cta_click`
- **Parametro**: `event_label` = `premium_cta`
- **Segna come conversione**: ✅ Sì

## Step 8: Dashboard Personalizzata

Crea una dashboard con questi widget:

1. **Utenti attivi** (ultimi 30 minuti)
2. **Sessioni totali** (ultimi 7 giorni)
3. **Tasso di conversione** iscrizioni
4. **Pagine più viste**
5. **Fonti di traffico**
6. **Dispositivi utilizzati**

## Metriche Chiave da Monitorare

| Metrica | Target Mensile | Azione se sotto |
|---------|----------------|-----------------|
| Utenti unici | 5,000 | Aumentare SEO/Ads |
| Tasso iscrizione | >5% | Ottimizzare CTA |
| Tempo sul sito | >2 min | Migliorare contenuto |
| Bounce rate | <60% | Migliorare UX |
| Conversioni | >250 | Test A/B landing |

## Integrazione con Google Ads (Futuro)

Quando attiverai campagne Ads:
1. Vai su **Admin** → **Collega a Google Ads**
2. Seleziona l'account Google Ads
3. Abilita il remarketing automatico

## Risorse Utili

- [Guida ufficiale GA4](https://support.google.com/analytics/topic/9303319)
- [Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Google Tag Manager](https://tagmanager.google.com) (consigliato per gestione avanzata)

---

**Ultimo aggiornamento**: 2026-02-03  
**Responsabile**: Vision (SEO/Marketing)  
**Prossima revisione**: 2026-03-03