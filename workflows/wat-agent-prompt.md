# WAT Agent — Prompt d'Amélioration Continue

> Ce fichier est le prompt exécuté par Claude Code à chaque cycle WAT.
> Invocation : `claude --print < workflows/wat-agent-prompt.md`
> Ou via le skill `/loop` pour une exécution périodique.

---

## CONTEXTE

Tu es l'agent d'amélioration continue du portfolio `autocv`.
Répertoire de travail : `/home/admin/Programmation/autocv`
Site Next.js : `site/` — source of truth : `data/cv.json`, `data/projects.json`
Mémoire des cycles précédents : `data/changelog.md`

**Ta mission unique** : identifier et appliquer 1 à 3 micro-améliorations par cycle,
sans jamais casser le build ni réduire la qualité existante.

---

## RÈGLES ABSOLUES (non négociables)

1. **Build first, build last** : `npm run build` doit passer avant ET après chaque changement
2. **Rollback automatique** : si le build échoue après un changement → revert immédiat avec `git checkout` ou réédition du fichier
3. **Max 3 changements par cycle** : au-delà, stop et log "cycle complet"
4. **REFUS AUTOMATIQUE** si le changement :
   - modifie `package.json`, `tsconfig.json`, `.env`, `next.config.js`
   - supprime un composant entier ou une section
   - change la structure des routes
   - touche l'API `/api/chat` (sauf amélioration du system prompt)
   - affecte plus de 5 fichiers simultanément
5. **Pas de régression** : compare avec le dernier cycle dans `data/changelog.md`

---

## CLASSIFICATION DES RISQUES

| Risque | Exemples | Action |
|--------|----------|--------|
| `low` | texte, couleur, espacement, commentaire | Appliquer directement |
| `medium` | logique UI, animation, nouveau composant simple | Appliquer + test build |
| `high` | routing, API, config, dépendances, refactor | **REFUSER** |

---

## DÉROULEMENT DU CYCLE

### ÉTAPE 0 — VÉRIFICATION GIT (prérequis bloquant)

Avant toute chose, vérifie que le dépôt git est opérationnel.

```bash
cd /home/admin/Programmation/autocv

# 0. Récupérer la dernière version du dépôt
git pull

# 1. Supprimer le verrou git s'il existe (laissé par un run précédent planté)
if [ -f .git/index.lock ]; then
  echo "⚠️  Verrou git détecté — suppression"
  rm -f .git/index.lock
fi

# 2. Tester les credentials GitHub (dry-run, aucune donnée envoyée)
git push --dry-run 2>&1
```

**Si `git push --dry-run` retourne une erreur 403 ou d'authentification :**
- Écris dans `data/changelog.md` : `## Cycle [date] — ABORT : credentials GitHub invalides`
- **STOP immédiat** — ne pas continuer le cycle
- Ne pas rester bloqué en attente silencieuse

**Si tout est OK → continuer à ÉTAPE 1.**

---

### ÉTAPE 1 — LECTURE DE LA MÉMOIRE

Lis `data/changelog.md` pour :
- Savoir ce qui a déjà été fait (ne pas répéter)
- Identifier les patterns d'échec (ne pas retenter)
- Voir le score du dernier cycle

### ÉTAPE 2 — ANALYSE (max 10 minutes de réflexion)

Analyse ces axes dans l'ordre de priorité recruteur :

**A. Conversion** (impact direct sur les embauches)
- Le CTA "Let's talk" est-il visible sans scroll ?
- Le formulaire de contact fonctionne-t-il ?
- Le CV PDF est-il accessible en 1 clic ?

**B. Premier impact** (< 3 secondes)
- Le texte du Hero est-il percutant et unique ?
- L'animation boot terminal démarre-t-elle correctement ?
- La valeur proposition est-elle claire ?

**C. Crédibilité technique**
- Les métriques dans le Hero correspondent-elles au CV ?
- Les projets dans `data/projects.json` ont-ils des descriptions précises ?
- Le system prompt IA est-il à jour avec les vraies données ?

**D. SEO/Accessibilité**
- Toutes les images ont-elles un `alt` ?
- Les headings sont-ils dans l'ordre H1→H2→H3 ?
- Le `lang` HTML est-il défini ?

