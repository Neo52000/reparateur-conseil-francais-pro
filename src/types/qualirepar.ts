export interface QualiReparEligibilityRule {
  id: string;
  product_category: string;
  brand?: string;
  model?: string;
  min_repair_cost?: number;
  max_bonus_amount: number;
  eco_organism: string;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface QualiReparDossier {
  id: string;
  dossier_number: string;
  repairer_id: string;
  repair_order_id?: string;
  pos_transaction_id?: string;
  
  // Informations client
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  
  // Informations produit
  product_category: string;
  product_brand: string;
  product_model: string;
  product_serial_number?: string;
  
  // Détails de la réparation
  repair_description: string;
  repair_cost: number;
  repair_date: string;
  
  // Informations bonus
  eligibility_rule_id?: string;
  requested_bonus_amount: number;
  eco_organism: string;
  
  // Statut et suivi
  status: 'draft' | 'ready_to_submit' | 'submitted' | 'processing' | 'approved' | 'paid' | 'rejected';
  submission_date?: string;
  processing_date?: string;
  payment_date?: string;
  rejection_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface QualiReparDocument {
  id: string;
  dossier_id: string;
  document_type: 'invoice' | 'proof_of_eligibility' | 'device_photo' | 'repair_report' | 'client_signature';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  ocr_data?: any;
  is_validated: boolean;
  validation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QualiReparSubmission {
  id: string;
  dossier_id: string;
  submission_method: 'email' | 'api' | 'manual';
  recipient_email?: string;
  api_endpoint?: string;
  submission_data: any;
  response_data?: any;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
  tracking_reference?: string;
  external_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface QualiReparReimbursement {
  id: string;
  dossier_id: string;
  submission_id?: string;
  approved_amount: number;
  payment_method?: 'bank_transfer' | 'check' | 'credit_note';
  payment_reference?: string;
  payment_date?: string;
  approval_date: string;
  processing_delay_days?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EligibilityCheckResult {
  isEligible: boolean;
  rule?: QualiReparEligibilityRule;
  maxBonusAmount?: number;
  ecoOrganism?: string;
  reason?: string;
}

export interface DossierCreationData {
  // Données de réparation source
  repairOrderId?: string;
  posTransactionId?: string;
  
  // Informations client
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  
  // Informations produit
  productCategory: string;
  productBrand: string;
  productModel: string;
  productSerialNumber?: string;
  
  // Détails réparation
  repairDescription: string;
  repairCost: number;
  repairDate: string;
  
  // Bonus demandé
  requestedBonusAmount: number;
}