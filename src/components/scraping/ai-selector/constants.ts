
import { Brain, Zap, Star } from 'lucide-react';
import { APIKeyStatus } from './types';

export const DEFAULT_API_KEY_STATUSES: Record<string, APIKeyStatus> = {
  mistral: 'configured',
  deepseek: 'needs_config',
  openai: 'configured'
};

export const AI_BASE_OPTIONS = [
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: Brain,
    description: 'IA française, rapide et efficace',
    capabilities: ['Classification', 'Nettoyage', 'Géolocalisation'],
    pricing: 'Gratuit (limite)'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: Zap,
    description: 'IA performante pour l\'analyse de données',
    capabilities: ['Classification avancée', 'Enrichissement', 'Validation'],
    pricing: 'API payante'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    icon: Star,
    description: 'IA de référence, très précise',
    capabilities: ['Classification experte', 'Analyse complexe', 'Géocodage'],
    pricing: 'API payante'
  }
];
