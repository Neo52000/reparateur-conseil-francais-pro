
export interface Creative {
  id: string;
  name: string;
  creative_type: 'image' | 'video' | 'text';
  creative_url?: string;
  creative_data: Record<string, any>;
  ai_generated: boolean;
  performance_score: number;
  status: 'draft' | 'active' | 'archived';
  campaign_id?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreativeTemplate {
  id: string;
  name: string;
  category: string;
  template_data: Record<string, any>;
  preview_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCreativeData {
  name: string;
  creative_type: 'image' | 'video' | 'text';
  creative_url?: string;
  creative_data?: Record<string, any>;
  ai_generated?: boolean;
  campaign_id?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AIGenerationRequest {
  type: 'image' | 'video' | 'text';
  prompt: string;
  style?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  additional_params?: Record<string, any>;
}
