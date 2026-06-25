import { Brain, Zap, Star, Search } from 'lucide-react';
import { APIKeyStatus } from './types';

export const DEFAULT_API_KEY_STATUSES: Record<string, APIKeyStatus> = {
  gemini: 'needs_config',
  openai: 'needs_config',
  mistral: 'needs_config',
  perplexity: 'needs_config',
};

// Ordre de priorité: Gemini → OpenAI → Mistral → Perplexity
export const AI_BASE_OPTIONS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: Brain,
    description: 'Gemini 2.5 Flash, multimodal',
    capabilities: ['Génération', 'Vision', 'Analyse'],
    pricing: 'Quota gratuit',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    icon: Star,
    description: 'GPT-4o-mini, très précis',
    capabilities: ['Classification experte', 'Analyse complexe', 'Géocodage'],
    pricing: 'API payante',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: Zap,
    description: 'IA française, rapide et efficace',
    capabilities: ['Classification', 'Nettoyage', 'Géolocalisation'],
    pricing: 'Gratuit (limite)',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: Search,
    description: 'IA avec recherche web en temps réel',
    capabilities: ['Recherche', 'Validation', 'Actualités'],
    pricing: 'API payante',
  },
];
