# 🤖 Claude AI Integration + OpenClaw Notifications

**Aggiornamento:** 2026-02-19

---

## ✨ NOVITÀ

### 1. **Claude AI Integration** — Contenuto di Qualità Superiore

**Prima:** Template locali con semplici sostituzioni  
**Ora:** Claude (Anthropic) genera contenuto professionale

**Vantaggi:**
- ✅ Testo più naturale e coinvolgente
- ✅ Analisi più profonde (per PRO)
- ✅ Adatta tono al pubblico (FREE vs PRO)
- ✅ Genera insight originali dai dati

### 2. **OpenClaw Notifications** — Usa Questa Chat!

**Prima:** Dovevi creare bot Telegram separato  
**Ora:** Ricevi notifiche direttamente in questa chat!

**Come funziona:**
1. Workflow genera contenuto
2. Io (Jinx) ti scrivo qui su Telegram
3. Tu rispondi: "INVIA" / "RINVIA" / "MODIFICA: ..."
4. Workflow procede automaticamente

---

## 🚀 Setup Claude AI

### Step 1: Ottieni API Key

1. Vai su https://console.anthropic.com/
2. Crea account (o accedi)
3. Vai su "Get API Keys"
4. Genera nuova key
5. Copia `sk-ant-...`

### Step 2: Aggiungi a GitHub Secrets

Vai su: `https://github.com/italiainfinanza-spec/robot_italia/settings/secrets/actions`

Aggiungi:
```
Name: CLAUDE_API_KEY
Value: sk-ant-la-tua-key
```

### Step 3: Aggiorna GitHub Actions

Il workflow `.github/workflows/newsletter-autopilot.yml` è già aggiornato per usare `CLAUDE_API_KEY`.

### Step 4: Test

```bash
cd newsletter/automation
export CLAUDE_API_KEY=sk-ant-la-tua-key
npm run full
```

---

## 💰 Costo Claude AI

| Modello | Costo | Note |
|---------|-------|------|
| **Claude 3.5 Sonnet** | $3/M input + $15/M output | **Consigliato** — ottimo rapporto qualità/prezzo |
| **Claude 3 Opus** | $15/M input + $75/M output | Qualità superiore per PRO |

**Stima costo reale:**
- Newsletter FREE: ~$0.02-0.04 (1K-2K token)
- Newsletter PRO: ~$0.05-0.10 (3K-5K token)
- **Totale mensile:** ~$0.10-0.50 (4 newsletter/mese)

---

## 📱 Come Funzionano le Notifiche (OpenClaw)

### Flusso Completo:

```
Martedì 06:00 → GitHub Actions parte
         06:15 → Claude genera contenuto
         06:30 → Io (Jinx) ti scrivo su Telegram:
```

**Messaggio che ricevi:**
```
🤖 Robotica Weekly — Approvazione Richiesta

📧 Edizione: #43
📝 Oggetto: NVIDIA lancia Physical AI | Robotica Weekly #43
🤖 AI: claude-3-5-sonnet-20241022

Preview:
Jensen Huang ha dichiarato che il momento ChatGPT per la 
robotica è arrivato. NVIDIA ha svelato Physical AI, una 
piattaforma che potrebbe fare per i robot ciò che Android 
ha fatto per gli smartphone...

Sezioni:
• Trend, Deal, Top Stories, Market Data
• Tipo: 🔒 Premium

⏰ Invio automatico tra 60 minuti

---

Cosa vuoi fare?

Rispondi con:
• "INVIA" o "✅" → Approva e invia subito
• "RINVIA" o "❌" → Annulla questa edizione
• "MODIFICA: [cosa cambiare]" → Richiedi modifiche
• "VEDI" → Ricevi contenuto completo
```

### Le Tue Risposte:

| Tu scrivi | Cosa succede |
|-----------|--------------|
| `INVIA` | ✅ Newsletter inviata immediatamente |
| `RINVIA` | ❌ Workflow annullato, nessun invio |
| `MODIFICA: più breve` | ✏️ Rigenero con modifiche |
| `VEDI` | 📋 Ricevi contenuto completo |

---

## 🔄 Workflow Aggiornato

```
06:00 UTC  → GitHub Actions trigger
     ↓
06:05      → Research (RSS + web search)
     ↓  
06:15      → Claude AI genera contenuto
     ↓
06:30      → 📱 NOTIFICA via OpenClaw (questa chat)
     ↓
06:30-07:30 → ⏳ Aspetta tua risposta (60 min)
     ↓
07:30      → ✅ Invio via Brevo (se approvato)
```

