
export interface AISelectorProps {
  selectedAI: string;
  onAIChange: (ai: string) => void;
  onApiKeyChange: (apiKey: string) => void;
}

export interface AIOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  capabilities: string[];
  pricing: string;
  status: 'configured' | 'needs_config';
}

export type APIKeyStatus = 'configured' | 'needs_config';
