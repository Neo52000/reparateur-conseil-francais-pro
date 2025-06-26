
export interface RepairerCatalogPreference {
  id: string;
  repairer_id: string;
  entity_type: 'brand' | 'device_model' | 'repair_type';
  entity_id: string;
  is_active: boolean;
  default_margin_percentage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RepairerBrandSetting {
  id: string;
  repairer_id: string;
  brand_id: string;
  is_active: boolean;
  default_margin_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: 'brand' | 'device_model' | 'repair_type';
  brand?: any;
  device_model?: any;
  repair_type?: any;
  base_price?: number;
  custom_price?: number;
  price_type?: 'fixed' | 'starting_from';
  is_active: boolean;
  margin_percentage?: number;
  has_custom_price: boolean;
}

export interface CatalogTreeNode {
  id: string;
  name: string;
  type: 'brand' | 'device_model' | 'repair_type';
  is_active: boolean;
  children?: CatalogTreeNode[];
  prices?: any[];
  custom_price?: any;
  margin_percentage?: number;
}
