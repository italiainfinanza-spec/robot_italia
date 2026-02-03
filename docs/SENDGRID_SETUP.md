## 🔑 Come Dare Accesso a SendGrid

### Step 1: Crea Account SendGrid
1. Vai su https://signup.sendgrid.com/
2. Registrati con email: `nadir.balena@gmail.com`
3. Completa verifica email

### Step 2: Genera API Key
1. Logga in SendGrid
2. Vai su **Settings** → **API Keys**
3. Clicca **Create API Key**
4. Nome: `RoboticaWeekly-Production`
5. Permissions: **Full Access** (o almeno "Mail Send")
6. Copia la key (inizia con `SG.`)

### Step 3: Configura in OpenClaw
**Opzione A - Environment Variable (Consigliata):**
```bash
export SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
```

**Opzione B - File di configurazione:**
Modifica `/home/ubuntu/.openclaw/workspace/.env`:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
```

### Step 4: Verifica Sender
1. In SendGrid, vai su **Settings** → **Sender Authentication**
2. Verifica dominio (roboticaweekly.com) OPPURE
3. Verifica single sender (nadir.balena@gmail.com)

### Step 5: Test Invio
Dopo configurazione, testo invio:
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer SG.xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"nadir.balena@gmail.com"},"subject":"Test","content":[{"type":"text/plain","value":"Hello"}]}'
```

### Step 6: Dammi la Key
Una volta creato, mandami:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
```

---

## 📧 Cosa Farò con SendGrid

Una volta configurato:
1. ✅ Invio newsletter automatico
2. ✅ Gestione liste iscritti
3. ✅ Tracking aperture/clicks
4. ✅ Template email dinamici
5. ✅ Programmazione invii

## 💰 Costi
- **Free Tier:** 100 email/giorno (perfetto per inizio)
- **Essentials:** $19.95/mese per 50,000 email

---

**Mandami la API Key appena creata!** 🚀
