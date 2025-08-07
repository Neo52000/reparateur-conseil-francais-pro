# 🌐 Documentation API - RepairConnect

## Vue d'ensemble

RepairConnect expose une API REST basée sur Supabase avec des Edge Functions pour la logique métier avancée.

## Authentification

### JWT Bearer Token
```typescript
// Headers requis pour les requêtes authentifiées
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Rôles utilisateur
```typescript
type UserRole = 'customer' | 'repairer' | 'admin'

interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  verified: boolean
}
```

## API Base de données

### Tables principales accessibles

#### Profils utilisateurs
```typescript
// GET /rest/v1/profiles
interface Profile {
  id: string
  user_id: string
  display_name: string
  phone?: string
  address?: string
  created_at: string
}

// Exemples de requêtes
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
```

#### Réparateurs
```typescript
// GET /rest/v1/repairers
interface Repairer {
  id: string
  user_id?: string
  business_name: string
  siret?: string
  specialties: string[]
  pricing: PricingData
  location: GeoPoint
  rating: number
  verified: boolean
}

// Recherche géolocalisée
const { data } = await supabase
  .from('repairers')
  .select('*')
  .eq('verified', true)
  .gte('rating', 4.0)
  .limit(10)
```

#### Devis
```typescript
// GET /rest/v1/quotes
interface Quote {
  id: string
  customer_id: string
  repairer_id: string
  device_model: string
  issue_description: string
  estimated_price: number
  status: QuoteStatus
  ai_diagnosis?: AIAnalysis
}

type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired'
```

## Edge Functions

### 1. Suggestion de prix IA

**Endpoint** : `POST /functions/v1/ai-price-suggestion`

```typescript
// Request
interface PriceSuggestionRequest {
  device_model: string
  issue_description: string
  location?: {
    lat: number
    lng: number
  }
  urgency?: 'low' | 'medium' | 'high'
}

// Response
interface PriceSuggestionResponse {
  suggested_price: number
  confidence: number
  price_range: {
    min: number
    max: number
  }
  market_analysis: {
    average_local_price: number
    competition_level: string
  }
}

// Exemple d'utilisation
const response = await fetch('/functions/v1/ai-price-suggestion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    device_model: 'iPhone 14 Pro',
    issue_description: 'Écran cassé',
    location: { lat: 48.8566, lng: 2.3522 }
  })
})
```

### 2. Création compte réparateur

**Endpoint** : `POST /functions/v1/create-repairer-user`

```typescript
// Request
interface CreateRepairerRequest {
  email: string
  password: string
  business_info: {
    name: string
    siret?: string
    address: string
    phone: string
    specialties: string[]
  }
  initial_pricing?: PricingData
}

// Response
interface CreateRepairerResponse {
  user_id: string
  repairer_id: string
  verification_required: boolean
  next_steps: string[]
}
```

### 3. Scraping de réparateurs

**Endpoint** : `POST /functions/v1/scrape-repairers`

```typescript
// Request (Admin seulement)
interface ScrapeRequest {
  sources?: string[]
  location_filter?: {
    department: string
    radius_km?: number
  }
  limit?: number
}

// Response
interface ScrapeResponse {
  job_id: string
  estimated_completion: string
  sources_targeted: string[]
  expected_results: number
}

// Status check
// GET /functions/v1/scrape-status/{job_id}
interface ScrapeStatus {
  job_id: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  results_found: number
  errors?: string[]
}
```

### 4. Notifications

**Endpoint** : `POST /functions/v1/send-notification`

```typescript
// Request
interface NotificationRequest {
  user_id: string
  type: 'email' | 'sms' | 'push'
  template: string
  data: Record<string, any>
  schedule?: string // ISO 8601 date
}

// Templates disponibles
type NotificationTemplate = 
  | 'quote_received'
  | 'appointment_confirmed'
  | 'repair_completed'
  | 'payment_reminder'
  | 'welcome_repairer'
```

### 5. Analytics en temps réel

**Endpoint** : `POST /functions/v1/track-event`

```typescript
// Request
interface TrackEventRequest {
  event_type: string
  properties: Record<string, any>
  user_id?: string
  session_id?: string
}

