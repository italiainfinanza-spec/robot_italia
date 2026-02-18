# GUIDA: Integrazione Stripe per Piano PRO

## OVERVIEW
- Piano PRO: €4.99/mese (prezzo fondatore)
- Target: 100 primi iscritti
- Pagamento ricorrente mensile
- Stripe gestisce: pagamenti, fatture, retry pagamento, cancellazione

---

## STEP 1: CREA ACCOUNT STRIPE

1. Vai su https://stripe.com
2. Clicca "Start now" → "Create account"
3. Inserisci email e password
4. Verifica email

**NOTA:**
- Stripe è GRATIS da configurare
- Commissioni: 1.5% + €0.25 per transazione (EU cards)
- Su €4.99 paghi circa €0.32 di commissione → ricevi ~€4.67

---

## STEP 2: CONFIGURA PRODOTTO

In Stripe Dashboard:

1. Vai su **"Product catalog"** (menu a sinistra)
2. Clicca **"+ Add product"**
3. Configura:

**Product name:** "Robotica Weekly - PRO"
**Description:** "Accesso completo a L'Osservatorio PRO"

4. Aggiungi prezzo:
   - **Pricing model:** Standard pricing
   - **Price:** €4.99
   - **Billing period:** Monthly
   - **Currency:** EUR

5. Clicca **"Save product"**

---

## STEP 3: OTTIENI LINK PAGAMENTO (Checkout)

1. Nel prodotto creato, clicca **"Create payment link"**
2. Stripe crea automaticamente checkout page
3. Copia il **Payment Link** (es: https://buy.stripe.com/abc123)

---

## STEP 4: COLLEGA AL SITO

Nel file `index.html`, trova:

```html
<a href="#signup" class="btn btn-primary btn-block btn-lg">Attiva PRO</a>
```

Sostituisci con:

```html
<a href="https://buy.stripe.com/IL_TUO_LINK" class="btn btn-primary btn-block btn-lg">
    Attiva PRO — €4.99/mese
</a>
```

---

## STEP 5: WEBHOOK (Opzionale ma consigliato)

Per ricevere notifica quando qualcuno paga:

1. In Stripe → Developers → Webhooks
2. Clicca "Add endpoint"
3. Endpoint URL: `https://roboticaweekly.com/api/stripe-webhook`
4. Seleziona eventi:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

---

## STEP 6: PAGINA SUCCESSO

Crea file `grazie-pro.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Benvenuto PRO — Robotica Weekly</title>
</head>
<body>
    <h1>🎉 Benvenuto in L'Osservatorio PRO!</h1>
    <p>Grazie per l'abbonamento. Riceverai la prima newsletter PRO mercoledì prossimo.</p>
    <p>Ti abbiamo inviato una email con i dettagli dell'account.</p>
    <a href="/">Torna al sito</a>
</body>
</html>
```

In Stripe:
1. Settings → Checkout settings
2. "Success URL": `https://roboticaweekly.com/grazie-pro.html`

---

## RIEPILOGO COSTI

| Voce | Costo |
|------|-------|
| Setup Stripe | Gratis |
| Commissione per €4.99 | ~€0.32 |
| Netto per iscrizione | ~€4.67 |
| Totale mensile (100 utenti) | ~€467 |

---

## PROSSI PASSI

1. Crea account Stripe
2. Configura prodotto €4.99/mese
3. Ottieni payment link
4. Mandami il link così lo integro nel sito

**Hai bisogno di aiuto per qualche passaggio specifico?**