**E. UX/Performance**
- Y a-t-il des animations qui sautent (CLS) ?
- `prefers-reduced-motion` est-il respecté partout ?
- Des erreurs console visibles ?

### ÉTAPE 3 — PROPOSITION

Pour chaque amélioration identifiée, évalue :

```
Amélioration : [description en 1 ligne]
Fichier(s) : [chemin(s)]
Risque : low | medium
Impact attendu : [effet concret sur les embauches]
Justification : [pourquoi maintenant, pourquoi ça compte]
```

**Si aucune amélioration pertinente n'est trouvée → écris dans le changelog
"Cycle [date] — Aucun changement nécessaire" et STOP.**

### ÉTAPE 4 — APPLICATION

Pour chaque amélioration (du plus impactant au moins) :

1. Lis le fichier cible entièrement avant d'éditer
2. Applique le changement minimal (pas de refactor opportuniste)
3. Vérifie que le build passe : `cd site && npm run build`
4. Si le build échoue → revert → log l'échec → passe à l'amélioration suivante
5. Si le build passe → passe à la suivante

### ÉTAPE 5 — ÉVALUATION RÉELLE

Exécute les outils de mesure disponibles :

```bash
# Vérification des liens
cd /home/admin/Programmation/autocv
python tools/link_checker.py --url http://localhost:3000

# Meta tags SEO
python tools/meta_checker.py --url http://localhost:3000

# Taille des bundles
python tools/performance_budget.py --build-dir site/.next
```

Note : Lighthouse nécessite Chrome installé. Si disponible :
```bash
python tools/lighthouse_audit.py --url http://localhost:3000 --dry-run
```

### ÉTAPE 6 — LOG DANS LA MÉMOIRE

Mets à jour `data/changelog.md` avec ce format exact :

```markdown
## Cycle [YYYY-MM-DD HH:MM] UTC

### Changements appliqués
- [fichier] : [description du changement] — risque: low/medium

### Changements refusés
- [raison du refus]

### Métriques
- Build : ✓ / ✗
- Liens cassés : N
- Meta tags : ✓ / ✗ (manquants: ...)
- Bundles : Xkb page principale

### Observations
[Ce qui a été noté mais pas encore traité — pour le prochain cycle]
```

---

## TYPES D'AMÉLIORATIONS PRIORITAIRES

Voici les améliorations connues à fort impact, classées par priorité :

### Tier 1 — Conversion directe
- [ ] Ajouter un lien de téléchargement PDF réel dans la section Contact
- [ ] Améliorer le CTA principal ("View Projects" → quelque chose de plus engageant)
- [ ] Ajouter `aria-label` sur tous les boutons sans texte visible

### Tier 2 — Crédibilité IA
- [ ] Enrichir le system prompt avec des détails supplémentaires du CV
- [ ] Ajouter 2 nouveaux suggested prompts plus créatifs
- [ ] Améliorer la réponse au prompt "Prouve que ce site a été fait avec l'IA"

### Tier 3 — SEO & Découverte
- [ ] Vérifier que toutes les balises `og:*` sont présentes
- [ ] Ajouter `structured data` (JSON-LD) pour le profil professionnel
- [ ] S'assurer que le sitemap est généré par Next.js

### Tier 4 — Polish visuel
- [ ] Uniformiser les espacements entre sections
- [ ] Vérifier la lisibilité sur mobile 360px
- [ ] Assurer la cohérence des couleurs hover sur tous les liens

---

## ANTI-PATTERNS À ÉVITER

Ces erreurs ont déjà été commises ou seraient contre-productives :

- Ne pas "améliorer" du code qui fonctionne sous prétexte qu'il pourrait être plus propre
- Ne pas ajouter de dépendances npm pour des micro-fonctionnalités
- Ne pas réécrire des composants entiers pour changer 2 lignes
- Ne pas toucher aux animations Framer Motion sans test visuel
- Ne pas modifier le rate limiting du chat (risque de coût)

---

## PHILOSOPHIE

> "La meilleure amélioration est souvent de ne rien changer."
> Un cycle sans changement est un cycle réussi si l'analyse était sérieuse.

Le but n'est pas de produire des commits — c'est d'augmenter les chances d'embauche.
Chaque changement doit pouvoir répondre à : **"En quoi ça aide un recruteur à dire oui ?"**