// Events pré-définis
type AnalyticsEvent = 
  | 'page_view'
  | 'quote_requested'
  | 'repairer_contacted'
  | 'appointment_booked'
  | 'search_performed'
```

## Webhooks

### Configuration des webhooks

```typescript
// Supabase Database Webhooks
const webhookConfig = {
  table: 'quotes',
  events: ['INSERT', 'UPDATE'],
  endpoint: '/functions/v1/quote-webhook'
}

// Payload type
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record?: any
  schema: string
}
```

### Webhooks disponibles

#### 1. Nouveau devis
```typescript
// Déclenché lors de la création d'un devis
// POST /functions/v1/quote-webhook
{
  type: 'INSERT',
  table: 'quotes',
  record: Quote,
  schema: 'public'
}
```

#### 2. Changement de statut
```typescript
// Déclenché lors du changement de statut
// POST /functions/v1/status-webhook
{
  type: 'UPDATE',
  table: 'quotes',
  record: Quote,
  old_record: Quote,
  schema: 'public'
}
```

## Real-time Subscriptions

### Écoute des changements en temps réel

```typescript
// Écouter les nouveaux devis pour un réparateur
const subscription = supabase
  .channel('quotes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'quotes',
    filter: `repairer_id=eq.${repairerId}`
  }, (payload) => {
    console.log('Nouveau devis reçu:', payload.new)
  })
  .subscribe()

// Écouter les mises à jour de statut
supabase
  .channel('quote_updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'quotes',
    filter: `customer_id=eq.${customerId}`
  }, (payload) => {
    console.log('Statut mis à jour:', payload.new.status)
  })
  .subscribe()
```

## Rate Limiting

### Limites par endpoint

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/rest/v1/*` | 1000 req | 1 minute |
| `/functions/v1/ai-*` | 100 req | 1 minute |
| `/functions/v1/scrape-*` | 10 req | 1 heure |
| `/functions/v1/send-*` | 500 req | 1 heure |

### Headers de rate limiting
```typescript
interface RateLimitHeaders {
  'X-RateLimit-Limit': string      // Limite par fenêtre
  'X-RateLimit-Remaining': string  // Requêtes restantes
  'X-RateLimit-Reset': string      // Timestamp de reset
}
```

## Codes de statut

### Codes HTTP standards
- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `429` - Trop de requêtes
- `500` - Erreur serveur

### Format d'erreur
```typescript
interface APIError {
  error: string
  message: string
  details?: any
  code?: string
}

// Exemple
{
  "error": "VALIDATION_ERROR",
  "message": "Le modèle d'appareil est requis",
  "details": {
    "field": "device_model",
    "value": null
  }
}
```

## SDK et librairies

### SDK JavaScript/TypeScript
```bash
npm install @repairconnect/sdk
```

```typescript
import { RepairConnectAPI } from '@repairconnect/sdk'

const api = new RepairConnectAPI({
  apiKey: 'your-api-key',
  environment: 'production' // ou 'staging'
})

// Utilisation
const repairers = await api.repairers.search({
  location: { lat: 48.8566, lng: 2.3522 },
  specialties: ['iPhone'],
  radius: 10
})
```

### SDK Python (prévu Q2 2025)
```python
from repairconnect import Client

client = Client(api_key='your-api-key')
repairers = client.repairers.search(
    location=(48.8566, 2.3522),
    specialties=['iPhone'],
    radius=10
)
```

## Environnements

### URLs des environnements
- **Production** : `https://api.repairconnect.fr`
- **Staging** : `https://staging-api.repairconnect.fr`
- **Development** : `http://localhost:54321`

### Configuration par environnement
```typescript
const config = {
  production: {
    supabaseUrl: 'https://nbugpbakfkyvvjzgfjmw.supabase.co',
    functionsUrl: 'https://nbugpbakfkyvvjzgfjmw.functions.supabase.co'
  },
  staging: {
    supabaseUrl: 'https://staging-project.supabase.co',
    functionsUrl: 'https://staging-project.functions.supabase.co'
  }
}
```

---

**Dernière mise à jour** : 7 janvier 2025  
**Version API** : v1.0