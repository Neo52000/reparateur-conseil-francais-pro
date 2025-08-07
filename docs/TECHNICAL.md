# 🔧 Documentation Technique - RepairConnect

## Vue d'ensemble de l'architecture

RepairConnect utilise une architecture moderne basée sur React avec Supabase comme backend-as-a-service.

## Stack technique détaillée

### Frontend
```typescript
// Technologies principales
React 18.3.1          // Framework UI
TypeScript 5.x         // Type safety
Tailwind CSS 3.x       // Styling
Vite 6.x              // Build tool
```

### Backend Services
```yaml
Supabase:
  - PostgreSQL 15      # Base de données
  - Auth               # Authentification
  - Real-time          # WebSocket
  - Edge Functions     # Logique métier
  - Storage            # Stockage fichiers
```

### Intégrations IA
```javascript
// Services IA utilisés
const aiServices = {
  mistral: 'Diagnostic et classification',
  deepseek: 'Amélioration continue',
  chatbot: 'Support client automatisé'
}
```

## Architecture des composants

### Structure modulaire
```
src/
├── components/
│   ├── ui/              # Composants base (Shadcn)
│   ├── admin/           # Interface administration
│   │   ├── Analytics/   # Tableaux de bord
│   │   ├── Users/       # Gestion utilisateurs
│   │   └── Settings/    # Configuration
│   ├── repairer/        # Interface réparateur
│   └── customer/        # Interface client
├── hooks/               # Logique métier réutilisable
├── services/            # Couche de services
└── integrations/        # APIs externes
```

### Hooks personnalisés principaux

#### `useAuth()`
```typescript
interface AuthHook {
  user: User | null
  profile: Profile | null
  isRepairer: boolean
  isAdmin: boolean
  signIn: (credentials: LoginCredentials) => Promise<void>
  signOut: () => Promise<void>
}
```

#### `useRepairers()`
```typescript
interface RepairersHook {
  repairers: Repairer[]
  loading: boolean
  searchRepairers: (filters: SearchFilters) => void
  getNearbyRepairers: (location: Location) => Promise<Repairer[]>
}
```

#### `useAnalytics()`
```typescript
interface AnalyticsHook {
  visitorStats: VisitorStats
  performanceMetrics: PerformanceMetrics
  trackEvent: (event: AnalyticsEvent) => void
}
```

## Base de données

### Schéma principal

```sql
-- Profils utilisateurs étendus
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  display_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réparateurs
CREATE TABLE repairers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  business_name TEXT NOT NULL,
  siret TEXT,
  specialties TEXT[],
  pricing JSONB,
  location GEOGRAPHY(POINT, 4326),
  rating DECIMAL(3,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE
);

-- Devis
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  repairer_id UUID REFERENCES repairers(id),
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  estimated_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  ai_diagnosis JSONB
);
```

### Row Level Security (RLS)

```sql
-- Politique pour les profils
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour les réparateurs
CREATE POLICY "Public can view verified repairers" ON repairers
  FOR SELECT USING (verified = true);

-- Politique pour les devis
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = customer_id
      UNION
      SELECT user_id FROM repairers WHERE id = repairer_id
    )
  );
```

## Edge Functions

### Structure des fonctions

```typescript
// supabase/functions/ai-price-suggestion/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { device, issue, location } = await req.json()
  
  // Logique IA pour suggestion de prix
  const price = await calculateAIPrice(device, issue, location)
  
  return new Response(JSON.stringify({ price }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Fonctions disponibles

| Fonction | Description | Déclencheur |
|----------|-------------|-------------|
| `ai-price-suggestion` | Suggestions prix IA | Manuel |
| `create-repairer-user` | Création compte réparateur | Webhook |
| `scrape-repairers` | Scraping automatisé | Cron |
| `send-notification` | Notifications push | Event |
| `process-analytics` | Traitement analytics | Real-time |

## Services de scraping

### Architecture du scraping
```typescript
class ScrapingService {
  private sources = [
    'pages-jaunes',
    'google-maps',
    'yelp',
    'custom-sites'
  ]
  
