# GitHub → Vercel Deployment Workflow

## 🚀 Setup Classico: Push → PR → Deploy

**Ultimo aggiornamento:** 2026-02-05

---

## ⚙️ **CONFIGURAZIONE RICHIESTA**

### **Step 1: Secrets GitHub**

Vai su: `GitHub Repo` → `Settings` → `Secrets and variables` → `Actions`

Aggiungi questi secrets:

| Secret | Valore | Dove trovarlo |
|--------|--------|---------------|
| `VERCEL_TOKEN` | `PM85WRIJkOGL9CW68rz58K8J` | Te l'ho già dato |
| `VERCEL_ORG_ID` | `team_xxx...` | Vercel Dashboard → Settings |
| `VERCEL_PROJECT_ID` | `prj_xxx...` | Vercel Project → Settings |

**Come trovare ORG_ID e PROJECT_ID:**
1. Vai su https://vercel.com/nadirs-projects-563ec239/robotica
2. Clicca **Settings** → **General**
3. Trovi sia `Project ID` che `Team ID` (ORG_ID)

---

## 📋 **WORKFLOW GIT**

### **Flusso classico:**

```bash
# 1. Fai modifiche al codice
# Modifica i file in /newsletter/website/

# 2. Commit e push
git add .
git commit -m "feat: descrizione modifica"
git push origin main

# 3. (Opzionale) Crea Pull Request su GitHub
# Vercel farà deploy preview automatico

# 4. Merge PR
# Vercel deploya automaticamente in produzione!
```

---

## 🔄 **COSA SUCCEDE AUTOMATICAMENTE:**

### **Push su `main`:**
→ Deploy immediato in **produzione** ✅

### **Pull Request:**
→ Deploy **preview** (URL temporaneo) ✅  
→ Commento automatico sulla PR con URL preview ✅

### **Merge PR:**
→ Deploy in **produzione** ✅

---

## 📁 **STRUTTURA PROGETTO**

```
robot_italia/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions (automazione)
│
├── newsletter/
│   └── website/
│       ├── vercel.json         ← Config Vercel
│       ├── index.html          ← Landing page
│       ├── admin/
│       │   └── index.html      ← Admin dashboard
│       └── ...
│
└── docs/
    └── GITHUB_VERCEL_SETUP.md  ← Questo file
```

---

## 🛠️ **CONFIGURAZIONE VERCEL**

**File:** `newsletter/website/vercel.json`

```json
{
  "public": true,
  "github": {
    "enabled": true
  },
  "outputDirectory": ".",
  "framework": null
}
```

---

## ✅ **CHECKLIST SETUP**

- [ ] Aggiungi secrets su GitHub (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] Verifica che GitHub Actions sia abilitato nel repo
- [ ] Fai un test push su main
- [ ] Controlla che il deploy sia andato a buon fine

---

## 🚨 **RISOLUZIONE PROBLEMI**

### **Deploy non parte?**
→ Controlla in `Actions` tab su GitHub

### **Errore authentication?**
→ Verifica che i secrets siano corretti

### **Deploy fallito?**
→ Controlla i log in GitHub Actions

---

## 📝 **NOTE**

- **Root directory:** `/newsletter/website`
- **Build command:** Nessuno (static HTML)
- **Output directory:** `.` (corrente)
- **Framework:** Static

---

**Setup completato! Ogni push su main si deploya automaticamente! 🚀**