# Design System — TopRéparateurs.fr

Référence unifiée pour les tokens, composants et règles d'UI.
Page interactive : `/design-system` (noindex, dev uniquement).

## 1. Fondations

### Couleurs de marque

| Rôle | Token CSS | Valeur (clair) | Valeur (sombre) | Usage |
|------|-----------|----------------|-----------------|-------|
| Primary | `--primary` / `--electric-blue` | `217 100% 52%` (#0A6CFF) | `217 100% 62%` | Actions principales, liens |
| Accent | `--accent` / `--vibrant-orange` | `22 100% 55%` (#FF7A1A) | `22 100% 62%` | CTA secondaires, highlights |
| Success | `--success-button` | `142 71% 38%` | `142 71% 45%` | Validations |
| Warning | `--warning` | `48 96% 53%` | `48 96% 53%` | Avertissements |
| Destructive | `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | Erreurs, suppression |

> ⚠️ Toutes les couleurs sont stockées en HSL (sans `hsl()` wrapper) pour permettre
> l'opacité Tailwind (`bg-primary/10`). Les appliquer via `hsl(var(--primary))`.

### Surfaces (layering)

| Token | Clair | Sombre | Usage |
|-------|-------|--------|-------|
| `--surface-0` | `#FFFFFF` | `#0B1122` | Background de base |
| `--surface-1` | `#F7F9FC` | `#0F1629` | Sections alternées |
| `--surface-2` | `#EDF1F7` | `#141C33` | Cartes imbriquées |
| `--surface-3` | `#DDE3EE` | `#1B2440` | Hover / pressed |

Utilisation Tailwind : `bg-surface-1`, `bg-surface-2`, etc.

### Élévations

| Token | Box-shadow | Usage |
|-------|------------|-------|
| `shadow-elev-1` | `0 1px 2px rgba(16,24,40,.05)` | Bordures douces, inputs |
| `shadow-elev-2` | `0 4px 12px -2px rgba(16,24,40,.08)` | Cartes au repos |
| `shadow-elev-3` | `0 16px 32px -8px rgba(16,24,40,.12)` | Cartes hover, modals, dropdowns |

### Rayons

| Taille | Valeur | Usage |
|--------|--------|-------|
| `rounded-sm` | calc(radius − 4px) = 4px | Badges, tags |
| `rounded-md` | calc(radius − 2px) = 6px | Inputs, boutons |
| `rounded-lg` | `var(--radius)` = 8px | Cartes, cards |
| `rounded-2xl` | 16px | Hero cards, CTAs majeurs |

### Espacements (échelle 4 px)

`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-6` 24 · `--space-8` 32 · `--space-12` 48 · `--space-16` 64

Utiliser les utilitaires Tailwind correspondants (`p-4`, `gap-6`, `mt-12`, …).

### Typographie

- **Corps** : Inter (sans) — 16 px, line-height 1.7
- **Titres** : Plus Jakarta Sans (`font-serif` / `font-heading`) — tracking tight, letter-spacing −0.02em
- **Échelle** :
  - `h1` : 3xl → 4xl → 5xl (mobile → tablet → desktop)
  - `h2` : 2xl → 3xl → 4xl
  - `h3` : xl → 2xl → 3xl
  - `body` : 16 px · `small` : 14 px · `xs` : 12 px

## 2. Composants clés

### Navigation (`src/components/Navigation.tsx`)
- Sticky top, backdrop-blur
- Desktop : logo + liens + CTA primaire "Trouver un réparateur"
- Mobile : hamburger → `Sheet` latéral droit avec sections publiques / rôles / auth
- États actifs avec `aria-current="page"`

### Footer (`src/components/Footer.tsx`)
- Sections dynamiques (Supabase via `useFooterConfig`)
- Toujours 4 colonnes en desktop, 1 en mobile
- Strip villes SEO (liens locaux dynamiques)
- Réseaux sociaux + liens légaux

### MobileBottomNav (`src/components/navigation/MobileBottomNav.tsx`)
- Fixée en bas, md:hidden
- 5 onglets max, `layoutId` Framer Motion pour l'indicateur actif

### TrustBar (`src/components/common/TrustBar.tsx`)
- Ruban horizontal entre hero et contenu
- 4 signaux de confiance (certifié, rapide, note, couverture France)

### CategoryShowcase (`src/components/modern/CategoryShowcase.tsx`)
- Grid 2×2 mobile / 4 desktop
- Cartes hover-lift avec gradients subtils primary/accent

### HowItWorks (`src/components/modern/HowItWorks.tsx`)
- 3 étapes numérotées avec ligne de connexion desktop
- CTA final vers la recherche

## 3. Règles d'usage

### Accessibilité
- Focus clavier global automatique sur `a`, `button`, `input`, `[role="tab"]`, etc.
  via `:focus-visible` dans `src/index.css` (contour `hsl(var(--ring))`, offset 2 px)
- `focus-ring` utility disponible pour les cas particuliers
- Skip link "Aller au contenu principal" dans `index.html` (href `#main-content`)
- Landmarks : `<Navigation>` = `<nav aria-label="Navigation principale">`,
  barre de recherche = `role="search" aria-label="..."`, résultats annoncés via
  `role="status" aria-live="polite"`
- Contraste texte ≥ 4.5:1 (AA) sur `background` et `surface-1` (primary #0A6CFF
  validé sur blanc)
- `aria-label` sur icônes seules · `aria-current="page"` sur liens actifs
- `aria-selected` sur les onglets (`SearchModeTabs`)
- Respect de `prefers-reduced-motion` (voir `src/index.css`)

### Responsive
- Mobile-first : écrire les styles mobile sans préfixe, overrider avec `md:`/`lg:`
- Breakpoints Tailwind standards : `sm:640` · `md:768` · `lg:1024` · `xl:1280` · `2xl:1400`
- Container centré, padding 2rem par défaut

### Mouvement
- Animations ≤ 300 ms pour les transitions UI (`transition-colors`, `hover-lift`)
- Motion Framer réservé aux éléments spéciaux (mobile nav indicator, modals)
- Préférer les transitions CSS aux keyframes pour l'hover

## 4. Conventions

- **Nommage composants** : PascalCase, nom explicite. Préfixer `Modern*` uniquement si
  coexistence temporaire avec une ancienne version (à supprimer à terme).
- **Imports** : alias `@/` pour `src/`
- **Types** : TypeScript strict, pas de `any` implicite
- **Pas de comments inutiles** : le code doit être auto-explicatif

## 5. Roadmap design

- [x] Phase 1 — Tokens consolidés + page `/design-system`
- [x] Phase 2 — Navigation unifiée (desktop + mobile via Sheet)
- [x] Phase 3 — Home refondue (hero double champ, catégories, how-it-works)
- [x] Phase 5 — `SearchPage` refondue (sticky search, filtres Sheet, lien IA)
- [x] Phase 6 — Sticky CTA mobile sur fiche publique réparateur
- [x] Phase 7 — Suppression des composants orphelins (NewSearchPage, ModernHeader,
      ModernFooter, SearchPageOptimized)
- [x] Phase 10 — Recherche par carte depuis la home via bouton « Autour de moi »
      dans le hero (géolocalisation → `/search?view=map&lat=&lng=`). Section
      d'aperçu cartographique retirée de la home : `/search` reste le seul
      point d'entrée cartographique.
- [ ] Fusion complète `AISearchPage` dans `/search?mode=ai` (option future)
- [ ] Storybook / catalogue de composants isolés
- [ ] Audit accessibilité WCAG AA complet

## 6. Règles de performance

- **Leaflet hors `/search`** : toute page autre que `/search` qui intègre une
  carte doit charger `leaflet` / `react-leaflet` via `React.lazy` + montage
  différé (IntersectionObserver). Exemple : `HomepageMapSection` charge
  `HomepageMapPreview` uniquement à l'entrée dans le viewport. Objectif :
  préserver le chunk `vendor-map` hors du bundle initial de la home et protéger
  le LCP.
- **Géolocalisation** : utiliser le hook `useGeolocation` partagé
  (`src/hooks/useGeolocation.ts`) qui synchronise la position avec `useMapStore`.
  Ne jamais appeler `navigator.geolocation` directement dans un composant.
- **Paramètres d'URL carte** : `/search` accepte `?view=map` pour ouvrir en mode
  carte et `?lat=<n>&lng=<n>` pour centrer la carte. Toute redirection
  cartographique depuis une page tierce doit passer par ces paramètres.