---

## 🛠️ Files Aggiornati

| File | Cambiamento |
|------|-------------|
| `scripts/ai-generator.js` | **NUOVO** — Integrazione Claude API |
| `scripts/generator.js` | Aggiornato per usare AI |
| `scripts/notify-openclaw.js` | **NUOVO** — Notifiche via OpenClaw |
| `scripts/workflow.js` | Aggiornato per OpenClaw + Claude |
| `.env.example` | Aggiunto CLAUDE_API_KEY |
| `.github/workflows/newsletter-autopilot.yml` | Aggiunto env CLAUDE_API_KEY |

---

## 🎯 Miglioramenti Contenuto (Claude vs Template)

### Esempio: Headline

**Template locale:**
> NVIDIA annuncia Physical AI platform

**Claude AI:**
> Jensen Huang ha dichiarato: "Il momento ChatGPT per la robotica è arrivato." Ecco cosa significa per gli investitori.

### Esempio: Analisi

**Template locale:**
> NVIDIA ha lanciato una nuova piattaforma. Potrebbe crescere.

**Claude AI:**
> NVIDIA sta replicando la strategia Android: non costruisce robot, costruisce il sistema operativo che li farà funzionare tutti. Questo è un moat difensivo che potrebbe catturare il 60%+ del valore software robotico. McKinsey stima 7 trilioni di investimenti entro il 2030.

---

## ⚙️ Configurazione Avanzata

### Scegliere Modello Claude

Edita `scripts/ai-generator.js`:

```javascript
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'; // Veloce, economico
// const CLAUDE_MODEL = 'claude-3-opus-20240229';  // Qualità massima
```

### Personalizzare Prompt

Edita `buildClaudePrompt()` in `scripts/ai-generator.js`:

Puoi modificare:
- Tono (più formale / più colloquiale)
- Lunghezza sezioni
- Stile analisi (per PRO)
- Call-to-action

---

## 🐛 Troubleshooting

### Claude API non risponde

**Sintomo:** Workflow si blocca in "draft"

**Soluzione:**
```bash
# Verifica API key
export CLAUDE_API_KEY=sk-ant-...
curl -H "x-api-key: $CLAUDE_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     https://api.anthropic.com/v1/models
```

**Fallback:** Se Claude fallisce, usa automaticamente template locali.

### Non ricevi notifiche

**Sintomo:** Workflow arriva a "review" ma non ricevi messaggio

**Soluzione:**
1. Controlla che GitHub Actions abbia completato
2. Verifica in Actions logs: cerca "OPENCLAW_NOTIFICATION"
3. Il messaggio viene anche salvato in `logs/pending-approval.txt`

---

## 🎓 Perché Claude e non GPT?

| | Claude | GPT-4 |
|---|--------|-------|
| **Lunghezza** | 200K contesto | 128K contesto |
| **Italiano** | Eccellente | Buono |
| **Analisi** | Più profonda | Più superficiale |
| **Prezzo** | $3-15/M token | $10-30/M token |
| **Velocità** | Rapido | Rapido |

**Verdetto:** Claude 3.5 Sonnet è il miglior rapporto qualità/prezzo per newsletter.

---

## 📊 Confronto Costi Mensili

| Setup | Costo/Newsletter | Costo/Mese |
|-------|------------------|------------|
| **Solo template locali** | €0 | €0 |
| **Claude 3.5 Sonnet** | ~€0.03 | ~€0.12 |
| **Claude 3 Opus** | ~€0.08 | ~€0.32 |
| **GPT-4** | ~€0.10 | ~€0.40 |

**Raccomandazione:** Claude 3.5 Sonnet — qualità superiore a costo irrisorio.

---

## ✅ Checklist Attivazione

- [ ] Ottenere CLAUDE_API_KEY da Anthropic
- [ ] Aggiungere key a GitHub Secrets
- [ ] Test locale: `export CLAUDE_API_KEY=... && npm run full`
- [ ] Verificare notifica arrivi su questa chat
- [ ] Testare risposte: INVIA, RINVIA, MODIFICA
- [ ] Confermare invio Brevo funziona

---

**Pronto per il lancio con AI! 🚀🤖**

*Commit: [inserire dopo push]*