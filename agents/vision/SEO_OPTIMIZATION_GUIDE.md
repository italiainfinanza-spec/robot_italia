# SEO_OPTIMIZATION_GUIDE.md
## SEO Best Practices (Vision)

Guida completa per ottimizzare contenuto e sito per i motori di ricerca.

---

## On-Page SEO

### 1. Title Tags
**Formula:** Primary Keyword | Brand Name

**Rules:**
- 50-60 caratteri max
- Keyword all'inizio
- Unico per ogni pagina
- Compelling (click-worthy)

**Examples:**
- ✅ "Investire in Robotica 2025 | Robotica Weekly"
- ✅ "Migliori Azioni Robotics | Analisi Mercato"
- ❌ "Home - Robotica Weekly"
- ❌ "Page 1 | Robotica Weekly"

---

### 2. Meta Descriptions
**Formula:** [Benefit] + [Keyword] + [Call to Action]

**Rules:**
- 150-160 caratteri max
- Include keyword principale
- Call to action chiara
- Unique per pagina

**Examples:**
- ✅ "Scopri le migliori opportunità di investimento nel settore robotics. Analisi giornaliere, trend di mercato e consigli per investitori. Iscriviti ora!"
- ❌ "Benvenuto sul nostro sito. Qui trovi notizie sulla robotica."

---

### 3. Header Structure (H1-H6)

**Hierarchy:**
```
H1 - One per page (main topic)
  H2 - Main sections
    H3 - Subsections
      H4 - Details
```

**Rules:**
- Solo UN H1 per pagina
- Include keyword in H1
- Usa keywords semantiche in H2
- Non saltare livelli (H1 → H3 ❌)

**Example:**
```html
<h1>Investire in Robotica: Guida Completa 2025</h1>
<h2>Trend del Mercato Robotics</h2>
<h3>Crescita del settore AI</h3>
```

---

### 4. URL Structure

**Best Practices:**
- URL brevi e descrittivi
- Keyword inclusa
- Trattini (-) non underscore (_)
- No parametri se possibile

**Examples:**
- ✅ `/investire-robotica-2025`
- ✅ `/azioni-robotics-migliori`
- ❌ `/page.php?id=123`
- ❌ `/investire_in_robotica`

---

### 5. Internal Linking

**Strategy:**
- 3-5 internal links per contenuto lungo
- Anchor text descrittivo (non "clicca qui")
- Link a contenuto rilevante
- Silo structure logica

**Examples:**
- ✅ "Scopri le <a href='/azioni-robotics'>migliori azioni robotics</a>"
- ❌ "Clicca <a href='/page'>qui</a> per saperne di più"

---

## Technical SEO

### 1. Mobile-First
- Responsive design obbligatorio
- Touch targets min 44px
- Font size min 16px
- No pop-up invasivi su mobile

### 2. Page Speed
**Target:** < 3 secondi load time

**Checklist:**
- [ ] Immagini compresse (WebP se possibile)
- [ ] CSS/JS minified
- [ ] Lazy loading immagini
- [ ] CDN attivo
- [ ] Caching headers

**Tools:**
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

### 3. Schema Markup

**Recommended Types:**
- Organization
- Article (per newsletter/blog)
- FAQPage
- BreadcrumbList

**Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Robotica Weekly",
  "url": "https://roboticaweekly.com",
  "logo": "https://roboticaweekly.com/logo.png"
}
```

### 4. XML Sitemap
- Genera automaticamente
- Includi solo URL importanti
- Update frequency appropriata
- Submit a Google Search Console

### 5. Robots.txt
```
User-agent: *
Allow: /

Sitemap: https://roboticaweekly.com/sitemap.xml
```

---

## Content SEO

### 1. Keyword Research

**Tools:**
- Google Keyword Planner (free)
- Ubersuggest (free tier)
- AnswerThePublic
- Google Trends

**Target Keywords (Robotica Weekly):**
- investire robotica
- azioni robotics
- startup robotica
- mercato robotica 2025
- fondi robotics

### 2. Content Optimization

**Keyword Placement:**
- Title tag
- H1 header
- First 100 words
- URL
- Meta description
- Image alt text
- Naturalmente nel testo

**Keyword Density:**
- 1-2% nel contenuto
- Varianti semantiche
- LSI keywords (Latent Semantic Indexing)

### 3. Content Quality Signals

**Google E-E-A-T:**
- **E**xperience - Esperienza pratica
- **E**xpertise - Competenza
- **A**uthoritativeness - Autorevolezza
- **T**rustworthiness - Affidabilità

**Per Robotica Weekly:**
- ✅ Cita fonti credibili
- ✅ Mostra expertise nel settore
- ✅ Backlinks da siti autorevoli
- ✅ About page con credenziali

---

## Off-Page SEO

### 1. Link Building

**Strategies:**
- Guest posting su blog finanziari/tech
- HARO (Help A Reporter Out)
- Partnership con influencer
- Link reclamation
- Content marketing

**Quality > Quantity**
- 1 link da Forbes > 100 link da siti spam

### 2. Social Signals
- Condivisioni su LinkedIn (target audience)
- Twitter/X engagement
- Community Reddit (r/robotics, r/investing)

### 3. Brand Mentions
- Monitora mention non linkate
- Reclama link quando possibile
- Tool: Google Alerts, Mention

---

## Local SEO (if applicable)

Se targettiamo Italia:
- Google My Business
- NAP consistency (Name, Address, Phone)
- Local keywords ("investire robotica Italia")
- Citazioni locali

---

## Analytics & Tracking

### 1. Setup Must-Have
- [ ] Google Analytics 4
- [ ] Google Search Console
- [ ] Heatmap (Hotjar/Microsoft Clarity)
- [ ] Core Web Vitals tracking

### 2. KPIs to Track
- Organic traffic
- Keyword rankings
- Click-through rate (CTR)
- Bounce rate
- Average time on page
- Conversion rate

### 3. Monthly SEO Audit
- [ ] Broken links check
- [ ] Page speed test
- [ ] Mobile usability
- [ ] Index coverage
- [ ] Backlink analysis

---

## SEO Quick Wins

### Immediate Actions:
1. ✅ Fix broken links
2. ✅ Compress images
3. ✅ Add meta descriptions mancanti
4. ✅ Setup Search Console
5. ✅ Create XML sitemap

### Short Term (1-2 weeks):
1. Optimize top 10 pages
2. Fix technical errors
3. Improve internal linking
4. Add schema markup

### Long Term (1-3 months):
1. Content strategy execution
2. Link building campaign
3. Competitor analysis
4. Regular content updates

---

## Vision's SEO Checklist

Prima di pubblicare:
- [ ] Title tag ottimizzato (<60 chars)
- [ ] Meta description presente (<160 chars)
- [ ] H1 con keyword
- [ ] URL SEO-friendly
- [ ] Internal links aggiunti
- [ ] Immagini compresse + alt text
- [ ] Mobile responsive
- [ ] Page speed OK
- [ ] Schema markup
- [ ] Analytics tracking

---

**Remember:** "What would someone search to find this?" 🔍
