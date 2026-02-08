

# Plan : Amelioration complete de la PWA (Android et iOS)

## Problemes identifies

L'audit de la PWA actuelle revele plusieurs problemes majeurs :

### 1. Le manifest est configure pour le POS, pas pour l'application grand public
- **Nom** : "TopReparateurs POS" au lieu de "TopReparateurs"
- **start_url** : `/admin?tab=pos-tester` au lieu de `/`
- **orientation** : `landscape-primary` (paysage) au lieu de `any` (portrait sur mobile)
- **description** : Mentionne "NF525" et "point de vente" au lieu de la reparation

### 2. Icones manquantes
- Seul `placeholder.svg` est utilise pour les icones
- Aucune icone PNG aux tailles requises (72, 96, 128, 144, 152, 192, 384, 512)
- Pas de `maskable` icon correctement dimensionne
- Pas d'icone Apple Touch specifique

### 3. Pas de support iOS complet
- Pas de splash screens Apple (apple-touch-startup-image)
- `apple-mobile-web-app-title` dit "Reparateur Pro" au lieu de "TopReparateurs"
- Pas de gestion du safe area (encoche iPhone)

### 4. Incoherences de couleur de theme
- `manifest.json` : `#000000`
- `index.html` meta theme-color : `#f97316`
- L'application utilise du bleu (`#2563eb`) comme couleur primaire

