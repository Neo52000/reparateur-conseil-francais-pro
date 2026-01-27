
# Plan : Ajout des filtres "QualiRépar" et "Enseigne" + Diagnostic affichage carte

## Diagnostic : Pourquoi tous les réparateurs ne s'affichent pas sur la carte

### Situation actuelle
- **Backoffice** : 3140 réparateurs
- **Carte (front)** : 3029 réparateurs affichés
- **Différence** : 111 réparateurs sans coordonnées GPS

La carte utilise intentionnellement `fetchRepairersWithGPS()` qui filtre uniquement les réparateurs ayant des coordonnées lat/lng valides. C'est un comportement normal car il est impossible d'afficher un point sur une carte sans coordonnées.

### Solution pour les 111 réparateurs manquants
Lancer le géocodage batch depuis l'admin pour récupérer les coordonnées des réparateurs sans GPS.

---

## Nouvelles fonctionnalités : Filtres "QualiRépar" et "Enseigne"

### 1. Modifier le type `RepairersFiltersState`

**Fichier** : `src/components/repairers/RepairersFilters.tsx`

Ajouter deux nouveaux champs au type :
```typescript
export interface RepairersFiltersState {
  region: string;
  department: string;
  city: string;
  hasGps: boolean | null;
  isActive: 'all' | 'active' | 'inactive';
  // NOUVEAUX FILTRES
  hasQualiRepar: 'all' | 'yes' | 'no';
  enseigne: string; // 'all' ou nom de l'enseigne
}
```

### 2. Créer une liste d'enseignes connues

**Fichier** : `src/constants/enseignes.ts` (nouveau fichier)

```typescript
export const ENSEIGNES_CONNUES = [
  { id: 'save', label: 'SAVE', pattern: 'SAVE' },
  { id: 'point-service-mobiles', label: 'Point Service Mobiles', pattern: 'POINT SERVICE MOBIL' },
  { id: 'cash-express', label: 'Cash Express', pattern: 'CASH EXPRESS' },
  { id: 'cash-and-repair', label: 'Cash And Repair', pattern: 'CASH AND REPAIR' },
  { id: 'wefix', label: 'WeFix', pattern: 'WEFIX' },
  { id: 'docteur-it', label: 'Docteur IT', pattern: 'DOCTEUR IT' },
  { id: 'bouygues', label: 'Bouygues Telecom', pattern: 'BOUYGUES' },
  { id: 'sfr', label: 'SFR', pattern: 'SFR' },
  { id: 'orange', label: 'Orange', pattern: 'ORANGE' },
  { id: 'amplifon', label: 'Amplifon', pattern: 'AMPLIFON' },
];
```

### 3. Ajouter les filtres dans l'interface

**Fichier** : `src/components/repairers/RepairersFilters.tsx`

Ajouter deux nouveaux selects :

- **Filtre QualiRépar** :
  - Tous
  - Avec label QualiRépar (icône badge vert)
  - Sans label QualiRépar

- **Filtre Enseigne** :
  - Toutes les enseignes
  - Indépendants
  - SAVE
  - Point Service Mobiles
  - Cash Express
  - etc.

### 4. Mettre à jour le hook useRepairersData

**Fichier** : `src/hooks/useRepairersData.ts`

Enrichir les données du réparateur avec :
- `has_qualirepar_label` : récupéré depuis `repairer_profiles` si existe
- `detected_enseigne` : calculé à partir du nom via pattern matching

### 5. Appliquer les filtres dans RepairersTable

**Fichier** : `src/components/repairers/RepairersTable.tsx`

Ajouter la logique de filtrage :
```typescript
// Filtre QualiRépar
if (filters.hasQualiRepar !== 'all') {
  const hasLabel = repairer.has_qualirepar_label === true;
  if (filters.hasQualiRepar === 'yes' && !hasLabel) return false;
  if (filters.hasQualiRepar === 'no' && hasLabel) return false;
}

// Filtre Enseigne
if (filters.enseigne && filters.enseigne !== 'all') {
  if (filters.enseigne === 'independant') {
    if (repairer.detected_enseigne !== 'Indépendant') return false;
  } else {
    if (repairer.detected_enseigne !== filters.enseigne) return false;
  }
}
```

### 6. Mettre à jour les statistiques

Afficher dans le footer des filtres :
- Nombre avec QualiRépar
- Répartition par enseigne

---

## Résumé des fichiers à modifier

| Fichier | Action |
|---------|--------|
| `src/constants/enseignes.ts` | Créer - liste des enseignes |
| `src/components/repairers/RepairersFilters.tsx` | Modifier - ajouter 2 filtres |
| `src/components/repairers/RepairersTable.tsx` | Modifier - logique de filtrage |
| `src/hooks/useRepairersData.ts` | Modifier - enrichir données |

---

## Section technique

### Détection automatique des enseignes
La détection se fait par pattern matching sur le champ `name` de la table `repairers` :
```typescript
const detectEnseigne = (name: string): string => {
  const upperName = name.toUpperCase();
  for (const enseigne of ENSEIGNES_CONNUES) {
    if (upperName.includes(enseigne.pattern)) {
      return enseigne.label;
    }
  }
  return 'Indépendant';
};
```

### Récupération du label QualiRépar
Le champ `has_qualirepar_label` est dans la table `repairer_profiles`, pas dans `repairers`. Il faudra faire une jointure ou un lookup séparé pour enrichir les données.

### Distribution actuelle des enseignes
- Indépendant : 2937 (93.5%)
- SAVE : 37
- Point Service Mobiles : 30
- Cash Express : 29
- SFR : 23
- Amplifon : 23
- Cash And Repair : 23
- Bouygues Telecom : 17
- Docteur IT : 15
- WeFix : 5
- Orange : 1
