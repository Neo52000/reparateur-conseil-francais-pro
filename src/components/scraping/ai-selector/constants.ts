
import { Brain, Zap, Star, Sparkles, Search } from 'lucide-react';
import { APIKeyStatus } from './types';

export const DEFAULT_API_KEY_STATUSES: Record<string, APIKeyStatus> = {
  lovable: 'configured',
  openai: 'needs_config',
  gemini: 'needs_config',
  mistral: 'needs_config',
  perplexity: 'needs_config'
};

// Ordre de priorité: Lovable AI → OpenAI → Gemini → Mistral → Perplexity
export const AI_BASE_OPTIONS = [
  {
    id: 'lovable',
    name: 'Lovable AI',
    icon: Sparkles,
    description: 'IA intégrée Lovable (Gemini/GPT-5)',
    capabilities: ['Génération', 'Classification', 'Analyse'],
    pricing: 'Inclus'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    icon: Star,
    description: 'IA de référence, très précise',
    capabilities: ['Classification experte', 'Analyse complexe', 'Géocodage'],
    pricing: 'API payante'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: Brain,
    description: 'IA Google, multimodale',
    capabilities: ['Génération', 'Vision', 'Analyse'],
    pricing: 'API payante'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: Zap,
    description: 'IA française, rapide et efficace',
    capabilities: ['Classification', 'Nettoyage', 'Géolocalisation'],
    pricing: 'Gratuit (limite)'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: Search,
    description: 'IA avec recherche web en temps réel',
    capabilities: ['Recherche', 'Validation', 'Actualités'],
    pricing: 'API payante'
  }
];
