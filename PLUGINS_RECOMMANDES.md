# Plugins Recommandés pour VIVR

> Liste complète des plugins Claude Code pertinents pour le projet e-commerce VIVR
> Projet: Application web e-commerce de décoration intérieure
> Stack: Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma, Stripe, NextAuth

---

## Table des Matières

1. [Développement & Code](#développement--code)
2. [Git & Versioning](#git--versioning)
3. [Tests & Qualité](#tests--qualité)
4. [Base de Données](#base-de-données)
5. [API & Backend](#api--backend)
6. [Frontend & UI](#frontend--ui)
7. [Sécurité](#sécurité)
8. [DevOps & Déploiement](#devops--déploiement)
9. [Documentation](#documentation)
10. [Planning & Gestion](#planning--gestion)
11. [Debug & Performance](#debug--performance)
12. [Outils Spécialisés](#outils-spécialisés)

---

## Développement & Code

### Skills (Commandes `/`)

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/feature-dev` | Développement guidé de fonctionnalités avec focus architecture | Nouvelles features e-commerce |
| `/plan` | Planification d'implémentation | Planifier les sprints |
| `/discuss` | Discussion technique collaborative | Brainstorming features |
| `/code-review` | Revue de code complète | Revue avant merge |
| `/refractor` | Refactoring avec best practices | Optimiser le code existant |
| `/optimize` | Analyse et optimisation des performances | Améliorer vitesse du site |
| `/ai-pair-programming:pair` | Session de pair programming IA | Développement assisté |
| `/ai-pair-programming:suggest` | Suggestions d'amélioration intelligentes | Idées d'amélioration |
| `/ai-pair-programming:explain` | Explications détaillées du code | Comprendre le code legacy |

### Agents (Task tool)

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `frontend-developer` | Développeur frontend expert | Composants React, UI |
| `backend-architect` | Architecte backend | API Routes, Prisma |
| `code-architect` | Architecte code | Structure projet |
| `web-dev` | Développeur web généraliste | Full-stack |
| `react-native-dev` | Développeur React Native | Si app mobile future |
| `rapid-prototyper` | Prototypage rapide | POC nouvelles features |

---

## Git & Versioning

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/commit` | Commits conventionnels avec emojis | Commits standardisés |
| `/commit-commands:commit-push-pr` | Commit + Push + PR en une commande | Workflow rapide |
| `/commit-commands:clean_gone` | Nettoyage branches supprimées | Maintenance repo |
| `/create-pull-request` | Création PR avec template | PRs bien formatées |
| `/create-worktrees` | Gestion worktrees git | Travail multi-branches |
| `/update-branch-name` | Mise à jour noms de branches | Conventions de nommage |
| `/pr-review` | Revue de Pull Request | Review avant merge |
| `/fix-pr` | Correction commentaires PR | Résoudre feedback |
| `/pr-review-toolkit:review-pr` | Revue PR complète multi-agents | Review approfondie |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `pr-review-toolkit:code-reviewer` | Revue de code PR | Quality gate |
| `pr-review-toolkit:code-simplifier` | Simplification du code | Réduire complexité |
| `pr-review-toolkit:comment-analyzer` | Analyse des commentaires | Comprendre feedback |
| `changelog-generator` | Génération changelog | Release notes |

---

## Tests & Qualité

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/test-file` | Tests complets pour un fichier | Couvrir composants/API |
| `/double-check` | Vérification que le travail est fini | Validation finale |
| `/code-review-assistant` | Assistant revue de code | Améliorer qualité |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `unit-test-generator` | Générateur de tests unitaires | Augmenter couverture |
| `test-writer-fixer` | Écriture et correction tests | Tests Jest/RTL |
| `test-results-analyzer` | Analyse résultats tests | Comprendre échecs |
| `code-reviewer` | Revue qualité code | Standards projet |
| `experienced-engineer:testing-specialist` | Expert tests | Stratégie de tests |
| `sugar:quality-guardian` | Gardien qualité code | Enforcement standards |

---

## Base de Données

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `database-performance-optimizer` | Optimisation BDD | Requêtes Prisma |
| `experienced-engineer:database-architect` | Architecte BDD | Schema Prisma |
| `data-scientist` | Analyse de données | Analytics ventes |

### Utilité Spécifique VIVR

- Optimisation des requêtes produits avec filtres
- Indexation pour recherche produits
- Relations Order/User/Product optimisées
- Analytics commandes et revenus

---

## API & Backend

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/generate-api-docs` | Documentation API | Documenter endpoints |
| `/openapi-expert` | Expert OpenAPI/Swagger | Spec API REST |
| `/fix-github-issue` | Correction issues GitHub | Bug fixes |
| `/fix-issue` | Résolution d'issues | Corrections rapides |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `api-integration-specialist` | Spécialiste intégration API | Stripe, OAuth |
| `api-tester` | Testeur d'API | Valider endpoints |
| `experienced-engineer:api-architect` | Architecte API | Design REST/Next.js |
| `backend-architect` | Architecte backend | Structure API |

### Endpoints VIVR à Couvrir

```
/api/auth/*          - NextAuth routes
/api/products/*      - CRUD produits
/api/categories/*    - Catégories
/api/orders/*        - Gestion commandes
/api/reviews/*       - Avis produits
/api/stripe/*        - Paiement Stripe
/api/newsletter/*    - Inscription newsletter
```

---

## Frontend & UI

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `frontend-developer` | Développeur frontend | Composants React |
| `ui-designer` | Designer UI | Améliorer design |
| `ux-researcher` | Chercheur UX | Optimiser parcours |
| `mobile-ux-optimizer` | Optimiseur UX mobile | Responsive |
| `experienced-engineer:ux-ui-designer` | Expert UX/UI | Design system |
| `accessibility-expert` | Expert accessibilité | WCAG compliance |
| `visual-storyteller` | Storytelling visuel | Landing pages |

### Composants VIVR à Améliorer

- `ProductCard` - Cartes produits
- `CartDrawer` - Panier latéral
- `Header/Footer` - Navigation
- `CheckoutForm` - Formulaire paiement
- `ProductGallery` - Galerie images

---

## Sécurité

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/audit` | Audit de sécurité | Vérifier vulnérabilités |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `enterprise-security-reviewer` | Revue sécurité entreprise | Audit complet |
| `experienced-engineer:security-specialist` | Spécialiste sécurité | OWASP, XSS, CSRF |
| `data-privacy-engineer` | Ingénieur confidentialité | RGPD/GDPR |
| `compliance-automation-specialist` | Automatisation conformité | Standards légaux |
| `legal-compliance-checker` | Vérificateur conformité légale | CGV, mentions légales |

### Points Critiques VIVR

- Authentification NextAuth sécurisée
- Webhooks Stripe vérifiés
- Hashing bcrypt des mots de passe
- Protection CSRF sur formulaires
- Validation inputs côté serveur
- RGPD pour données clients

---

## DevOps & Déploiement

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/vercel:deploy` | Déploiement Vercel | Deploy production |
| `/vercel:logs` | Logs Vercel | Debug production |
| `/husky` | Configuration Git hooks | Pre-commit checks |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `deployment-engineer` | Ingénieur déploiement | CI/CD pipeline |
| `devops-automator` | Automatisation DevOps | Infrastructure |
| `experienced-engineer:devops-engineer` | Expert DevOps | Pipeline complet |
| `infrastructure-maintainer` | Maintenance infrastructure | Monitoring |
| `monitoring-observability-specialist` | Spécialiste monitoring | Alertes, logs |

### Stack Déploiement Recommandé

- **Vercel** - Hébergement Next.js
- **Vercel Postgres** ou **Supabase** - BDD
- **Stripe Dashboard** - Monitoring paiements
- **Sentry** - Error tracking

---

## Documentation

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/documentation-generator` | Génération documentation | Docs techniques |
| `/generate-api-docs` | Documentation API | API reference |
| `/update-claudemd` | Mise à jour CLAUDE.md | Context IA |
| `/experienced-engineer:update-claude` | MAJ CLAUDE.md avancée | Documentation projet |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `codebase-documenter` | Documenteur codebase | JSDoc, README |
| `experienced-engineer:documentation-writer` | Rédacteur technique | Guides utilisateur |

---

## Planning & Gestion

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/plan` | Planification tâches | Sprint planning |
| `/ultrathink` | Analyse multi-agents | Problèmes complexes |
| `/discuss` | Discussion collaborative | Brainstorming |
| `/spec-kit:specify` | Spécifications fonctionnelles | User stories |
| `/spec-kit:plan` | Plan technique | Architecture |
| `/spec-kit:tasks` | Découpage en tâches | Backlog |
| `/spec-kit:implement` | Implémentation guidée | Développement |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `planning-prd-agent` | Agent PRD | Documents produit |
| `prd-specialist` | Spécialiste PRD | Requirements |
| `sprint-prioritizer` | Priorisation sprint | Backlog grooming |
| `sugar:task-planner` | Planificateur tâches | Découpage travail |
| `project-shipper` | Livraison projet | Go-to-market |
| `workflow-optimizer` | Optimisation workflow | Processus dev |

---

## Debug & Performance

### Skills

| Commande | Description | Utilité pour VIVR |
|----------|-------------|-------------------|
| `/debug-session` | Session de debug complète | Résoudre bugs |
| `/bug-detective` | Détective de bugs | Trouver causes |
| `/bug-fix` | Correction de bugs | Fix rapides |
| `/optimize` | Optimisation performance | Vitesse site |
| `/ai-pair-programming:fix` | Fix automatique bugs | Corrections IA |

### Agents

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `debugger` | Débogueur expert | Erreurs complexes |
| `ai-pair-programming:bug-hunter` | Chasseur de bugs | Détection proactive |
| `performance-benchmarker` | Benchmark performance | Mesures perf |
| `experienced-engineer:performance-engineer` | Expert performance | Core Web Vitals |
| `problem-solver-specialist` | Résolution problèmes | Issues critiques |

### Métriques VIVR à Surveiller

- **LCP** (Largest Contentful Paint) - Images produits
- **FID** (First Input Delay) - Interactivité
- **CLS** (Cumulative Layout Shift) - Stabilité
- **TTI** (Time to Interactive) - Chargement initial
- **Bundle size** - Taille JavaScript

---

## Outils Spécialisés

### Browser Testing (Playwright)

| Outil | Description | Utilité pour VIVR |
|-------|-------------|-------------------|
| `browser_navigate` | Navigation URL | Tests E2E |
| `browser_click` | Clic éléments | Interactions |
| `browser_fill_form` | Remplissage formulaires | Checkout tests |
| `browser_snapshot` | Capture état page | Debugging visuel |
| `browser_take_screenshot` | Screenshots | Documentation |

### Cas d'Usage E2E VIVR

```
1. Parcours achat complet
2. Inscription/Connexion utilisateur
3. Ajout panier et checkout
4. Filtrage produits
5. Gestion wishlist
```

### Greptile (Code Review)

| Outil | Description | Utilité |
|-------|-------------|---------|
| `list_pull_requests` | Liste PRs | Vue d'ensemble |
| `get_merge_request` | Détails PR | Review complète |
| `trigger_code_review` | Déclencher review | Automatisation |
| `search_greptile_comments` | Chercher commentaires | Patterns récurrents |

### Notion Integration

| Outil | Description | Utilité |
|-------|-------------|---------|
| `notion-create-task` | Créer tâche | Backlog |
| `notion-database-query` | Requêter BDD | Suivi projet |
| `notion-search` | Rechercher | Documentation |

### Autres Agents Utiles

| Agent | Description | Cas d'usage |
|-------|-------------|-------------|
| `content-creator` | Création contenu | Descriptions produits |
| `brand-guardian` | Gardien de marque | Cohérence brand |
| `growth-hacker` | Growth hacking | Acquisition clients |
| `customer-success-manager` | Succès client | Support |
| `pricing-packaging-specialist` | Pricing | Stratégie prix |
| `product-sales-specialist` | Ventes produit | Conversion |
| `instagram-curator` | Curateur Instagram | Social media |
| `sentry:issue-summarizer` | Résumé issues Sentry | Error tracking |

---

## Workflows Recommandés

### 1. Nouvelle Feature

```bash
/plan                    # Planifier l'implémentation
/feature-dev             # Développement guidé
/test-file              # Générer tests
/code-review            # Review avant commit
/commit                 # Commit conventionnel
/create-pull-request    # Créer PR
```

### 2. Bug Fix

```bash
/bug-detective          # Identifier le problème
/debug-session          # Session de debug
/ai-pair-programming:fix # Fix avec IA
/test-file              # Tests de non-régression
/commit                 # Commit fix
```

### 3. Review & Merge

```bash
/pr-review-toolkit:review-pr  # Review complète
/fix-pr                       # Corriger feedback
/double-check                 # Vérification finale
/commit-commands:commit-push-pr # Merge
```

### 4. Déploiement

```bash
/audit                  # Audit sécurité
/optimize              # Optimisation perf
/vercel:deploy         # Déployer
/vercel:logs           # Vérifier logs
```

### 5. Documentation

```bash
/update-claudemd        # MAJ context projet
/documentation-generator # Docs techniques
/generate-api-docs      # API reference
```

---

## Résumé par Priorité

### Haute Priorité (Usage Quotidien)

| Plugin | Type | Raison |
|--------|------|--------|
| `/commit` | Skill | Commits standardisés |
| `/feature-dev` | Skill | Dev guidé |
| `/code-review` | Skill | Qualité code |
| `/test-file` | Skill | Couverture tests |
| `/debug-session` | Skill | Résolution bugs |
| `frontend-developer` | Agent | Composants React |
| `code-reviewer` | Agent | Review automatique |

### Moyenne Priorité (Hebdomadaire)

| Plugin | Type | Raison |
|--------|------|--------|
| `/pr-review` | Skill | Review PRs |
| `/plan` | Skill | Sprint planning |
| `/optimize` | Skill | Performance |
| `api-integration-specialist` | Agent | Intégrations |
| `unit-test-generator` | Agent | Tests auto |

### Basse Priorité (Mensuel/Ponctuel)

| Plugin | Type | Raison |
|--------|------|--------|
| `/audit` | Skill | Audits sécurité |
| `/documentation-generator` | Skill | Docs |
| `/vercel:deploy` | Skill | Déploiements |
| `enterprise-security-reviewer` | Agent | Audits |
| `data-privacy-engineer` | Agent | RGPD |

---

## Notes d'Installation

Les plugins sont déjà installés. Pour les utiliser:

```bash
# Skills (commandes directes)
/commit
/feature-dev
/plan

# Agents (via Task tool - automatique)
# Claude les invoque automatiquement selon le contexte
```

---

*Document généré le 21/01/2026 pour le projet VIVR*
*Total: ~100+ plugins pertinents identifiés*
