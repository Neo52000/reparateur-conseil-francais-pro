# 🤝 Guide de Contribution - RepairConnect

## Bienvenue !

Merci de votre intérêt pour contribuer à RepairConnect ! Ce guide vous aidera à comprendre comment participer efficacement au développement de la plateforme.

## 📋 Table des matières

1. [Code de conduite](#code-de-conduite)
2. [Comment contribuer](#comment-contribuer)
3. [Architecture du projet](#architecture-du-projet)
4. [Workflow de développement](#workflow-de-développement)
5. [Standards de code](#standards-de-code)
6. [Tests](#tests)
7. [Documentation](#documentation)

## Code de conduite

### Nos engagements
- **Respect** : Traiter tous les contributeurs avec respect
- **Inclusion** : Créer un environnement accueillant pour tous
- **Collaboration** : Favoriser la collaboration constructive
- **Qualité** : Maintenir des standards élevés de qualité

### Comportements attendus
- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter les critiques constructives avec grâce
- Se concentrer sur l'intérêt de la communauté

## Comment contribuer

### Types de contributions

#### 🐛 Rapporter des bugs
```markdown
## Description du bug
Description claire et concise du problème

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement attendu
Description de ce qui devrait se passer

## Comportement actuel
Description de ce qui se passe actuellement

## Environnement
- OS: [ex: Windows 10]
- Navigateur: [ex: Chrome 96]
- Version: [ex: 3.0]
```

#### ✨ Proposer des fonctionnalités
```markdown
## Problème résolu
Description claire du problème que cette fonctionnalité résout

## Solution proposée
Description claire et concise de la solution

## Alternatives considérées
Description des solutions alternatives envisagées

## Contexte supplémentaire
Captures d'écran, mockups, ou contexte additionnel
```

#### 🔧 Contribuer au code
1. **Fork** le repository
2. **Créer** une branche feature
3. **Développer** la fonctionnalité
4. **Tester** les changements
5. **Soumettre** une Pull Request

## Architecture du projet

### Structure générale
```
repairconnect/
├── src/                    # Code source frontend
│   ├── components/         # Composants React
│   ├── hooks/             # Hooks personnalisés
│   ├── pages/             # Pages de l'application
│   ├── services/          # Services et API
│   └── utils/             # Utilitaires
├── supabase/              # Configuration backend
│   ├── functions/         # Edge Functions
│   └── migrations/        # Migrations DB
└── docs/                  # Documentation
```

### Technologies utilisées
- **Frontend** : React 18 + TypeScript + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Edge Functions)
- **Build** : Vite
- **Tests** : Vitest + Testing Library
- **Linting** : ESLint + Prettier

## Workflow de développement

### 1. Setup de l'environnement

#### Prérequis
```bash
# Versions requises
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

#### Installation
```bash
# Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/repairconnect.git
cd repairconnect

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs Supabase

# Démarrer le serveur de développement
npm run dev
```

### 2. Création d'une branche

```bash
# Convention de nommage des branches
git checkout -b feature/nom-de-la-feature
git checkout -b fix/description-du-fix
git checkout -b docs/amélioration-documentation
```

### 3. Développement

#### Commits atomiques
```bash
# Un commit = une modification logique
git add src/components/NewComponent.tsx
git commit -m "feat: add new component for user management"

git add src/hooks/useAuth.ts
git commit -m "fix: handle authentication edge case"
```

#### Convention des messages de commit
```bash
# Format : type(scope): description
feat(auth): add OAuth integration
fix(ui): resolve button styling issue
docs(api): update endpoint documentation
test(hooks): add tests for useAuth hook
refactor(components): optimize rendering performance
```

### 4. Tests

#### Lancer les tests
```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

#### Écriture de tests
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### 5. Pull Request

#### Checklist PR
- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent
- [ ] Le code suit les standards établis
- [ ] La documentation est mise à jour
- [ ] Les changements sont testés manuellement

#### Template PR
```markdown
## Description
Description claire des changements apportés

## Type de changement
- [ ] Bug fix (changement qui corrige un problème)
- [ ] Feature (changement qui ajoute une fonctionnalité)
- [ ] Breaking change (fix ou feature qui casserait la compatibilité)
- [ ] Documentation (changement de documentation uniquement)

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests manuels effectués
- [ ] Pas de régression détectée

## Screenshots
[Si applicable, ajoutez des captures d'écran]

## Checklist
- [ ] Code auto-documenté et commenté
- [ ] Changements de documentation mis à jour
- [ ] Pas de console.log oubliés
```

## Standards de code

### TypeScript

#### Interfaces et types
```typescript
// ✅ Bonne pratique
interface UserProfile {
  id: string
  email: string
  displayName: string
  createdAt: Date
}

// ✅ Types union pour les constantes
type UserRole = 'customer' | 'repairer' | 'admin'

// ✅ Génériques pour la réutilisabilité
interface ApiResponse<T> {
  data: T
  error?: string
}
```

#### Gestion des erreurs
```typescript
// ✅ Bonne pratique
const fetchUser = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}
```

### React

#### Hooks personnalisés
```typescript
// ✅ Bonne pratique
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Logic here
  }, [])
  
  return { user, loading, signIn, signOut }
}
```

#### Composants
```typescript
// ✅ Bonne pratique
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### CSS/Tailwind

#### Utilisation des tokens de design
```typescript
// ✅ Utiliser les tokens du design system
<div className="bg-background text-foreground border-border">
  <h1 className="text-primary">Title</h1>
</div>

// ❌ Éviter les couleurs hardcodées
<div className="bg-white text-black border-gray-200">
  <h1 className="text-blue-500">Title</h1>
</div>
```

#### Responsive design
```typescript
// ✅ Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## Tests

### Types de tests

#### Tests unitaires
```typescript
// Test d'un utilitaire
describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(29.99)).toBe('29,99 €')
    expect(formatPrice(0)).toBe('Gratuit')
  })
})
```

#### Tests d'intégration
```typescript
// Test d'un hook avec Supabase
describe('useRepairers', () => {
  it('should fetch repairers', async () => {
    const { result } = renderHook(() => useRepairers())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.repairers).toHaveLength(5)
  })
})
```

#### Tests end-to-end
```typescript
// Playwright test
test('user can search for repairers', async ({ page }) => {
  await page.goto('/')
  await page.fill('[data-testid="search-input"]', 'iPhone')
  await page.click('[data-testid="search-button"]')
  
  await expect(page.locator('[data-testid="repairer-card"]')).toHaveCount(3)
})
```

### Coverage requis
- **Minimum** : 80% de couverture globale
- **Utilitaires** : 100% de couverture
- **Composants critiques** : 95% de couverture
- **Hooks** : 90% de couverture

## Documentation

### Documentation du code
```typescript
/**
 * Hook pour gérer l'authentification des utilisateurs
 * 
 * @returns {AuthHook} Object contenant l'état d'auth et les méthodes
 * 
 * @example
 * ```tsx
 * const { user, signIn, signOut } = useAuth()
 * 
 * if (!user) {
 *   return <LoginForm onSubmit={signIn} />
 * }
 * ```
 */
export const useAuth = (): AuthHook => {
  // Implementation
}
```

### Documentation API
```typescript
/**
 * Edge Function pour suggérer des prix basés sur l'IA
 * 
 * @route POST /functions/v1/ai-price-suggestion
 * @param {PriceSuggestionRequest} request - Données du devis
 * @returns {PriceSuggestionResponse} Prix suggéré avec métadonnées
 */
```

### README des fonctionnalités
Chaque fonctionnalité importante doit avoir sa documentation :
```markdown
# Feature: Système de notifications

## Vue d'ensemble
Description de la fonctionnalité

## Architecture
Schéma et explication de l'architecture

## Usage
Exemples d'utilisation

## Configuration
Paramètres configurables
```

## Ressources utiles

### Liens de développement
- 🏠 [Projet Lovable](https://lovable.dev/projects/392875c8-c4e1-4f95-b40a-246008455c90)
- 📊 [Dashboard Supabase](https://supabase.com/dashboard/project/nbugpbakfkyvvjzgfjmw)
- 📚 [Documentation Supabase](https://supabase.com/docs)
- 🎨 [Shadcn/ui](https://ui.shadcn.com/)

### Outils recommandés
- **IDE** : VS Code avec extensions TypeScript, Tailwind CSS
- **Browser** : Chrome DevTools pour le debugging
- **Git** : Interface graphique comme GitKraken ou SourceTree
- **Design** : Figma pour les mockups

## Support

### Canaux de communication
- 💬 **Discord** : [Rejoindre la communauté](https://discord.gg/repairconnect)
- 📧 **Email** : dev@repairconnect.fr
- 🐛 **Issues** : GitHub Issues pour les bugs

### Processus de revue
1. **Review automatique** : CI/CD checks
2. **Review pair** : Au moins un développeur senior
3. **Review QA** : Tests manuels pour les features critiques
4. **Merge** : Après approval et tests

---

**Merci de contribuer à RepairConnect !** 🚀

*Ensemble, créons la meilleure plateforme de réparation mobile en France.*