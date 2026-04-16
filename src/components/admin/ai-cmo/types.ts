// AI-CMO Module TypeScript Types

export interface AiCmoProfile {
  id: string;
  site_id: string;
  description: string | null;
  website: string | null;
  name_aliases: string[];
  llm_understanding: string | null;
  products: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiCmoCompetitor {
  id: string;
  site_id: string;
  name: string;
  website: string | null;
  weight: number;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface AiCmoQuestion {
  id: string;
  site_id: string;
  prompt: string;
  prompt_type: 'product' | 'expertise';
  target_country: string | null;
  is_active: boolean;
  refresh_interval_seconds: number;
  last_run_at: string | null;
  next_run_at: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface AiCmoPromptRun {
  id: string;
  site_id: string;
  question_id: string | null;
  llm_provider: string;
  llm_model: string;
  brand_mentioned: boolean | null;
  company_domain_rank: number | null;
  top_domain: string | null;
  raw_response: string | null;
  mentioned_pages: string[];
  run_at: string | null;
  created_at: string;
  // Joined field
  question_prompt?: string;
}

export interface AiCmoDashboardStats {
  id: string;
  site_id: string;
  ai_visibility_score: number;
  website_citation_share: number;
  total_runs: number;
  share_of_voice: ShareOfVoiceEntry[];
  computed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShareOfVoiceEntry {
  domain: string;
  count: number;
  percentage: number;
  type: 'you' | 'competitor' | 'other';
}

export interface AiCmoRecommendation {
  id: string;
  site_id: string;
  competitor_domain: string | null;
  prompts_to_analyze: string[];
  why_competitor: string | null;
  why_not_user: string | null;
  what_to_do: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiCmoLlmCost {
  id: string;
  site_id: string;
  model: string;
  call_type: string | null;
  date: string;
  cost: number;
  call_count: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
}

// Form data types for editable sub-tabs
export interface ProfileFormData {
  description: string;
  website: string;
  name_aliases: string;
  llm_understanding: string;
  products: string;
}

export interface CompetitorFormData {
  id?: string;
  name: string;
  website: string;
  weight: number;
}

export interface QuestionFormData {
  id?: string;
  prompt: string;
  prompt_type: 'product' | 'expertise';
  target_country: string;
  refresh_interval_seconds: number;
  is_active: boolean;
}

// Refresh interval options
export const REFRESH_INTERVALS = [
  { label: '1 heure', value: 3600 },
  { label: '6 heures', value: 21600 },
  { label: '12 heures', value: 43200 },
  { label: 'Quotidien', value: 86400 },
  { label: 'Hebdomadaire', value: 604800 },
] as const;

// Default site_id for single-tenant platform
export const DEFAULT_SITE_ID = '00000000-0000-0000-0000-000000000001';
