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

// ============= API v3 TYPES =============

// API v3 Authentication
export interface QualiReparV3AuthResponse {
  AccessToken: string;
  ExpiresIn: number;
  AllowedRepairer: string[];
  isIntermediary: boolean;
}

// API v3 New Claim Request
export interface QualiReparV3NewClaimRequest {
  RepairDate: string; // YYYY-MM-DD
  PurchaseOrderByCustomer?: string; // free field
  RepairPlaceID: string; // "2XXXXXX" or "2000000" for home repair
  RepairerId: string; // "2XXXXXX"
  Product: {
    ProductID: string;
    BrandID: string;
    ProductIdentificationNumber: string; // Serial number
    RepairTypeCode?: string; // Either this or IrisCode required
    IrisCode?: string; // Either this or RepairTypeCode required
    CommercialReference?: string;
    PartnerProduct?: string; // Required if BrandID is "0000"
  };
  SpareParts?: {
    NewSparePartsAmount?: number;
    SecondHandSparePartsAmount?: number;
    PiecSparePartsAmount?: number; // PIEC parts
  };
  Customer: {
    Title: string;
    LastName: string;
    FirstName: string;
    Email: string;
    PhoneNumber: string;
    StreetLine1: string;
    PostalCode: string;
    City: string;
    Country: string;
  };
  Bill: {
    SparePartsCost?: {
      amount: number;
      currency: string;
    };
    TotalAmountInclVAT: {
      amount: number;
      currency: string;
    };
    AmountCovered: {
      amount: number;
      currency: string;
    };
  };
}

// API v3 New Claim Response
export interface QualiReparV3NewClaimResponse {
  ReimbursementClaimID: string;
  RequestStatus: string;
  RepairDate: string;
  PurchaseOrderByCustomer?: string;
  AttachedFiles: any[];
  creationDate: string;
}

// API v3 Upload File Request
export interface QualiReparV3UploadRequest {
  FileName: string;
  FileType: 'serial_tag' | 'invoice' | 'device_picture' | 'claim_request';
  FileSizeInMB: number;
}

// API v3 Upload File Response
export interface QualiReparV3UploadResponse {
  url: string;
}

// API v3 Confirm Claim Response
export interface QualiReparV3ConfirmResponse {
  RequestStatus: string;
  SapServiceOrder: string;
}

// API v3 Claim Status
export type QualiReparV3Status = 
  | 'En cours de création'
  | 'Annulé'
  | 'Envoyé, en cours vérification'
  | 'Approuvé, en cours rembourst'
  | 'Remboursement effectué'
  | 'Rejeté';

// API v3 Rejection Reasons
export type QualiReparV3RejectReason = 
  | '00 : Contrôles automatisés'
  | '01 : SIRET ou RCS non présent'
  | '02 : Panne non éligible'
  | '03 : Consommateur professionnel'
  | '05 : Doublon demande traitée'
  | '06 : Bonus incorrect'
  | '07 : Impossible de lire la facture'
  | '08 : Le bonus est absent de la facture'
  | '09 : Le bonus n\'est pas déduit du montant total'
  | '10 : Suspicion de fraude'
  | '11 : Suspicion fraude : appel conso réparation inexistante'
  | '12 : Suspicion de fraude : Consommateur injoignable'
  | '13 : Le document en PJ n\'est pas une facture'
  | '14 : PIEC (manque de consentement du consommateur'
  | '15 : Plaque signalétique du téléphone portable manquant';

// ============= INTERNAL TYPES (with backward compatibility) =============

export interface QualiReparDossier {
  id: string;
  dossier_number: string;
  repairer_id: string;
  repair_order_id?: string;
  pos_transaction_id?: string;
  
  // Client information (v3 compatible with backward compatibility)
  client_title?: string; // v3: Title
  client_first_name?: string; // v3: FirstName
  client_last_name?: string; // v3: LastName
  client_name?: string; // Legacy field (computed from first_name + last_name)
  client_email: string; // v3: Email
  client_phone?: string; // v3: PhoneNumber
  client_address: string; // v3: StreetLine1
  client_postal_code: string; // v3: PostalCode
  client_city: string; // v3: City
  client_country?: string; // v3: Country (default: FR)
  
  // Product information (v3 compatible)
  product_id?: string; // v3: ProductID
  product_category: string;
  product_brand: string;
  product_brand_id?: string; // v3: BrandID
  product_model: string;
  product_serial_number?: string; // v3: ProductIdentificationNumber
  product_commercial_reference?: string; // v3: CommercialReference
  repair_type_code?: string; // v3: RepairTypeCode
  iris_code?: string; // v3: IrisCode
  
  // Repair location (v3)
  repair_place_id?: string; // v3: RepairPlaceID
  
  // Spare parts (v3 compatible)
  new_spare_parts_amount?: number;
  second_hand_spare_parts_amount?: number;
  piec_spare_parts_amount?: number;
  spare_parts_cost?: number;
  
  // Repair details
  repair_description: string;
  repair_cost: number; // v3: Bill.TotalAmountInclVAT.amount
  repair_date: string; // v3: RepairDate
  
  // Bonus information
  eligibility_rule_id?: string;
  requested_bonus_amount: number; // v3: Bill.AmountCovered.amount
  eco_organism: string;
  
  // Status and tracking (v3 compatible with legacy)
  status: 'draft' | 'metadata_complete' | 'documents_uploaded' | 'ready_to_submit' | 'submitted' | 'processing' | 'approved' | 'paid' | 'rejected';
  v3_request_status?: QualiReparV3Status; // v3: RequestStatus
  submission_date?: string;
  processing_date?: string;
  payment_date?: string;
  rejection_reason?: string;
  v3_reject_reason?: QualiReparV3RejectReason;
  
  // API v3 Integration (with legacy support)
  reimbursement_claim_id?: string; // v3: ReimbursementClaimID
  temporary_claim_id?: string; // Legacy field for backward compatibility
  official_claim_id?: string; // Legacy field
  sap_service_order?: string; // v3: SapServiceOrder
  purchase_order_by_customer?: string; // v3: PurchaseOrderByCustomer
  api_upload_urls?: any;
  document_types_uploaded?: string[];
  api_status?: string;
  api_response_data?: any;
  wizard_step?: number;
  is_api_compliant?: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface QualiReparDocument {
  id: string;
  dossier_id: string;
  // v3 official document types (with legacy support)
  document_type: 'serial_tag' | 'invoice' | 'device_picture' | 'claim_request' | 'FACTURE' | 'BON_DEPOT' | 'SERIALTAG' | 'PHOTO_PRODUIT' | 'JUSTIFICATIF_COMPLEMENTAIRE';
  official_document_type?: string; // For v3 compatibility
  file_name: string;
  file_path: string;
  file_size: number;
  file_size_mb?: number; // v3: FileSizeInMB
  mime_type: string;
  upload_url?: string; // v3: from upload-file endpoint
  upload_status?: 'pending' | 'url_generated' | 'uploaded' | 'completed' | 'confirmed';
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
  
  // Informations client (compatible v3)
  clientName?: string; // Legacy field
  clientTitle?: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientCountry?: string;
  
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

// Helper type for complete backward compatibility
export type LegacyQualiReparDossier = QualiReparDossier & {
  // Ensure all legacy fields are available
  client_name: string;
  temporary_claim_id: string;
};