# 00 — Master Loop WAT

## Objectif

Orchestrer l'amélioration continue automatique du portfolio via des cycles WAT
(Workflows / Agents / Tools). Chaque cycle analyse, améliore et vérifie sans jamais
dégrader la stabilité du site.

---

## Architecture

```
wat-agent-prompt.md     ← Le cerveau : logique de décision complète
00-master-loop.md       ← Ce fichier : comment invoquer l'agent
01..07-*.md             ← Workflows spécialisés (invoqués au besoin)
tools/                  ← Mesures réelles (Lighthouse, meta, links, bundles)
data/changelog.md       ← Mémoire persistante de tous les cycles
```

---

## Prérequis

```bash
# Node.js >= 18
node --version

# Python packages
pip install anthropic requests beautifulsoup4 pillow playwright

# Playwright (pour screenshot_compare.py)
playwright install chromium

# Lighthouse (optionnel mais recommandé)
npm install -g lighthouse

# Vérifier la clé API
grep ANTHROPIC_API_KEY /home/admin/Programmation/autocv/site/.env.local
# Ne doit PAS afficher "your_api_key_here"
```

---

## Lancer un cycle manuellement

```bash
cd /home/admin/Programmation/autocv/site
claude --print < ../workflows/wat-agent-prompt.md
```

Ou depuis la racine du projet :

```bash
cd /home/admin/Programmation/autocv
claude --print < workflows/wat-agent-prompt.md
```

---

## Automatiser avec le skill /schedule

Depuis une session Claude Code interactive :

```
/schedule
```

Configuration suggérée :
- **Fréquence** : quotidienne (09h00 UTC)
- **Prompt** : `run the WAT improvement cycle as defined in /home/admin/Programmation/autocv/workflows/wat-agent-prompt.md`
- **Working directory** : `/home/admin/Programmation/autocv/site`

---

## Séquence complète (cycle hebdomadaire approfondi)

Pour un cycle complet avec tous les outils de mesure :

### 1. Vérification initiale

```bash
cd /home/admin/Programmation/autocv/site
npm run build
# Doit passer sans erreur — si non, STOP et corriger d'abord
```

### 2. Agent WAT (améliorations code)

```bash
claude --print < ../workflows/wat-agent-prompt.md
```

### 3. Audit Lighthouse (si Chrome disponible)

```bash
npm start &
sleep 3
cd ..
python tools/lighthouse_audit.py \
  --url http://localhost:3000 \
  --output-dir ./reports/lighthouse \
  --threshold-performance 85 \
  --threshold-accessibility 90
```

### 4. Vérification des liens

```bash
python tools/link_checker.py --url http://localhost:3000
```

### 5. Vérification SEO/meta

```bash
python tools/meta_checker.py --url http://localhost:3000
```

### 6. Budget performance bundles

```bash
python tools/performance_budget.py --build-dir site/.next
```

### 7. Génération de contenu amélioré (optionnel)

```bash
# Nouvelles variations de tagline
python tools/content_generator.py --section tagline --count 5

# Analyse du system prompt IA
python tools/content_generator.py \
  --section system-prompt-analysis \
  --input site/src/lib/prompts.ts
```

### 8. Déploiement (si tout est vert)

Voir `07-deploy-check.md` pour la checklist complète.

---

## Critères de succès du cycle

- [ ] `npm run build` passe sans erreurs ni warnings TypeScript
- [ ] `data/changelog.md` mis à jour avec le résultat du cycle
- [ ] Aucune régression vs le cycle précédent (scores stables ou en hausse)
- [ ] Si Lighthouse disponible : Performance ≥ 85, A11y ≥ 90, SEO ≥ 95
- [ ] Zéro lien 404 interne

---

## Interpréter le changelog

```bash
# Voir les N derniers cycles
tail -100 data/changelog.md

# Chercher les échecs
grep "✗\|REFUS\|Rollback" data/changelog.md

# Voir l'évolution des métriques
grep "Build\|Bundles\|Lighthouse" data/changelog.md
```

---

## Escalade manuelle

Si l'agent WAT identifie une amélioration HIGH risk qu'il ne peut pas appliquer seul,
il la logge dans `data/changelog.md` sous `### À traiter manuellement`.

Tu peux ensuite décider de l'appliquer en session interactive avec Claude Code.

---

## Notes

- Un cycle WAT ne doit **jamais** toucher à la clé API ni aux variables d'environnement
- Les workflows `01` à `07` peuvent être invoqués indépendamment pour des audits ciblés
- En cas de doute sur un changement : **ne pas l'appliquer**
- Le portfolio doit rester **fonctionnel à 100% en permanence**
