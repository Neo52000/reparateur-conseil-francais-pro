# TopReparateurs.fr

> Plateforme francaise de mise en relation pour la reparation de smartphones

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## A propos

TopReparateurs.fr est une plateforme SaaS qui met en relation particuliers et reparateurs qualifies en France, via une solution transparente, fiable et accessible.

### 🎯 Notre mission
Démocratiser l'accès à la réparation mobile en créant un écosystème de confiance entre particuliers et professionnels.

## ✨ Fonctionnalités principales

### 👥 Pour les particuliers
- 🗺️ **Recherche géolocalisée** de réparateurs
- 🤖 **Diagnostic IA** instantané et devis automatique
- ⚖️ **Comparaison d'offres** transparente
- 📅 **Prise de RDV** en ligne simplifiée
- 📊 **Suivi temps réel** des réparations
- ⭐ **Système d'avis** et notation

### 🔨 Pour les réparateurs
- 👤 **Profil professionnel** avec certifications
- 💰 **Gestion devis** et tarifications
- 📅 **Agenda intelligent** de planification
- 📊 **Analytics avancées** de performance
- 💳 **Facturation automatisée**
- 🎓 **Formation** et support technique

### 👑 Administration
- ✅ **Validation automatisée** des réparateurs
- 🛡️ **Modération IA** des avis
- 📈 **Analytics globales** temps réel
- 💼 **Gestion abonnements** et facturation
- 🎮 **Interface admin** complète

## 🚀 Technologies utilisées

### Frontend
- ⚛️ **React 18** avec TypeScript
- 🎨 **Tailwind CSS** + Shadcn/ui
- 📱 **Progressive Web App** (PWA)
- 🔄 **Framer Motion** pour les animations
- 🗺️ **Leaflet** pour la cartographie

### Backend & Base de données
- 🗄️ **Supabase** (PostgreSQL + Auth + Real-time)
- ⚡ **Edge Functions** pour la logique métier
- 🔐 **Row Level Security** (RLS)
- 🔄 **Real-time subscriptions**

### Intelligence Artificielle
- 🧠 **Mistral AI** pour le diagnostic
- 🎯 **DeepSeek** pour l'amélioration continue
- 🤖 **Chatbot IA** intégré
- 📝 **Génération automatique** de contenu

### Services externes
- 🕷️ **Scraping** : Firecrawl, Apify
- 📧 **Email** : Resend
- 💳 **Paiement** : Stripe (prévu)
- 📊 **Analytics** : Système propriétaire

## 🏗️ Architecture du projet

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants Shadcn/ui
│   ├── admin/          # Interface administration
│   ├── repairer/       # Interface réparateur
│   └── customer/       # Interface client
├── hooks/              # Hooks React personnalisés
├── pages/              # Pages principales de l'app
├── services/           # Services et API calls
├── integrations/       # Intégrations externes (Supabase)
├── types/              # Types TypeScript
└── utils/              # Utilitaires et helpers

supabase/
├── functions/          # Edge Functions
├── migrations/         # Migrations de base de données
└── config.toml        # Configuration Supabase
```

## 🛠️ Installation et développement

### Prérequis
- **Node.js** 18+ ([installer avec nvm](https://github.com/nvm-sh/nvm))
- **npm** ou **yarn**
- Compte **Supabase**

### Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/RepairConnect/repairconnect.git
cd repairconnect

# 2. Installer les dépendances
npm install

# 3. Configuration Supabase
cp .env.example .env.local
# Remplir les variables Supabase

# 4. Démarrer le serveur de développement
npm run dev
```

### Variables d'environnement

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run type-check   # Vérification TypeScript
npm run lint         # Linting ESLint
```

## 🗄️ Base de données

### Tables principales
- `profiles` - Profils utilisateurs étendus
- `repairers` - Données des réparateurs
- `quotes` - Devis et demandes
- `appointments` - Rendez-vous
- `subscriptions` - Abonnements
- `visitor_analytics` - Analytics de trafic

### Edge Functions
- `ai-price-suggestion` - Suggestions de prix IA
- `create-repairer-user` - Création compte réparateur
- `scrape-repairers` - Scraping automatisé
- `send-notification` - Système de notifications

## 🚀 Déploiement

### Via Lovable (Recommandé)
1. Ouvrir [Lovable Project](https://lovable.dev/projects/392875c8-c4e1-4f95-b40a-246008455c90)
2. Cliquer sur **Share → Publish**
3. Configurer le domaine personnalisé

### Déploiement manuel
```bash
# Build de production
npm run build

# Déployer sur votre plateforme favorite
# (Vercel, Netlify, Supabase Hosting...)
```

## Statut du projet

Projet en phase de developpement actif (beta). Stack : React 18 + TypeScript + Vite + Supabase.

## 🤝 Contribution

Nous accueillons les contributions ! Consultez notre [Guide de contribution](docs/CONTRIBUTING.md).

### Workflow de développement
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📚 Documentation

- 📋 [PRD - Product Requirements](docs/PRD.md)
- 🔧 [Documentation technique](docs/TECHNICAL.md)
- 🚀 [Guide de déploiement](docs/DEPLOYMENT.md)
- 🌐 [Documentation API](docs/API.md)

## 📞 Support

- 📧 Email : support@repairconnect.fr
- 💬 Discord : [Rejoindre la communauté](https://discord.gg/repairconnect)
- 📖 Documentation : [docs.repairconnect.fr](https://docs.repairconnect.fr)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ par l'équipe RepairConnect**

*Le Doctolib de la réparation mobile* 📱✨