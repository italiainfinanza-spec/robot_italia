# QA_CHECKLIST.md
## Quality Assurance Checklist (Shuri)

Usa questa checklist per ogni task che passa per QA. Sii scettica. Trova i problemi.

---

## Universal QA Checklist

### 1. Completeness
- [ ] Tutti i requirements del brief sono soddisfatti?
- [ ] Manca qualcosa di implicito che l'utente si aspetta?
- [ ] Ci sono edge cases non considerati?

### 2. Accuracy
- [ ] Tutti i fatti sono verificabili?
- [ ] I numeri sono corretti?
- [ ] Le date sono accurate?
- [ ] I link funzionano?

### 3. Clarity
- [ ] Un utente nuovo capisce tutto?
- [ ] Ci sono ambiguità?
- [ ] La struttura è logica?
- [ ] Le istruzioni sono actionable?

### 4. Consistency
- [ ] Terminologia coerente?
- [ ] Formattazione uniforme?
- [ ] Tone consistente?
- [ ] Con stili precedenti?

### 5. User Experience
- [ ] Mobile-friendly?
- [ ] Scannabile?
- [ ] Call to action chiara?
- [ ] Next steps ovvii?

---

## Content-Specific QA

### Per Newsletter:
- [ ] Subject line < 50 caratteri?
- [ ] Hook nei primi 2 sentences?
- [ ] Fonti citate correttamente?
- [ ] Disclaimer presente se necessario?
- [ ] Unsubscribe link funziona?
- [ ] Preview text compelling?
- [ ] Mobile preview OK?

### Per Sito Web:
- [ ] Responsive su mobile?
- [ ] Load time < 3 secondi?
- [ ] Tutti i link funzionano?
- [ ] Form di signup funziona?
- [ ] SSL certificate presente?
- [ ] SEO meta tags presenti?
- [ ] Analytics configurati?

### Per Codice/Script:
- [ ] Error handling presente?
- [ ] Documentazione adeguata?
- [ ] No hardcoded secrets?
- [ ] Testato localmente?
- [ ] Logs informativi?

### Per Research:
- [ ] Ogni claim ha fonte?
- [ ] Confidence levels appropriati?
- [ ] Data delle fonti chiara?
- [ ] Biases riconosciuti?
- [ ] Conflitti di interesse notati?

---

## Shuri's Edge Case Finder

### Pensa come un utente problematico:
- "Cosa succede se..."
- "E se faccio click qui..."
- "E se lascio vuoto..."
- "E se il dato è sbagliato..."

### Domande da fare sempre:
1. **"Ma cosa succede se..."** [scenario edge case]
2. **"Come fa l'utente a..."** [azione non ovvia]
3. **"Dove sta il fall-back se..."** [errore]
4. **"Questo è veramente necessario o..."** [feature bloat]
5. **"Un utente alle prime armi capirebbe..."** [complessità]

---

## QA Report Template

```markdown
# QA Report: [Task Name]
**QA By:** Shuri  
**Date:** [Data]  
**Status:** [PASS / NEEDS_REVISION / FAIL]

## Summary
[Breve overview di cosa hai testato]

## Issues Found

### 🔴 Critical (Must Fix)
1. [Issue description]
   - Impact: [Perché è grave]
   - Fix: [Cosa fare]

### 🟡 Warning (Should Fix)
1. [Issue description]
   - Impact: [Perché è importante]
   - Fix: [Cosa fare]

### 🟢 Suggestion (Nice to Have)
1. [Suggestion]
   - Benefit: [Perché migliorerebbe]

## What I Tested
- [ ] Scenario 1
- [ ] Scenario 2
- [ ] Edge case 1

## Questions for Author
1. [Domanda 1]
2. [Domanda 2]

## Recommendation
[PASS / NEEDS_REVISION / FAIL con motivazione]

---
**Shuri's Note:** [Commento sarcastico/costruttivo]
```

---

## Shuri's Golden Rules

1. **Trust but verify** - Non credere, controlla
2. **Assume incompetence** - Meglio trovare problemi che lasciarli passare
3. **User first** - Pensa sempre all'esperienza utente
4. **Document everything** - Se non è documentato, non esiste
5. **Be direct** - Feedback chiaro, non educato a scapito della chiarezza

---

## Emergency QA (When Short on Time)

Se hai solo 5 minuti, controlla:
1. 🔗 Tutti i link funzionano?
2. 📱 Mobile OK?
3. 🎯 CTA chiara?
4. ⚠️ Errori evidenti?

Se uno di questi fallisce → REJECT

---

**Remember:** "But what if the user does THIS?" 🧪
