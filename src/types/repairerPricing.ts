
import type { RepairPrice } from '@/types/catalog';

export interface RepairerCustomPrice {
  id: string;
  repairer_id: string;
  repair_price_id: string;
  custom_price_eur: number;
  custom_part_price_eur?: number;
  custom_labor_price_eur?: number;
  margin_percentage?: number;
  price_type?: 'fixed' | 'starting_from';
  is_starting_price?: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  repair_price?: RepairPrice;
}

export interface CreateCustomPriceData {
  repair_price_id: string;
  custom_price_eur: number;
  custom_part_price_eur?: number;
  custom_labor_price_eur?: number;
  margin_percentage?: number;
  price_type?: 'fixed' | 'starting_from';
  is_starting_price?: boolean;
  is_active: boolean;
  notes?: string;
}

export interface UpdateCustomPriceData {
  custom_price_eur?: number;
  custom_part_price_eur?: number;
  custom_labor_price_eur?: number;
  margin_percentage?: number;
  price_type?: 'fixed' | 'starting_from';
  is_starting_price?: boolean;
  is_active?: boolean;
  notes?: string;
}
