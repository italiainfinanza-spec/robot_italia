# TEAM_COORDINATION.md
## Squad Coordination Playbook (Jarvis)

Guida per coordinare efficacemente il team di agenti.

---

## Daily Standup Template

```markdown
## Daily Standup - [Data]

### Jarvis (Squad Lead)
**Yesterday:** [Cosa ho fatto]
**Today:** [Cosa farò]
**Blockers:** [Ostacoli]

### Shuri (Product Analyst)
**Yesterday:**
**Today:**
**Blockers:**

### Fury (Researcher)
**Yesterday:**
**Today:**
**Blockers:**

### Loki (Content Writer)
**Yesterday:**
**Today:**
**Blockers:**

### Vision (SEO/Marketing)
**Yesterday:**
**Today:**
**Blockers:**

---
**Team Blockers:** [Cosa blocca il team]
**Escalations:** [Cosa serve dal user]
```

---

## Task Assignment Protocol

### Step 1: Assess
- Leggi WORKING.md
- Controlla task disponibili in mission-control/tasks.md
- Verifica carico di lavoro attuale di ogni agente

### Step 2: Match
- Skill richieste vs skill agente
- Carico attuale vs capacità
- Deadline vs disponibilità

### Step 3: Assign
1. Aggiorna tasks.md con assegnazione
2. Scrivi notifica in agents/[name]/NOTIFICATION.md
3. Aggiorna WORKING.md
4. (Opzionale) Invia messaggio se tool abilitato

### Step 4: Monitor
- Controlla progresso giornaliero
- Verifica heartbeat responses
- Unblock se necessario

### Step 5: Review
- Quando task completato
- Assegna a Shuri per QA
- Approva o richiedi revisione
- Archivia

---

## Communication Templates

### New Assignment
```
@[Agent] - New Assignment!

**TASK-[XXX]: [Title]**
Status: ASSIGNED TO YOU
Due: [Date]
Priority: [HIGH/MEDIUM/LOW]

**Mission:**
[Brief description]

**Requirements:**
- [Requirement 1]
- [Requirement 2]

**Deliverables:**
1. [File/Output 1]
2. [File/Output 2]

**Context:**
[Perché questo task è importante]

**Next Steps:**
1. Read your SOUL.md
2. Check tasks.md for full details
3. Start work
4. Update WORKING.md with progress

Questions? Ask Jarvis.
```

### Task Complete Notification
```
🎉 TASK-[XXX] COMPLETED

**Completed by:** @[Agent]
**Reviewed by:** @[Reviewer]
**Status:** ✅ APPROVED

**Summary:**
[Cos'è stato fatto]

**Deliverables:**
- [Link 1]
- [Link 2]

**Next:**
[Prossimo task dipendente]
```

### Blocker Escalation
```
🚨 BLOCKER ALERT

**Task:** TASK-[XXX]
**Blocked Agent:** @[Agent]
**Issue:** [Descrizione del problema]

**Tried:**
- [Cosa abbiamo provato]

**Need:**
[Cosa serve per sbloccare]

**Impact:**
[Conseguenze se non risolto]

**Requested by:** Jarvis
```

---

## Sprint Planning

### Weekly Sprint Structure

**Monday:**
- Sprint planning meeting
- Assegnazione task settimanali
- Review obiettivi

**Daily:**
- Standup (async via file updates)
- Blocker resolution
- Progress tracking

**Friday:**
- Sprint review
- Demo completed work
- Retrospective

### Sprint Goal Template
```markdown
## Sprint [Week] Goals

**Theme:** [Focus della settimana]

### Objectives
1. [Obiettivo 1] - Owner: [Agent]
2. [Obiettivo 2] - Owner: [Agent]

### Definition of Done
- [ ] Criteria 1
- [ ] Criteria 2

### Success Metrics
- [Metrica 1]
- [Metrica 2]
```

---

## Conflict Resolution

### When Agents Disagree
1. **Acknowledge** - Riconosci entrambi i punti di vista
2. **Evidence** - Chiedi dati/fatti a supporto
3. **User Impact** - Focus su cosa è meglio per l'utente
4. **Decision** - Jarvis decide (benevol dictatorship)
5. **Document** - Spiega la decisione

### Priority Override Rules
1. User-facing issues > Internal tools
2. Revenue-impacting > Nice to have
3. Time-sensitive > Long-term
4. Blocking > Parallel

---

## Team Health Monitoring

### Red Flags
- [ ] Agent non risponde a heartbeat 2x
- [ ] Task overdue senza comunicazione
- [ ] Qualità output in calo
- [ ] Conflitti ricorrenti
- [ ] Blocchi frequenti

### Actions
1. Check-in 1-on-1
2. Review workload
3. Reassign if necessary
4. Escalate to user if persistent

---

## Success Metrics

### Team Velocity
- Tasks completed per sprint
- Average task duration
- Rework rate
- Blocker frequency

### Quality Metrics
- QA pass rate
- Bug reports post-delivery
- User feedback scores

### Collaboration
- Cross-agent tasks completed
- Knowledge sharing instances
- Documentation quality

---

## Jarvis's Golden Rules

1. **Clear is kind** - Comunicazione chiara > educata ma vaga
2. **Context matters** - Spiega sempre il "perché"
3. **Unblock fast** - Ostacoli risolti rapidamente
4. **Celebrate wins** - Riconosci il lavoro ben fatto
5. **Learn from failures** - Retrospectives onesti

---

## Emergency Contacts

**User (Human):** @Nadirbalena
**Jarvis:** Squad Lead
**Friday (Dev):** [Da assumere]

**Escalation Path:**
Agent → Jarvis → User

---

**Remember:** "A team is only as strong as its weakest link. Elevate everyone." 🎯
