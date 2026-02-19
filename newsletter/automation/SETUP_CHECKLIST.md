# Setup Checklist — AutoPilot Newsletter

## ✅ Prima di Attivare l'Automazione

### 1. API Keys

- [ ] **Brevo API Key** — https://app.brevo.com/settings/keys/api
- [ ] **Telegram Bot Token** — @BotFather
- [ ] **Telegram Chat ID** — @userinfobot
- [ ] **Brave API Key** (opzionale) — https://brave.com/search/api/
- [ ] **AI API Key** (OpenRouter/Anthropic) — per generazione contenuto

### 2. Configurazione Brevo

- [ ] Domain authentication (SPF/DKIM) verificato
- [ ] Sender email configurato (ciao@roboticaweekly.com)
- [ ] Contact lists create:
  - [ ] Lista FREE iscritti
  - [ ] Lista PRO iscritti
- [ ] Template HTML caricato su Brevo (opzionale)

### 3. Configurazione Telegram

- [ ] Bot creato con @BotFather
- [ ] Chat con bot avviata
- [ ] Chat ID ottenuto
- [ ] Test messaggio inviato con successo

### 4. Test Manuale

```bash
cd newsletter/automation
npm install

# Test 1: Telegram
npm run test:telegram
# Risultato atteso: info bot

# Test 2: Brevo  
npm run test:brevo
# Risultato atteso: info account

# Test 3: Workflow
npm run workflow init
npm run status
# Risultato atteso: "Initialized workflow run"

# Test 4: Research
npm run research
# Risultato atteso: X relevant stories found

# Test 5: Draft
npm run draft
# Risultato atteso: Newsletter content generated

# Test 6: Review
npm run review
# Risultato atteso: Telegram notification received
```

### 5. Configurazione Schedule

- [ ] Orario research confermato
- [ ] Orario approvazione confermato
- [ ] Orario send confermato
- [ ] Fuso orario corretto (Europe/Rome)

### 6. Fallback Manuale

- [ ] Template HTML di backup pronto
- [ ] Accesso Brevo dashboard per invio manuale
- [ ] Contenuto buffer (3 edizioni pronte)

### 7. Monitoring

- [ ] Log directory scrivibile
- [ ] Notifica errori configurata
- [ ] Pianificazione check settimanale

---

## 🚨 Checklist Sicurezza

- [ ] `.env` in `.gitignore`
- [ ] API keys rotazionate (non usare key di dev)
- [ ] Rate limiting Brevo verificato
- [ ] Telegram bot privato (non pubblico)

---

## 📊 Metriche da Monitorare

| Metrica | Target | Alert |
|---------|--------|-------|
| Open Rate FREE | >25% | <20% |
| Open Rate PRO | >45% | <35% |
| Click Rate | >5% | <3% |
| Bounce Rate | <2% | >5% |
| Unsubscribe | <0.5% | >1% |

---

## 🎯 Go Live

Quando tutto è ✅:

```bash
# Attiva cron job
# (o GitHub Actions)
# (o il tuo scheduler preferito)

# Monitora primo invio
npm run status
tail -f logs/automation.log
```

**Buona fortuna! 🤖✨**