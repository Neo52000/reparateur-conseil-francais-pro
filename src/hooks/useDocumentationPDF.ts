/**
 * Hook pour gérer la génération et mise à jour automatique des PDFs
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentationPDFService, DocumentMetadata } from '@/services/documentationPDFService';

export interface DocumentationPDFHook {
  generating: boolean;
  generatePDF: (docType: 'prd' | 'user-guide' | 'technical') => Promise<void>;
  generateAllPDFs: () => Promise<void>;
}

export const useDocumentationPDF = (): DocumentationPDFHook => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const fetchDocumentContent = async (docType: 'prd' | 'user-guide' | 'technical'): Promise<string> => {
    // Contenu enrichi en cas d'absence des fichiers de documentation
    const fallbackContent = {
      'prd': `# Product Requirements Document - ReparMobile

## 1. Vue d'ensemble du projet

### 1.1 Objectif principal
ReparMobile est une **plateforme de mise en relation** entre particuliers ayant des appareils électroniques défaillants et réparateurs professionnels qualifiés. Notre objectif est de créer le **"Doctolib de la réparation mobile"**.

### 1.2 Vision
Démocratiser la réparation d'appareils électroniques en France en offrant :
- **Transparence totale** des prix et délais
- **Géolocalisation** des réparateurs à proximité  
- **Confiance** via un système d'avis vérifiés
- **Simplicité** d'utilisation pour tous les âges

## 2. Personas utilisateurs

### 2.1 Client particulier (Marie, 35 ans)
- **Besoin** : Faire réparer son iPhone cassé rapidement
- **Contraintes** : Budget limité, peu de temps libre
- **Attentes** : Prix transparent, délais respectés, proximité

### 2.2 Réparateur professionnel (Pierre, 28 ans)  
- **Besoin** : Développer sa clientèle
- **Contraintes** : Gestion administrative, visibilité web
- **Attentes** : Clients qualifiés, outils de gestion, facturation

### 2.3 Administrateur plateforme
- **Responsabilités** : Modération, analytics, support technique
- **Outils** : Dashboard complet, gestion des litiges

## 3. Fonctionnalités principales

### 3.1 Pour les clients
\`\`\`
- Recherche géolocalisée de réparateurs
- Comparaison de devis instantanés  
- Prise de rendez-vous en ligne
- Suivi temps réel de la réparation
- Paiement sécurisé avec rétention
- Système d'avis post-intervention
\`\`\`

### 3.2 Pour les réparateurs
\`\`\`
- Profil professionnel optimisé SEO
- Gestion agenda et disponibilités
- Système de devis automatisé
- Point de vente (POS) intégré
- Analytics de performance
- Module e-commerce optionnel
\`\`\`

## 4. Architecture technique

### 4.1 Stack technologique
- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Hébergement** : Lovable Platform
- **Paiements** : Stripe integration
- **Maps** : Leaflet + OpenStreetMap

### 4.2 Modules avancés
> **Module POS** : Point de vente complet pour les réparateurs
> **Module E-commerce** : Boutique en ligne intégrée  
> **IA Diagnostique** : Pré-diagnostic automatisé via chatbot
> **SEO Local** : Pages d'atterrissage par ville

## 5. Modèle économique

### 5.1 Abonnements réparateurs
| Plan | Prix/mois | Fonctionnalités |
|------|-----------|-----------------|
| Gratuit | 0€ | Profil basique |
| Basic | 9,90€ | + Devis illimités |
| Pro | 19,90€ | + Analytics |
| Premium | 39,90€ | + Module POS |
| Enterprise | 99,90€ | + E-commerce |

### 5.2 Commissions
- **5% de commission** sur chaque transaction
- **Pas de frais cachés** pour les clients
- **Paiement différé** jusqu'à validation de la réparation

## 6. Conformité et sécurité

### 6.1 Réglementations
- ✅ **RGPD** : Protection des données personnelles
- ✅ **NF-525** : Logiciel de caisse certifié  
- ✅ **Accessibilité WCAG 2.1 AA**
- ✅ **TVA** : Gestion automatique selon le statut

### 6.2 Sécurité
- Chiffrement des données sensibles
- Authentification multi-facteur optionnelle
- Audit trail complet
- Sauvegarde quotidienne

## 7. Roadmap

### Phase 1 (Q1 2025) ✅
- Plateforme de base
- Recherche et mise en relation
- Système de paiement

### Phase 2 (Q2 2025) 🔄
- Module POS pour réparateurs
- IA de pré-diagnostic
- Mobile app

### Phase 3 (Q3 2025) 📋
- Module e-commerce
- API pour partenaires
- Expansion européenne`,

      'user-guide': `# Guide Utilisateur ReparMobile

## Introduction
Bienvenue sur **ReparMobile**, votre plateforme de mise en relation avec des réparateurs professionnels.

## 🧑‍💼 Guide Client

### Étape 1 : Recherche de réparateurs
1. **Saisissez votre localisation** ou activez la géolocalisation
2. **Décrivez votre appareil** (marque, modèle, problème)
3. **Consultez la liste** des réparateurs à proximité

### Étape 2 : Comparaison et choix
- Comparez les **tarifs**, **délais** et **avis clients**
- Consultez les **certifications** du réparateur
- Vérifiez les **spécialités** (iPhone, Samsung, etc.)

### Étape 3 : Prise de rendez-vous
1. Sélectionnez un **créneau disponible**
2. Confirmez votre **demande de devis**
3. Recevez une **estimation** sous 24h

### Étape 4 : Suivi de réparation
- **Notifications temps réel** du statut
- **Communication directe** avec le réparateur
- **Photos** du diagnostic et des réparations

### Étape 5 : Finalisation
- **Validation** de la réparation
- **Paiement sécurisé** automatique
- **Avis** pour aider la communauté

## 🔧 Guide Réparateur

### Configuration du profil
\`\`\`markdown
- Informations entreprise (SIRET, assurance)
- Spécialités et certifications  
- Zone d'intervention
- Tarifs par type de réparation
- Photos de l'atelier
\`\`\`

### Gestion des demandes
1. **Réception** des demandes clients
2. **Établissement** du devis détaillé
3. **Planification** de l'intervention
4. **Suivi** avec le client

### Outils avancés
> **Module POS** : Caisse enregistreuse complète
> **Gestion stock** : Inventaire et commandes
> **Analytics** : Performances et statistiques
> **E-commerce** : Boutique en ligne

## 👨‍💻 Interface Administrateur

### Dashboard principal
- Vue d'ensemble des métriques clés
- Gestion des utilisateurs et réparateurs
- Modération des avis et contenus
- Support client intégré

### Outils de gestion
- Analytics avancées
- Gestion des litiges
- Configuration plateforme
- Exports et rapports

## ❓ FAQ

**Q : Comment fonctionne le paiement ?**
R : Le paiement est **retenu** jusqu'à validation de la réparation par le client.

**Q : Que faire en cas de litige ?**
R : Notre équipe de médiation intervient dans les 48h.

**Q : Les réparateurs sont-ils vérifiés ?**
R : Oui, tous les profils sont **vérifiés** (SIRET, assurance, certifications).

## 📞 Support
- **Email** : support@reparmobile.fr
- **Chat** : Disponible 9h-18h
- **Téléphone** : 01 23 45 67 89`,

      'technical': `# Documentation Technique ReparMobile

## Architecture Système

### Vue d'ensemble
ReparMobile est construit sur une architecture moderne **React + Supabase**, déployée sur la plateforme Lovable.

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Supabase       │────│   Services      │
│   React TS      │    │   PostgreSQL     │    │   Stripe        │
│   Tailwind CSS  │    │   Auth + Storage │    │   Maps API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
\`\`\`

### Stack technique détaillée

#### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design system
- **Vite** comme bundler
- **React Router** pour la navigation
- **React Hook Form** + Zod pour les formulaires

#### Backend (Supabase)
- **PostgreSQL** avec Row Level Security (RLS)
- **Auth** : JWT avec gestion des rôles
- **Storage** : Fichiers et images
- **Edge Functions** : Logique métier complexe
- **Realtime** : Notifications temps réel

#### Intégrations externes
- **Stripe** : Paiements et rétention
- **Leaflet** : Cartes et géolocalisation  
- **HTML2Canvas + jsPDF** : Génération PDF
- **QR Code** : Tickets et suivi

## Base de données

### Schéma principal
\`\`\`sql
-- Utilisateurs et profils
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('client', 'repairer', 'admin')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Réparateurs détaillés  
CREATE TABLE repairer_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  business_name TEXT,
  siret TEXT,
  address TEXT,
  lat DECIMAL,
  lng DECIMAL,
  specialties TEXT[],
  verified BOOLEAN DEFAULT FALSE
);

-- Appareils et réparations
CREATE TABLE repair_orders (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES profiles(id),
  repairer_id UUID REFERENCES repairer_profiles(id),
  device_info JSONB,
  status TEXT,
  estimated_cost DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Politiques RLS (Row Level Security)
\`\`\`sql
-- Les clients voient leurs propres réparations
CREATE POLICY "clients_own_repairs" ON repair_orders
  FOR ALL USING (
    auth.uid() = client_id OR 
    auth.uid() IN (
      SELECT user_id FROM repairer_profiles 
      WHERE id = repairer_id
    )
  );
\`\`\`

## Authentification et autorisation

### Flux d'authentification
1. **Inscription** via email/password ou OAuth
2. **Vérification** email automatique  
3. **Attribution** du rôle (client par défaut)
4. **Création** du profil associé

### Gestion des rôles
\`\`\`typescript
type UserRole = 'client' | 'repairer' | 'admin';

// Hook pour vérifier les permissions
export const useAuth = () => {
  const canAccessRepairer = user?.role === 'repairer' || user?.role === 'admin';
  const canAccessAdmin = user?.role === 'admin';
  
  return { user, canAccessRepairer, canAccessAdmin };
};
\`\`\`

## APIs et endpoints

### Supabase Client
\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://nbugpbakfkyvvjzgfjmw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
\`\`\`

### Edge Functions principales
- \`/functions/create-payment-intent\` : Gestion Stripe
- \`/functions/send-notification\` : SMS/Email
- \`/functions/geocode-address\` : Géolocalisation
- \`/functions/ai-diagnosis\` : IA diagnostic

## Module POS

### Architecture
Le module POS est intégré nativement dans la plateforme avec :
- **Gestion des sessions** de caisse
- **Inventaire** synchronisé
- **Transactions** conformes NF-525
- **Impression** de tickets

\`\`\`typescript
// Interface POS principale
interface POSTransaction {
  id: string;
  session_id: string;
  items: POSItem[];
  total_amount: number;
  payment_method: 'cash' | 'card';
  transaction_date: string;
}
\`\`\`

## Déploiement

### Environnements
- **Développement** : Localhost + Supabase dev
- **Staging** : Lovable preview
- **Production** : Lovable deployment

### Variables d'environnement
\`\`\`bash
VITE_SUPABASE_URL=https://nbugpbakfkyvvjzgfjmw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
STRIPE_PUBLIC_KEY=pk_live_...
\`\`\`

### CI/CD
Le déploiement est automatique via Lovable :
1. **Push** sur main
2. **Build** automatique  
3. **Tests** unitaires
4. **Déploiement** production

## Monitoring et maintenance

### Métriques surveillées
- Performance frontend (Core Web Vitals)
- Erreurs JavaScript
- Temps de réponse API
- Utilisation base de données

### Sauvegarde
- **Base de données** : Quotidienne automatique
- **Storage** : Réplication multi-zones
- **Code** : Git + Lovable versioning

## Guide développeur

### Installation locale
\`\`\`bash
git clone https://github.com/project/reparmobile
cd reparmobile
npm install
npm run dev
\`\`\`

### Structure du projet
\`\`\`
src/
├── components/          # Composants React
├── hooks/              # Hooks personnalisés  
├── pages/              # Pages principales
├── services/           # Services externes
├── integrations/       # Supabase client
└── types/              # Types TypeScript
\`\`\`

### Conventions de code
- **TypeScript strict** activé
- **ESLint + Prettier** pour le formatage
- **Conventional commits** pour les messages git
- **Composants fonctionnels** avec hooks uniquement`
    };

    const docPaths = {
      'prd': '/docs/PRD.md',
      'user-guide': '/docs/user-guide.md',
      'technical': '/docs/README.md'
    };

    try {
      const response = await fetch(docPaths[docType]);
      if (!response.ok) {
        console.warn(`Document ${docPaths[docType]} non trouvé, utilisation du contenu de fallback`);
        return fallbackContent[docType];
      }
      const content = await response.text();
      // Si le fichier existe mais est vide ou très court, utiliser le fallback
      if (content.length < 100) {
        console.warn(`Document ${docPaths[docType]} trop court, utilisation du contenu enrichi`);
        return fallbackContent[docType];
      }
      return content;
    } catch (error) {
      console.error(`Erreur lors du chargement du document ${docType}:`, error);
      console.info(`Utilisation du contenu de fallback pour ${docType}`);
      return fallbackContent[docType];
    }
  };

  const generatePDF = useCallback(async (docType: 'prd' | 'user-guide' | 'technical') => {
    if (generating) return;

    setGenerating(true);
    
    try {
      toast({
        title: "Génération PDF",
        description: "Génération du PDF en cours...",
      });

      // Récupérer le contenu du document
      const content = await fetchDocumentContent(docType);
      
      // Générer les métadonnées
      const metadata = DocumentationPDFService.generateMetadata(docType);
      
      // Générer le PDF
      const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
      
      // Télécharger le PDF
      DocumentationPDFService.downloadPDF(pdfBlob, metadata.filename);
      
      toast({
        title: "PDF généré avec succès",
        description: `Le document ${metadata.title} a été téléchargé.`,
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [generating, toast]);

  const generateAllPDFs = useCallback(async () => {
    if (generating) return;

    setGenerating(true);
    
    try {
      toast({
        title: "Génération de tous les PDFs",
        description: "Génération de la documentation complète...",
      });

      const docTypes: ('prd' | 'user-guide' | 'technical')[] = ['prd', 'user-guide', 'technical'];
      
      for (const docType of docTypes) {
        try {
          const content = await fetchDocumentContent(docType);
          const metadata = DocumentationPDFService.generateMetadata(docType);
          const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
          DocumentationPDFService.downloadPDF(pdfBlob, metadata.filename);
          
          // Petite pause entre chaque génération
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erreur pour ${docType}:`, error);
        }
      }
      
      toast({
        title: "Documentation générée",
        description: "Tous les PDFs disponibles ont été téléchargés.",
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération complète:', error);
      toast({
        title: "Erreur de génération",
        description: "Erreur lors de la génération de la documentation complète.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [generating, toast]);

  return {
    generating,
    generatePDF,
    generateAllPDFs,
  };
};