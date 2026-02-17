# GUIDA: Setup Form Iscrizione Brevo

## PASSO 1: Crea il Form su Brevo

1. Vai su https://app.brevo.com/
2. Clicca **"Contacts"** nel menu a sinistra
3. Clicca **"Forms"** → **"Create a form"**
4. Seleziona **"Subscription form"**

## PASSO 2: Configura il Form

**Nome form:** "Robotica Weekly - Iscrizione"

**Campi da aggiungere:**
- ✅ Email (obbligatorio)
- ☐ Nome (opzionale)
- ☐ Cognome (opzionale)

**Design:**
- Scegli tema semplice
- Colori: Blu (#2563eb) come il sito
- Testo bottone: "Iscriviti alla Newsletter"

## PASSO 3: Lista Contatti

**Seleziona lista:** "Robotica Weekly Subscribers"

(Oppure crea nuova lista se non esiste)

## PASSO 4: Double Opt-In (IMPORTANTE!)

**Abilita "Double opt-in":**
1. Spunta "Enable double opt-in"
2. **Confirmation page:** https://roboticaweekly.com/grazie.html
3. Personalizza email di conferma:
   - Oggetto: "Conferma iscrizione - Robotica Weekly"
   - Testo: "Clicca qui per confermare la tua iscrizione"

## PASSO 5: Ottieni il Codice Embed

1. Clicca **"Share"** o **"Embed"**
2. Seleziona **"HTML (iFrame)"** o **"HTML (JavaScript)"**
3. Copia il codice

## PASSO 6: Incolla nel Sito

Apri `/newsletter/website/index.html`

Cerca:
```html
<form id="signupForm">
```

Sostituisci TUTTO il form con il codice Brevo.

---

ALTERNATIVA (più semplice):

**Opzione Brevo Subdomain:**
Se vuoi usare il form ospitato su Brevo:

1. In Brevo, dopo aver creato il form
2. Vai su **"Share"** → **"Direct link"**
3. Ottieni URL tipo: `https://abc123.brevo.com/subscribe`
4. Nel sito, cambia il bottone in:
   ```html
   <a href="https://abc123.brevo.com/subscribe" class="btn btn-success">
       Iscriviti via Brevo →
   </a>
   ```

---

## PASSO 7: Welcome Email Automatica

1. In Brevo, vai su **"Automation"** → **"Create workflow"**
2. Trigger: "Contact added to list"
3. Seleziona lista: "Robotica Weekly Subscribers"
4. Azione: "Send email"
5. Crea email di benvenuto con lead magnet

---

## ESEMPIO CODICE HTML DA INCOLLARE:

Se vuoi il codice pronto, dimmi e te lo preparo!

Oppure vai su Brevo → Forms → Crea → Copia codice embed!