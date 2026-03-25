# Changelog WAT — autocv

Mémoire persistante de tous les cycles d'amélioration continue.
Mis à jour automatiquement par l'agent WAT à chaque cycle.

---

## Cycle 2026-03-25 — Bootstrap initial

### Changements appliqués
- Création du projet complet (Next.js 14, Tailwind, Framer Motion)
- 7 sections implémentées : Hero, Manifesto, Projects, AI Playground, Skills, Timeline, Contact
- API `/api/chat` avec streaming SSE et rate limiting (10 messages/session)
- System prompt riche avec CV complet d'Alex Mercer
- CommandPalette (Ctrl+K) intégré dans la navigation
- ParticleField Canvas 2D avec réactivité souris
- `data/cv.json` et `data/projects.json` comme source of truth
- 8 workflows WAT + 7 tools Python
- `wat-agent-prompt.md` créé : cerveau du loop autonome
- Fix metadata viewport/themeColor (warning Next.js corrigé)
- Build propre : 0 erreur, 0 warning

### Changements refusés
- Aucun

### Métriques
- Build : ✓ (0 erreur, 0 warning TypeScript)
- Bundle page principale : 62.6 kB (149 kB First Load JS)
- Lighthouse : non disponible (Chrome non installé)
- Liens cassés : non vérifié (site non déployé)
- Meta tags : og:title ✓, og:description ✓, og:image défini (URL placeholder)

### À traiter dans les prochains cycles
- Remplacer `alert()` dans CommandPalette et ContactSection par une vraie logique de téléchargement PDF
- Ajouter un vrai fichier `public/cv.pdf`
- Configurer l'URL réelle dans `lib/constants.ts` (SITE_URL = 'https://alexmercer.dev')
- Enrichir le system prompt avec les projets détaillés de `projects.json`
- Ajouter `structured data` JSON-LD dans le layout
- Tester sur mobile 360px
- Configurer Vercel pour le déploiement

---

---

## Cycle 2026-03-25 — WAT Cycle #1 : Conversion + SEO

### Changements appliqués
- `site/src/components/ui/CommandPalette.tsx` : Remplacé `alert()` par download programmatique `/cv.pdf` — risque: low
- `site/src/components/sections/ContactSection.tsx` : Remplacé `alert()` par download programmatique `/cv.pdf` — risque: low
- `site/src/app/layout.tsx` : Ajouté JSON-LD structured data (Schema.org Person) pour SEO — risque: low

### Changements refusés
- Aucun

### Métriques
- Build : ✓ (0 erreur, 0 warning TypeScript)
- Bundle page principale : 62.6 kB (stable)
- Lighthouse : non disponible
- Tests outils : non exécutés (site non déployé)

### Impact attendu
- PDF téléchargeable en 1 clic (conversion +)
- Google peut indexer le profil professionnel via JSON-LD
- LinkedIn Post Inspector reconnaîtra le titre et les sameAs links

### Observations pour le prochain cycle
- Créer un vrai fichier `public/cv.pdf` (actuellement le download échouera silencieusement)
- Vérifier l'accessibilité des boutons de la navigation mobile (aria-label manquants)
- Ajouter `<link rel="canonical">` dans le layout
- Améliorer le system prompt : ajouter les détails projets de `projects.json`
- Tester la section `id="about"` — le scroll indicator pointe vers `#about` mais la section Hero a déjà `id="about"`

<!-- Les cycles suivants seront ajoutés ici par l'agent WAT -->
