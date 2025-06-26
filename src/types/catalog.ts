
export interface DeviceType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
}

export interface DeviceModel {
  id: string;
  device_type_id: string;
  brand_id: string;
  model_name: string;
  model_number?: string;
  release_date?: string;
  screen_size?: number;
  screen_resolution?: string;
  screen_type?: string; // Changé pour accepter n'importe quelle string
  battery_capacity?: number;
  storage_options?: string[];
  colors?: string[];
  operating_system?: string;
  processor?: string;
  ram_gb?: number;
  weight_grams?: number;
  dimensions?: Record<string, number>;
  connectivity?: string[];
  special_features?: string[];
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  // Relations
  device_type?: DeviceType;
  brand?: Brand;
}

export interface RepairCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  created_at: string;
}

export interface RepairType {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  difficulty_level: string; // Changé pour accepter n'importe quelle string
  estimated_time_minutes?: number;
  warranty_days: number;
  is_active: boolean;
  created_at: string;
  // Relations
  category?: RepairCategory;
}

export interface RepairPrice {
  id: string;
  device_model_id: string;
  repair_type_id: string;
  price_eur: number;
  part_price_eur?: number;
  labor_price_eur?: number;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  device_model?: DeviceModel;
  repair_type?: RepairType;
}

export interface SparePart {
  id: string;
  name: string;
  part_number?: string;
  category?: string;
  compatible_models?: string[];
  supplier?: string;
  cost_price?: number;
  selling_price?: number;
  stock_quantity: number;
  min_stock_alert: number;
  quality_grade: 'Original' | 'OEM' | 'Compatible' | 'Reconditionné';
  warranty_days: number;
  is_active: boolean;
  created_at: string;
}

// Types pour les formulaires avec validation
export interface DeviceModelFormData {
  device_type_id: string;
  brand_id: string;
  model_name: string;
  model_number: string;
  release_date: string;
  screen_size: string;
  screen_resolution: string;
  screen_type: string;
  battery_capacity: string;
  operating_system: string;
  is_active: boolean;
}

// Types constants pour validation
export const SCREEN_TYPES = ['LCD', 'OLED', 'AMOLED', 'Super AMOLED', 'IPS', 'E-Ink', 'LED'] as const;
export const DIFFICULTY_LEVELS = ['Facile', 'Moyen', 'Difficile', 'Expert'] as const;

export type ScreenType = typeof SCREEN_TYPES[number];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
