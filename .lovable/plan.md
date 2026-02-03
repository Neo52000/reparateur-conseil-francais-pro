

# Plan : Builder de Fiches Réparateurs avec Thèmes, IA et Drag & Drop

## Vue d'ensemble

Ce plan propose la création d'un système complet de personnalisation des fiches réparateurs, inspiré des meilleures pratiques de builders modernes. L'admin pourra créer et gérer des templates de fiches, définir quels éléments sont visibles ou floutés selon l'abonnement, et utiliser l'IA pour générer des variations de design.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     ADMIN: Profile Builder                               │
├──────────────┬────────────────────────────────────┬─────────────────────┤
│              │                                    │                     │
│   WIDGETS    │          CANVAS PREVIEW            │    PROPRIÉTÉS       │
│   LIBRARY    │                                    │                     │
│              │  ┌────────────────────────────┐   │  - Visibilité       │
│  - Header    │  │       En-tête réparateur   │   │  - Style            │
│  - Photos    │  ├────────────────────────────┤   │  - Conditions       │
│  - Services  │  │       Galerie photos       │   │  - IA suggestions   │
│  - Tarifs    │  ├────────────────────────────┤   │                     │
│  - Horaires  │  │    Services & Tarifs       │   │  ┌───────────────┐  │
│  - Avis      │  ├────────────────────────────┤   │  │ Plan requis:  │  │
│  - Contact   │  │        Horaires            │   │  │ ○ Gratuit     │  │
│  - Carte     │  └────────────────────────────┘   │  │ ● Visibilité  │  │
│              │                                    │  │ ○ Pro         │  │
│              │  [Mobile] [Tablet] [Desktop]       │  │ ○ Premium     │  │
│              │                                    │  └───────────────┘  │
├──────────────┴────────────────────────────────────┴─────────────────────┤
│  💾 Sauvegarder    👁️ Prévisualiser    🤖 Générer avec IA    📤 Exporter │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture proposée

### 1. Nouveaux types et interfaces

**Fichier** : `src/types/profileBuilder.ts`