  async scrapeAll(): Promise<RepairerData[]> {
    const results = await Promise.all(
      this.sources.map(source => this.scrapeSource(source))
    )
    return this.deduplicateAndValidate(results.flat())
  }
}
```

### Pipeline de traitement
1. **Collection** : Sources multiples (API + scraping)
2. **Validation** : IA pour vérifier la cohérence
3. **Géocodage** : Conversion adresses → coordonnées
4. **Déduplication** : Algorithme de matching intelligent
5. **Enrichissement** : Données complémentaires via IA

## Analytics temps réel

### Architecture événementielle
```typescript
interface AnalyticsEvent {
  event_type: string
  user_id?: string
  session_id: string
  page_path: string
  timestamp: number
  properties: Record<string, any>
}

// Traitement en temps réel
const processAnalytics = async (event: AnalyticsEvent) => {
  await Promise.all([
    storeEvent(event),
    updateMetrics(event),
    triggerAlerts(event)
  ])
}
```

### Métriques trackées
- **Trafic** : Pages vues, sessions, bouncing
- **Conversion** : Funnel devis → RDV → paiement
- **Performance** : Temps de chargement, erreurs
- **Engagement** : Temps sur page, interactions

## Performance et optimisation

### Stratégies d'optimisation

#### 1. Code Splitting
```typescript
// Lazy loading des routes
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const RepairerDashboard = lazy(() => import('@/pages/RepairerDashboard'))
```

#### 2. Mise en cache
```typescript
// React Query pour le cache API
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  }
})
```

#### 3. Optimisation images
```typescript
// Lazy loading automatique
const ImageOptimized = ({ src, alt }: ImageProps) => (
  <img 
    src={src} 
    alt={alt}
    loading="lazy"
    decoding="async"
  />
)
```

## Sécurité

### Mesures de sécurité

#### 1. Authentification
- JWT tokens avec rotation automatique
- MFA optionnelle pour les admins
- Session timeout configurable

#### 2. Autorisation
- RLS au niveau base de données
- Middleware de vérification des rôles
- Audit trail des actions sensibles

#### 3. Protection des données
- Chiffrement en transit (TLS 1.3)
- Chiffrement au repos (AES-256)
- Anonymisation des données analytics

### RGPD et conformité
```typescript
// Gestion du consentement
const ConsentManager = {
  trackingConsent: boolean
  functionalConsent: boolean
  marketingConsent: boolean
  
  updateConsent(preferences: ConsentPreferences): void
  exportUserData(userId: string): Promise<UserData>
  deleteUserData(userId: string): Promise<void>
}
```

## Monitoring et observabilité

### Métriques système
- **Disponibilité** : 99.8% uptime SLA
- **Performance** : P95 < 2s temps de réponse
- **Erreurs** : <0.1% taux d'erreur
- **Throughput** : 1000+ req/s pic

### Alerting
```typescript
const alerts = {
  errorRate: threshold > 1,
  responseTime: p95 > 3000,
  availability: uptime < 99.5,
  dbConnections: active > 80
}
```

## Tests

### Stratégie de test
```typescript
// Tests unitaires
describe('RepairerService', () => {
  it('should find nearby repairers', async () => {
    const result = await findNearbyRepairers(location, radius)
    expect(result).toHaveLength(5)
  })
})

// Tests d'intégration
describe('Auth flow', () => {
  it('should authenticate repairer', async () => {
    const user = await signIn(credentials)
    expect(user.role).toBe('repairer')
  })
})
```

### Coverage targets
- **Unité** : >90% couverture
- **Intégration** : Tests critiques couverts
- **E2E** : Parcours utilisateur principaux

---

**Dernière mise à jour** : 7 janvier 2025  
**Version** : 3.0