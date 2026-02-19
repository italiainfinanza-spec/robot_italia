# 🤖 Robotica Weekly — AutoPilot System

Sistema completamente automatizzato per la creazione e invio della newsletter.

## 🎯 Visione

```
Martedì 06:00 → Fury cerca news
       06:30 → Loki scrive contenuto
       07:00 → Shuri QA review
       09:00 → 📱 NOTIFICA A TE (1h prima)
       10:00 → ✅ Auto-send (se approvato)
```

**Tu devi solo:** premere ✅, ❌ o ✏️ dall'app Telegram.

---

## 📁 Struttura

```
automation/
├── config/
│   └── workflow.json          # Configurazione sistema
├── scripts/
│   ├── workflow.js            # Orchestratore principale
│   ├── research.js            # Ricerca news (Fury)
│   ├── generator.js           # Generazione contenuto (Loki)
│   ├── notify.js              # Notifica Telegram
│   └── sender.js              # Invio Brevo
├── logs/
│   ├── workflow-state.json    # Stato workflow corrente
│   └── automation.log         # Log operazioni
└── package.json
```

---

## 🚀 Setup

### 1. Installazione

```bash
cd newsletter/automation
npm install
```

### 2. Variabili Ambiente

Crea file `.env`:

```bash
# Brevo (per invio email)
BREVO_API_KEY=your_brevo_api_key_here

# Telegram (per notifiche)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here

# Brave API (per ricerca web)
BRAVE_API_KEY=your_brave_api_key_here

# OpenRouter/Anthropic (per AI generation)
AI_API_KEY=your_ai_key_here
```

### 3. Configurazione Telegram Bot

1. Crea bot con [@BotFather](https://t.me/BotFather)
2. Ottieni token: `/newbot` → nome → copia token
3. Ottieni chat ID: scrivi a [@userinfobot](https://t.me/userinfobot)
4. Inserisci in `.env`

### 4. Test

```bash
# Verifica Telegram
npm run test:telegram

# Verifica Brevo
npm run test:brevo

# Verifica stato workflow
npm run status
```

---

## 🔄 Workflow

### Fasi Automatiche

| Fase | Descrizione | Tempo |
|------|-------------|-------|
| **Research** | Cerca news da RSS e API | ~10 min |
| **Draft** | Genera contenuto con AI | ~5 min |
| **Review** | Prepara per approvazione | ~2 min |
| **Approval** | ⏳ Aspetta tuo OK | 60 min |
| **Send** | Invia via Brevo | ~2 min |

### Comandi Manuali

```bash
# Inizia nuovo workflow
npm run workflow init

# Solo ricerca
npm run research

# Solo generazione contenuto
npm run draft

# Solo notifica approvazione
npm run review

# Solo invio (se approvato)
npm run send

# Workflow completo (per test)
npm run full
```

---

## 📱 Flusso Approvazione

### 1. Ricevi Notifica (Telegram)

```
🤖 Robotica Weekly — Approvazione Richiesta

📧 Edizione: #42
📝 Oggetto: NVIDIA lancia Physical AI | Robotica Weekly #42

Preview contenuto:
Jensen Huang ha dichiarato: "Il momento ChatGPT per la robotica è arrivato..."

Sezioni:
• Headline: NVIDIA Physical AI Platform
• Notizie: 4 stories
• Tipo: 🔒 Premium

⏰ Invio automatico tra 60 minuti

[✅ INVIA ORA] [❌ RINVIA]
[✏️ MODIFICA]   [📋 VEDI TUTTO]
```

### 2. Tua Azione

| Bottone | Effetto |
|---------|---------|
| ✅ **INVIA ORA** | Newsletter inviata immediatamente |
| ❌ **RINVIA** | Workflow annullato, puoi riavviare |
| ✏️ **MODIFICA** | Pausa workflow, descrivi modifiche |
| 📋 **VEDI TUTTO** | Ricevi contenuto completo |

### 3. Conferma Invio

```
✅ Newsletter approvata!
Verrà inviata automaticamente.

📊 Stats:
• Inviata a: 2,543 iscritti FREE
• Inviata a: 87 iscritti PRO
• Message ID: brevo-123456
```

---

## ⚙️ Configurazione

### Modificare Schedule

Edita `config/workflow.json`:

```json
{
  "schedule": {
    "research_day": "tuesday",
    "research_time": "06:00",
    "approval_time": "09:00",
    "send_time": "10:00",
    "timezone": "Europe/Rome"
  }
}
```

### Aggiungere Fonti News

```json
{
  "news_sources": {
    "rss_feeds": [
      "https://il-tuo-feed.xml",
      ...
    ],
    "api_sources": {
      "newsapi": {
        "queries": [
          "robotics startup italy",
          ...
        ]
      }
    }
  }
}
```

---

## 🔧 Troubleshooting

### Workflow si blocca

```bash
# Verifica stato
npm run status

# Cancella stato corrente
rm logs/workflow-state.json

# Riavvia
npm run workflow init
```

### Telegram non arriva

1. Verifica token: `npm run test:telegram`
2. Controlla chat ID
3. Assicurati di aver avviato chat con bot

### Brevo non invia

1. Verifica API key: `npm run test:brevo`
2. Controlla domain verification in Brevo
3. Verifica sender email autorizzata

---

## 📊 Monitoring

### Log in tempo reale

```bash
tail -f logs/automation.log
```

### Stato workflow

```bash
npm run status
```

Output:
```
📊 Workflow Status
==================
Current Run: run-1708369200000
Edition: #42
Status: awaiting_approval

Phases:
  ✅ research: completed
  ✅ draft: completed
  ⏳ review: awaiting_approval
  ⏳ send: pending
```

---

## 🚀 Deployment

### GitHub Actions (Consigliato)

Crea `.github/workflows/newsletter.yml`:

```yaml
name: AutoPilot Newsletter
on:
  schedule:
    - cron: '0 6 * * 2'  # Martedì 6:00
  workflow_dispatch:  # Manuale

jobs:
  newsletter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd newsletter/automation && npm ci
      - run: npm run full
        env:
          BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_ADMIN_CHAT_ID: ${{ secrets.TELEGRAM_ADMIN_CHAT_ID }}
```

---

## 🎓 Come Funziona

```
┌─────────────────────────────────────────────────────────────┐
│                     ROBOTICA WEEKLY                         │
│                      AUTOPILOT SYSTEM                       │
└─────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  FURY    │───→│  LOKI    │───→│  SHURI   │
  │ Research │    │  Writer  │    │   QA     │
  └──────────┘    └──────────┘    └──────────┘
       │                               │
       └───────────────────────────────┘
                   │
                   ▼
           ┌──────────────┐
           │   NOTIFIER   │◄─── 📱 Telegram
           │  (1h before) │
           └──────────────┘
                   │
              ✅ / ❌ / ✏️
                   │
                   ▼
           ┌──────────────┐
           │    SENDER    │───→ 📧 Brevo
           │  (Auto-send) │
           └──────────────┘
```

---

## 📝 Roadmap

- [ ] AI content generation con Claude API
- [ ] A/B testing automatico subject lines
- [ ] Personalizzazione contenuto per segmenti
- [ ] Analytics dashboard
- [ ] Fallback umano se AI fallisce

---

**Pronto per il lancio autonomo?** 🚀

Controlla `SETUP_CHECKLIST.md` prima di attivare!