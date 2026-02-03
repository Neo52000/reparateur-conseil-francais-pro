
# Plan : Correction des 3 problèmes du blog IA

## Diagnostic des problèmes identifiés

### Probleme 1 : 3 articles generés a la meme date pour une seule automatisation

**Cause identifiée** : Le CRON job s'exécute toutes les minutes et le scheduler a 2 planifications actives (15:00 et 15:15). Le 02 février 2026 :
- 4 articles générés entre 13:55 et 14:10
- Le système de protection `last_run_at < 30 minutes` ne bloque pas les exécutions multiples car chaque planification est traitée séparément

Le problème vient du fait que :
1. Le CRON s'exécute chaque minute avec une **fenêtre de 5 minutes** (`isTimeInWindow(..., 5)`)
2. Si le CRON tourne à 15:00, 15:01, 15:02, etc., il peut déclencher plusieurs fois la meme planification avant que `last_run_at` ne soit mis à jour

**Solution** : Réduire la fenêtre de temps de 5 minutes à 2 minutes ET ajouter une vérification plus stricte basée sur le jour.

---

### Probleme 2 : Description d'image affichée en dessous de chaque image

**Cause identifiée** : Dans `MarkdownRenderer.tsx`, le composant `img` affiche un `<figcaption>` avec le texte `alt` :
```tsx
{alt && (
  <figcaption className="text-center text-sm text-muted-foreground mt-3 italic px-4 sm:px-8">
    {alt}
  </figcaption>
)}
```

De plus, le générateur crée des images Markdown avec description :
```markdown
![Description de l'image](url)
```

Le texte alt (description) est utilisé comme légende, ce qui n'est pas souhaité.

**Solution** : Supprimer le `<figcaption>` du rendu Markdown pour ne plus afficher les descriptions sous les images.

---

### Probleme 3 : Images trop grandes (pas esthétiques)

**Cause identifiée** : Dans `MarkdownRenderer.tsx`, les images utilisent :
```tsx
<figure className="my-10 -mx-4 sm:-mx-8">
  <img className="w-full h-auto rounded-xl shadow-lg" />
```

- `w-full` : l'image prend 100% de la largeur
- `-mx-4 sm:-mx-8` : marges négatives qui dépassent le conteneur
- Pas de hauteur maximale définie

**Solution** : Limiter la taille des images avec `max-w-2xl`, `max-h-[400px]` et centrer correctement.

---

## Modifications prévues

### Fichier 1 : `supabase/functions/blog-scheduler-cron/index.ts`

Changer la fenêtre de temps de 5 minutes à 2 minutes pour éviter les déclenchements multiples :

```typescript
// Avant
const schedules = allSchedules?.filter(schedule => {
  const inWindow = isTimeInWindow(currentTime, schedule.schedule_time, 5);
  ...

// Après  
const schedules = allSchedules?.filter(schedule => {
  const inWindow = isTimeInWindow(currentTime, schedule.schedule_time, 2);
  ...
```

Ajouter une vérification de date pour empêcher les exécutions multiples le meme jour :

```typescript
// Dans la boucle for
if (schedule.last_run_at) {
  const lastRun = new Date(schedule.last_run_at);
  const now = new Date();
  
  // Vérifier si déjà exécuté AUJOURD'HUI
  const lastRunDate = lastRun.toISOString().split('T')[0];
  const todayDate = now.toISOString().split('T')[0];
  
  if (lastRunDate === todayDate) {
    console.log(`⏭️ Skipping "${schedule.name}" - already ran today at ${lastRun.toISOString()}`);
    continue;
  }
}
```

---

### Fichier 2 : `src/components/blog/MarkdownRenderer.tsx`

Supprimer la légende (figcaption) et réduire la taille des images :

```tsx
// Avant
img: ({ src, alt }) => (
  <figure className="my-10 -mx-4 sm:-mx-8">
    <img 
      src={src} 
      alt={alt || 'Image'} 
      className="w-full h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      loading="lazy"
      ...
    />
    {alt && (
      <figcaption className="...">
        {alt}
      </figcaption>
    )}
  </figure>
)

// Après
img: ({ src, alt }) => (
  <figure className="my-8 flex justify-center">
    <img 
      src={src} 
      alt={alt || 'Image'} 
      className="max-w-2xl w-full max-h-[400px] object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
      loading="lazy"
      ...
    />
  </figure>
)
```

Changements :
- **Suppression de figcaption** : Plus de description sous l'image
- **`max-w-2xl`** : Largeur maximale de 672px (taille raisonnable)
- **`max-h-[400px]`** : Hauteur maximale de 400px
- **`object-cover`** : L'image garde ses proportions en rognant si nécessaire
- **`flex justify-center`** : L'image est centrée
- **Suppression de `-mx-4 sm:-mx-8`** : Plus de débordement du conteneur
- **`shadow-md`** au lieu de `shadow-lg` : Ombre plus subtile

---

## Résumé des fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `supabase/functions/blog-scheduler-cron/index.ts` | Fenetre 5min → 2min, vérification "déja exécuté aujourd'hui" |
| `src/components/blog/MarkdownRenderer.tsx` | Supprimer figcaption, réduire taille images |

---

## Section technique

### Pourquoi la fenetre de 5 minutes pose probleme

Le CRON pg_cron s'exécute typiquement toutes les minutes. Avec une fenêtre de 5 minutes :
- 15:00 → Match (15:00 est dans [14:55, 15:05])
- 15:01 → Match (15:01 est dans [14:56, 15:06])
- 15:02 → Match encore...

Meme avec la protection `minutesSinceLastRun < 30`, si les appels API sont lents, plusieurs instances peuvent passer la vérification avant que `last_run_at` soit mis à jour.

La solution "déjà exécuté aujourd'hui" est plus robuste car elle empêche toute exécution multiple le meme jour pour une planification hebdomadaire.

### Pourquoi supprimer figcaption

Les descriptions générées par l'IA pour les images sont techniques (ex: "Photo d'un technicien réparant l'écran d'un iPhone dans un atelier moderne"). Ces textes sont utiles pour l'accessibilité (attribut alt) mais pas comme légende visuelle. L'attribut `alt` reste présent pour les lecteurs d'écran.