```typescript
// Widget de profil réparateur
interface ProfileWidget {
  id: string;
  type: 'header' | 'photos' | 'services' | 'pricing' | 'hours' | 
        'reviews' | 'contact' | 'map' | 'certifications' | 'about';
  name: string;
  icon: string;
  order: number;
  isVisible: boolean;
  
  // Conditions d'affichage par plan
  visibilityRules: {
    minPlan: 'Gratuit' | 'Visibilité' | 'Pro' | 'Premium';
    blurIfNotAllowed: boolean;
    hideIfNotAllowed: boolean;
    customMessage?: string;
  };
  
  // Styles personnalisables
  styles: {
    padding?: string;
    background?: string;
    borderRadius?: string;
    shadow?: string;
  };
}

// Template de fiche réparateur
interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  widgets: ProfileWidget[];
  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    spacing: 'compact' | 'normal' | 'spacious';
  };
  isDefault: boolean;
  isAIGenerated: boolean;
  previewImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Nouvelle table en base de données

**Table** : `profile_templates`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| name | text | Nom du template |
| description | text | Description du template |
| widgets | jsonb | Configuration des widgets |
| theme_data | jsonb | Thème et couleurs |
| is_default | boolean | Template par défaut |
| is_ai_generated | boolean | Généré par IA |
| preview_image_url | text | Image de prévisualisation |
| created_by | uuid | Créateur (admin) |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de mise à jour |

### 3. Widgets de profil disponibles

| Widget | Description | Plan minimum par défaut |
|--------|-------------|-------------------------|
| Header | Nom, logo, badges, note | Gratuit |
| Photos | Galerie de photos | Visibilité |
| Services | Liste des services | Gratuit (limité) |
| Pricing | Grille tarifaire | Pro |
| Hours | Horaires d'ouverture | Visibilité |
| Reviews | Avis clients | Gratuit (3 derniers) |
| Contact | Téléphone, email, adresse | Visibilité |
| Map | Carte Google Maps | Pro |
| Certifications | Labels et certifications | Gratuit |
| About | Description et histoire | Visibilité |

---

## Composants à créer

### 1. Builder principal

**Fichier** : `src/components/admin/profile-builder/ProfileBuilder.tsx`

Interface complète avec :
- Panneau gauche : Bibliothèque de widgets draggables
- Centre : Canvas de prévisualisation responsive
- Panneau droit : Propriétés du widget sélectionné

### 2. Widget Library pour profils

**Fichier** : `src/components/admin/profile-builder/ProfileWidgetLibrary.tsx`

Liste des 10 widgets disponibles avec :
- Icône et nom
- Drag & drop vers le canvas
- Badge indiquant le plan minimum

### 3. Panneau de propriétés avancé

**Fichier** : `src/components/admin/profile-builder/ProfilePropertyPanel.tsx`

Permet de configurer :
- Visibilité par plan (sélecteur de plan minimum)
- Comportement si non autorisé (blur/masquer/message)
- Styles (padding, background, border)
- Contenu personnalisé

### 4. Prévisualisation par plan

**Fichier** : `src/components/admin/profile-builder/ProfilePreview.tsx`

Permet de voir le rendu de la fiche :
- Sélecteur de plan pour simuler la vue client
- Toggle mobile/tablet/desktop
- Aperçu du blur/masquage selon le plan

### 5. Générateur IA de templates

**Fichier** : `src/components/admin/profile-builder/AITemplateGenerator.tsx`

Interface pour générer des templates via IA :
- Prompt en français ("Crée un template moderne et épuré")
- Suggestions de combinaisons de widgets
- Génération de palettes de couleurs

---

## Edge Function IA

**Fichier** : `supabase/functions/generate-profile-template/index.ts`

Utilise Lovable AI pour :
- Générer des agencements de widgets optimisés
- Proposer des combinaisons de couleurs harmonieuses
- Suggérer des configurations par secteur (mobile, informatique, etc.)

Exemple de prompt système :
```
Tu es un designer UX spécialisé dans les fiches établissements. 
Génère un template JSON pour une fiche réparateur avec :
- L'ordre optimal des widgets
- Les couleurs adaptées au secteur de la réparation
- Les règles de visibilité par plan d'abonnement
```

---

## Hooks à créer

### useProfileBuilder

**Fichier** : `src/hooks/useProfileBuilder.ts`

Gère :
- État des widgets et leur ordre
- Drag & drop avec @dnd-kit
- Historique undo/redo
- Sauvegarde automatique

### useProfileTemplates

**Fichier** : `src/hooks/useProfileTemplates.ts`

Gère :
- CRUD des templates en base
- Chargement/application d'un template
- Duplication de templates
- Export/import JSON

---

## Intégration avec le système existant

### 1. Modification de ClientModeContent

Le composant `src/components/repairer-profile-modal/ClientModeContent.tsx` sera modifié pour :
- Charger le template actif depuis `profile_templates`
- Rendre les widgets dans l'ordre défini
- Appliquer les règles de visibilité selon le plan du réparateur

### 2. Extension des feature flags

Ajouter de nouvelles clés dans `FEATURES` :
- `profile_photos_gallery` : Galerie photos complète
- `profile_full_pricing` : Grille tarifaire complète
- `profile_google_map` : Carte interactive
- `profile_full_reviews` : Tous les avis (pas juste 3)

### 3. Composant BlurredProfileContent amélioré

Modifier pour supporter :
- Messages personnalisés par widget
- Animation de blur
- CTA d'upgrade vers le plan supérieur

---

## Page admin

**Route** : `/admin/profile-builder`

Accessible depuis le menu admin, permet de :
1. Voir la liste des templates existants
2. Créer un nouveau template (vide ou avec IA)
3. Éditer un template existant
4. Définir le template par défaut
5. Prévisualiser avec simulation de plans

---

## Résumé des fichiers à créer

| Fichier | Description |
|---------|-------------|
| `src/types/profileBuilder.ts` | Types TypeScript |
| `src/components/admin/profile-builder/ProfileBuilder.tsx` | Builder principal |
| `src/components/admin/profile-builder/ProfileWidgetLibrary.tsx` | Bibliothèque widgets |
| `src/components/admin/profile-builder/ProfilePropertyPanel.tsx` | Panneau propriétés |
| `src/components/admin/profile-builder/ProfilePreview.tsx` | Prévisualisation |
| `src/components/admin/profile-builder/ProfileCanvas.tsx` | Zone de drop |
| `src/components/admin/profile-builder/AITemplateGenerator.tsx` | Générateur IA |
| `src/hooks/useProfileBuilder.ts` | Hook builder |
| `src/hooks/useProfileTemplates.ts` | Hook templates |
| `src/pages/admin/ProfileBuilderPage.tsx` | Page admin |
| `supabase/functions/generate-profile-template/index.ts` | Edge function IA |

## Fichiers à modifier

| Fichier | Modification |
|---------|--------------|
| `src/components/repairer-profile-modal/ClientModeContent.tsx` | Rendu dynamique |
| `src/components/profile/BlurredProfileContent.tsx` | Messages personnalisés |
| `src/constants/features.ts` | Nouvelles feature keys |
| `src/App.tsx` | Nouvelle route admin |

---

## Section technique

### Structure des widgets en JSONB

```json
{
  "widgets": [
    {
      "id": "widget-header-1",
      "type": "header",
      "order": 0,
      "visibilityRules": {
        "minPlan": "Gratuit",
        "blurIfNotAllowed": false,
        "hideIfNotAllowed": false
      },
      "styles": {
        "padding": "24px",
        "background": "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
      }
    },
    {
      "id": "widget-photos-1", 
      "type": "photos",
      "order": 1,
      "visibilityRules": {
        "minPlan": "Visibilité",
        "blurIfNotAllowed": true,
        "hideIfNotAllowed": false,
        "customMessage": "Passez au plan Visibilité pour voir les photos"
      }
    }
  ]
}
```

### Logique de rendu conditionnel

```typescript
const shouldShowWidget = (widget: ProfileWidget, repairerPlan: PlanName): 'visible' | 'blurred' | 'hidden' => {
  const planOrder = ['Gratuit', 'Visibilité', 'Pro', 'Premium'];
  const minPlanIndex = planOrder.indexOf(widget.visibilityRules.minPlan);
  const currentPlanIndex = planOrder.indexOf(repairerPlan);
  
  if (currentPlanIndex >= minPlanIndex) return 'visible';
  if (widget.visibilityRules.blurIfNotAllowed) return 'blurred';
  if (widget.visibilityRules.hideIfNotAllowed) return 'hidden';
  return 'visible';
};
```

### Réutilisation du ProfessionalBuilder existant

Le projet dispose déjà d'un système de builder (`ProfessionalBuilder.tsx`) avec :
- DndContext configuré avec @dnd-kit
- WidgetLibrary fonctionnelle
- PropertyPanel
- ResponsiveCanvas

Le nouveau ProfileBuilder s'inspirera fortement de cette architecture en adaptant :
- Les widgets spécifiques aux fiches réparateurs
- Le panneau de propriétés avec les règles de visibilité par plan
- La prévisualisation multi-plan