### 5. Service Worker rudimentaire
- Pas de fallback vers `offline.html` (le fichier existe mais n'est jamais servi)
- Pas de notification de mise a jour disponible
- Pas de gestion du cache versionne (toujours "v1")
- Enregistrement en double (dans `main.tsx` ET dans `PWAManager.tsx`)

### 6. Pas de banniere d'installation pour les utilisateurs
- Le prompt d'installation est uniquement dans le backoffice admin (POS)
- Les visiteurs du site grand public ne voient jamais de proposition d'installation
- Pas de page `/install` dediee

---

## Modifications prevues

### Fichier 1 : `public/manifest.json`
Refonte complete du manifest pour l'application grand public :

```json
{
  "name": "TopReparateurs - Trouvez un reparateur",
  "short_name": "TopReparateurs",
  "description": "Trouvez les meilleurs reparateurs de smartphone pres de chez vous",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "any",
  "lang": "fr-FR",
  "dir": "ltr",
  "icons": [...],
  "categories": ["utilities", "lifestyle"],
  "screenshots": [...],
  "shortcuts": [
    { "name": "Rechercher", "url": "/search" },
    { "name": "Mon compte", "url": "/dashboard" }
  ]
}
```

Changements cles :
- Nom et description orientes utilisateur final
- `start_url: "/"` (page d'accueil)
- `orientation: "any"` pour supporter portrait et paysage
- `theme_color: "#2563eb"` pour correspondre a la charte graphique
- Icones generees par SVG en PNG (192x192 et 512x512 via logo-icon.svg)
- Ajout de `screenshots` pour un meilleur rendu dans le store Android
- Raccourcis utiles (Recherche, Mon compte)

### Fichier 2 : `index.html`
Corriger les meta tags PWA et ajouter le support iOS :

- `theme-color` passe a `#2563eb`
- `apple-mobile-web-app-title` passe a "TopReparateurs"
- `apple-mobile-web-app-status-bar-style` passe a `black-translucent` pour un rendu plein ecran
- Ajout de `viewport-fit=cover` dans le viewport meta pour gerer l'encoche iPhone
- Ajout de `apple-touch-startup-image` avec les tailles pour iPhone et iPad

### Fichier 3 : `public/sw.js`
Service Worker ameliore :

- **Versioning automatique** : Cache nomme avec timestamp/version
- **Fallback offline** : Servir `offline.html` quand la page n'est pas en cache
- **Notification de mise a jour** : Envoyer un message aux clients quand une nouvelle version est disponible
- **Nettoyage intelligent** : Supprimer les anciens caches lors de l'activation
- **Skip navigation requests** : Ne pas cacher les pages HTML de navigation (SPA)
- **Cache des assets Vite** : Reconnaitre les fichiers hashes de Vite pour un cache longue duree

```text
Strategie de cache :

  Requete entrante
       |
       v
  Est-ce une API / Supabase ?
  Oui --> Network First (fallback cache)
  Non
   |
   v
  Est-ce un asset statique (.js, .css, images) ?
  Oui --> Cache First (avec revalidation en background)
  Non
   |
   v
  Est-ce une navigation HTML ?
  Oui --> Network First (fallback offline.html)
```

### Fichier 4 : `src/swRegistration.ts`
Ameliorer l'enregistrement du SW :

- Detecter les mises a jour (`registration.onupdatefound`)
- Envoyer un evenement personnalise quand une MAJ est prete
- Ajouter la gestion du `skipWaiting` pour les mises a jour
- Supprimer l'enregistrement en double dans PWAManager.tsx

### Fichier 5 : `src/hooks/usePWA.ts` (nouveau)
Hook global pour gerer la PWA dans toute l'application :

- `isInstalled` : Detecte si l'app est installee
- `isOnline` : Statut reseau
- `canInstall` : Un prompt d'installation est disponible
- `installApp()` : Declencher l'installation
- `updateAvailable` : Une MAJ du SW est disponible
- `updateApp()` : Appliquer la MAJ (reload)
- `isIOS` : Detection iOS pour instructions specifiques

### Fichier 6 : `src/components/pwa/PWAInstallBanner.tsx` (nouveau)
Banniere d'installation pour les visiteurs du site :

- Apparait apres 30 secondes de navigation (pas intrusif)
- Sur Android : Bouton "Installer l'application"
- Sur iOS : Instructions "Partagez > Ajouter a l'ecran d'accueil"
- Dismissable avec memoire (localStorage) pour ne pas reapparaitre pendant 7 jours
- Design elegant et non-intrusif (bottom sheet style)

### Fichier 7 : `src/components/pwa/PWAUpdateBanner.tsx` (nouveau)
Banniere de mise a jour :

- Apparait quand une nouvelle version du SW est detectee
- Bouton "Mettre a jour" qui recharge l'application
- Disparait automatiquement si l'utilisateur ne reagit pas

### Fichier 8 : `src/App.tsx`
Integration des composants PWA :

- Ajouter `<PWAInstallBanner />` et `<PWAUpdateBanner />` au layout global
- Ces composants sont legers et ne s'affichent que quand necessaire

### Fichier 9 : `src/components/pos/modules/PWAManager.tsx`
Simplifier en utilisant le hook `usePWA` :

- Supprimer l'enregistrement du SW en double
- Utiliser `usePWA()` au lieu de gerer l'etat localement
- Garder l'interface admin existante

### Fichier 10 : `src/index.css`
Ajouter le support du safe area iOS :

```css
/* Support iOS safe areas (encoche) */
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

---

## Resume des fichiers

| Fichier | Action | Description |
|---------|--------|-------------|
| `public/manifest.json` | Modifier | Manifest oriente utilisateur final |
| `index.html` | Modifier | Meta tags iOS, theme color, viewport |
| `public/sw.js` | Modifier | SW avec fallback offline, MAJ, versioning |
| `src/swRegistration.ts` | Modifier | Detection de mises a jour |
| `src/hooks/usePWA.ts` | Creer | Hook global PWA |
| `src/components/pwa/PWAInstallBanner.tsx` | Creer | Banniere d'installation visiteurs |
| `src/components/pwa/PWAUpdateBanner.tsx` | Creer | Banniere de mise a jour |
| `src/App.tsx` | Modifier | Integration bannieres PWA |
| `src/components/pos/modules/PWAManager.tsx` | Modifier | Simplification avec hook usePWA |
| `src/index.css` | Modifier | Safe area iOS |

---

## Section technique

### Generation des icones PWA

Les icones seront referencees depuis le `logo-icon.svg` existant. Le SVG sera utilise directement comme icone (supporte par Chrome et Safari modernes). Pour une compatibilite maximale, le manifest listera :
- `logo-icon.svg` en 192x192 et 512x512 (SVG est vectoriel, il s'adapte)
- `purpose: "any maskable"` pour couvrir les deux usages

### Compatibilite iOS

iOS ne supporte pas `beforeinstallprompt`. Le composant `PWAInstallBanner` detectera iOS via le user agent et affichera des instructions manuelles :
1. Appuyez sur le bouton Partager
2. Selectionnez "Sur l'ecran d'accueil"
3. Confirmez "Ajouter"

### Strategie de mise a jour du Service Worker

Le nouveau SW utilisera `skipWaiting()` uniquement quand l'utilisateur clique "Mettre a jour". Sinon, la nouvelle version attend que tous les onglets soient fermes. Cela evite les bugs de versions mixtes.

### Enregistrement unique du SW

Actuellement, le SW est enregistre dans 2 endroits :
- `src/main.tsx` via `registerServiceWorker()`
- `src/components/pos/modules/PWAManager.tsx` directement

Apres refactoring, seul `main.tsx` enregistrera le SW. Le hook `usePWA` exposera l'etat sans re-enregistrer.

