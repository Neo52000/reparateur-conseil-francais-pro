# 🚀 Guide de Déploiement - RepairConnect

## Vue d'ensemble

Ce guide détaille les différentes méthodes de déploiement de RepairConnect, de l'environnement de développement à la production.

## Environnements

### 1. Développement Local
```bash
# Configuration locale
NODE_ENV=development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### 2. Staging
```bash
# Configuration staging
NODE_ENV=staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
```

### 3. Production
```bash
# Configuration production
NODE_ENV=production
VITE_SUPABASE_URL=https://{SUPABASE_PROJECT_ID}.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
```

## Déploiement via Lovable (Recommandé)

### Avantages
- ✅ Déploiement automatique
- ✅ CDN global intégré
- ✅ HTTPS par défaut
- ✅ Preview des branches
- ✅ Rollback instantané

### Processus
1. **Ouvrir le projet Lovable**
   ```
   https://lovable.dev/projects/392875c8-c4e1-4f95-b40a-246008455c90
   ```

2. **Publier**
   - Cliquer sur **Share → Publish**
   - Choisir le domaine (lovable.app ou personnalisé)
   - Confirmer le déploiement

3. **Configuration du domaine personnalisé**
   - Aller dans **Project → Settings → Domains**
   - Ajouter votre domaine : `repairconnect.fr`
   - Configurer les DNS selon les instructions

### Configuration DNS pour domaine personnalisé
```dns
# Type  Name              Target
CNAME   www               lovable-production.pages.dev
CNAME   repairconnect.fr  lovable-production.pages.dev
```

## Déploiement manuel

### 1. Vercel

#### Installation Vercel CLI
```bash
npm i -g vercel
```

#### Configuration
```bash
# vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Déploiement
```bash
# Premier déploiement
vercel

# Déploiements suivants
vercel --prod
```

### 2. Netlify

#### netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "https://{SUPABASE_PROJECT_ID}.supabase.co"
  VITE_SUPABASE_ANON_KEY = "production-key"
```

#### Déploiement via CLI
```bash
# Installation
npm install -g netlify-cli

# Build et déploiement
npm run build
netlify deploy --prod --dir=dist
```

### 3. Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Gestion du cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## Configuration Supabase

### 1. Projet Supabase

#### Variables d'environnement
```bash
# Production
SUPABASE_URL=https://{SUPABASE_PROJECT_ID}.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Secrets pour Edge Functions
```bash
# Configuration des secrets
supabase secrets set MISTRAL_API_KEY=your-key
supabase secrets set FIRECRAWL_API_KEY=your-key
supabase secrets set SERPER_API_KEY=your-key
supabase secrets set RESEND_API_KEY=your-key
```

### 2. Déploiement des Edge Functions

#### Toutes les fonctions
```bash
supabase functions deploy
```

#### Fonction spécifique
```bash
supabase functions deploy ai-price-suggestion
```

#### Avec secrets
```bash
supabase functions deploy --project-ref {SUPABASE_PROJECT_ID}
```

### 3. Migrations de base de données

#### Appliquer les migrations
```bash
supabase db push
```

#### Générer les types TypeScript
```bash
supabase gen types typescript --project-id {SUPABASE_PROJECT_ID} > src/integrations/supabase/types.ts
```

## Monitoring et Observabilité

### 1. Monitoring applicatif

#### Sentry (Error tracking)
```typescript
// main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
})
```

#### Web Vitals
```typescript
// utils/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function trackWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}
```

### 2. Monitoring infrastructure

#### Uptime monitoring
```bash
# Endpoint de santé
GET /health
{
  "status": "healthy",
  "timestamp": "2025-01-07T10:00:00Z",
  "version": "3.0.0",
  "services": {
    "database": "connected",
    "functions": "operational"
  }
}
```

#### Métriques Supabase
- Requêtes/seconde
- Latence moyenne
- Taux d'erreur
- Utilisation des ressources

## Performance et Optimisation

### 1. Optimisations build

#### Vite configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          maps: ['leaflet', 'react-leaflet']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. CDN et cache

#### Headers de cache
```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}
```

#### Service Worker
```typescript
// sw.ts - Cache des assets critiques
const CACHE_NAME = 'repairconnect-v3'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
]
```

## Sécurité

### 1. Headers de sécurité

```nginx
# Sécurité headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
```

### 2. HTTPS et certificats

#### Let's Encrypt avec Certbot
```bash
# Installation
sudo apt install certbot python3-certbot-nginx

# Génération certificat
sudo certbot --nginx -d repairconnect.fr -d www.repairconnect.fr

# Renouvellement automatique
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

## Rollback et Recovery

### 1. Stratégie de rollback

#### Via Lovable
- Interface graphique pour revenir à une version précédente
- Rollback instantané sans interruption de service

#### Via Git
```bash
# Rollback à un commit spécifique
git revert <commit-hash>
git push origin main

# Redéploiement automatique via webhook
```

### 2. Backup base de données

#### Backup quotidien Supabase
```sql
-- Backup automatique activé sur Supabase
-- Rétention : 7 jours pour le plan Pro
-- Point-in-time recovery disponible
```

#### Backup manuel
```bash
# Export via pg_dump
pg_dump "postgresql://user:pass@host:port/db" > backup.sql

# Restauration
psql "postgresql://user:pass@host:port/db" < backup.sql
```

## Checklist de déploiement

### Pré-déploiement
- [ ] Tests automatisés passent
- [ ] Variables d'environnement configurées
- [ ] Secrets Supabase définis
- [ ] Migrations de DB testées
- [ ] Build de production testé

### Déploiement
- [ ] Edge Functions déployées
- [ ] Frontend déployé
- [ ] DNS configuré
- [ ] HTTPS activé
- [ ] Monitoring activé

### Post-déploiement
- [ ] Smoke tests réussis
- [ ] Métriques normales
- [ ] Logs sans erreurs
- [ ] Backup vérifié
- [ ] Équipe notifiée

## Troubleshooting

### Problèmes courants

#### 1. Build fails
```bash
# Vérifier les versions Node.js
node --version  # >= 18
npm --version   # >= 8

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment variables
```bash
# Vérifier les variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test de connexion Supabase
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/"
```

#### 3. Edge Functions errors
```bash
# Logs des fonctions
supabase functions logs ai-price-suggestion

# Test local
supabase functions serve
curl -X POST http://localhost:54321/functions/v1/ai-price-suggestion
```

---

**Dernière mise à jour** : 7 janvier 2025  
**Version** : 3.0