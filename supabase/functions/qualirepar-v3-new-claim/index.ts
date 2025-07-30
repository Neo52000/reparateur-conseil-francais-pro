import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewClaimRequest {
  RepairDate: string;
  PurchaseOrderByCustomer?: string;
  RepairPlaceID: string;
  RepairerId: string;
  Product: {
    ProductID: string;
    BrandID: string;
    ProductIdentificationNumber: string;
    RepairTypeCode?: string;
    IrisCode?: string;
    CommercialReference?: string;
    PartnerProduct?: string;
  };
  SpareParts?: {
    NewSparePartsAmount?: number;
    SecondHandSparePartsAmount?: number;
    PiecSparePartsAmount?: number;
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

interface NewClaimResponse {
  ReimbursementClaimID: string;
  RequestStatus: string;
  RepairDate: string;
  PurchaseOrderByCustomer?: string;
  AttachedFiles: any[];
  creationDate: string;
}

function validateToken(authHeader: string | null): any {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

// Validation avancée côté serveur
function validateClaimData(data: NewClaimRequest): string[] {
  const errors: string[] = [];

  // 1. Validation des dates
  const repairDate = new Date(data.RepairDate);
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  if (repairDate > now) {
    errors.push('La date de réparation ne peut pas être dans le futur');
  }
  if (repairDate < sixMonthsAgo) {
    errors.push('La date de réparation est trop ancienne (plus de 6 mois)');
  }

  // 2. Validation des montants
  if (!data.Bill.TotalAmountInclVAT || data.Bill.TotalAmountInclVAT.amount <= 0) {
    errors.push('Le montant total TTC doit être supérieur à 0');
  }
  if (!data.Bill.AmountCovered || data.Bill.AmountCovered.amount < 0) {
    errors.push('Le montant couvert ne peut pas être négatif');
  }
  if (data.Bill.AmountCovered.amount > data.Bill.TotalAmountInclVAT.amount) {
    errors.push('Le montant couvert ne peut pas être supérieur au montant total');
  }

  // 3. Validation du réparateur
  if (!data.RepairerId || data.RepairerId.length < 5) {
    errors.push('Identifiant réparateur invalide');
  }

  // 4. Validation du produit
  if (!data.Product.ProductID) {
    errors.push('Identifiant produit manquant');
  }
  if (!data.Product.BrandID) {
    errors.push('Identifiant marque manquant');
  }
  if (!data.Product.ProductIdentificationNumber) {
    errors.push('Numéro de série produit manquant');
  }

  // 5. Validation du code IRIS
  if (data.Product.IrisCode && !/^[0-9]{4}$/.test(data.Product.IrisCode)) {
    errors.push('Le code IRIS doit contenir exactement 4 chiffres');
  }

  // 6. Validation des données client
  if (!data.Customer.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Customer.Email)) {
    errors.push('Email client invalide');
  }
  if (!data.Customer.PostalCode || !/^[0-9]{5}$/.test(data.Customer.PostalCode)) {
    errors.push('Code postal client invalide');
  }
  if (!data.Customer.FirstName || data.Customer.FirstName.length < 2) {
    errors.push('Prénom client requis (minimum 2 caractères)');
  }
  if (!data.Customer.LastName || data.Customer.LastName.length < 2) {
    errors.push('Nom client requis (minimum 2 caractères)');
  }

  // 7. Validation de la devise
  if (data.Bill.TotalAmountInclVAT.currency !== 'EUR') {
    errors.push('La devise doit être EUR');
  }

  // 8. Validation des montants limites QualiRépar
  if (data.Bill.TotalAmountInclVAT.amount > 1000) {
    errors.push('Le montant de réparation semble trop élevé pour QualiRépar');
  }
  if (data.Bill.AmountCovered.amount > 50) {
    errors.push('Le bonus demandé semble trop élevé pour QualiRépar');
  }

  return errors;
}

function validateRepairDate(repairDate: string): string | null {
  const date = new Date(repairDate);
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  if (date > now) {
    return 'La date de réparation ne peut pas être dans le futur';
  }
  
  if (date < sixMonthsAgo) {
    return 'La date de réparation ne peut pas être antérieure de plus de 6 mois';
  }
  
  return null;
}

function validateRepairCode(product: any): string | null {
  if (!product.RepairTypeCode && !product.IrisCode) {
    return "anyOf : 'RepairTypeCode' is a required property, 'IrisCode' is a required property";
  }
  return null;
}

function validateUnknownBrand(product: any): string | null {
  if (product.BrandID === "0000" && !product.PartnerProduct) {
    return 'PartnerProduct is required when BrandID is 0000 (unknown brand)';
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    const tokenData = validateToken(authHeader);
    
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claimData: NewClaimRequest = await req.json();
    console.log('📝 New claim request from user:', tokenData.username);

    // ============= VALIDATIONS v3 RENFORCÉES =============
    
    // 1. Validation complète des données
    const validationErrors = validateClaimData(claimData);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: '400 : DONNEES_INVALIDES', 
          message: 'Données de la demande invalides',
          details: validationErrors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 2. Validate repair date (maintenu pour compatibilité)
    const dateError = validateRepairDate(claimData.RepairDate);
    if (dateError) {
      return new Response(
        JSON.stringify({ error: '400 : DATE_REPARATION_INVALIDE', message: dateError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validate repair codes
    const repairCodeError = validateRepairCode(claimData.Product);
    if (repairCodeError) {
      return new Response(
        JSON.stringify({ error: '400 : ERREUR_DE_PAYLOAD', message: repairCodeError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate unknown brand
    const brandError = validateUnknownBrand(claimData.Product);
    if (brandError) {
      return new Response(
        JSON.stringify({ error: '400 : MARQUE_INCONNUE_INVALIDE', message: brandError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check for duplicate serial number
    if (claimData.Product.ProductIdentificationNumber) {
      const { data: existingClaim } = await supabase
        .from('qualirepar_dossiers')
        .select('id')
        .eq('product_serial_number', claimData.Product.ProductIdentificationNumber)
        .neq('status', 'draft')
        .limit(1);
      
      if (existingClaim && existingClaim.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: '400 : NUMERO_SERIE_DUPLIQUE', 
            message: '00 : Contrôles automatisés (Une facture portant le même numéro a déjà fait l\'objet d\'un remboursement)'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate unique ReimbursementClaimID
    const reimbursementClaimId = `${claimData.RepairerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Map v3 data to internal structure
    const internalDossier = {
      repairer_id: tokenData.userId,
      
      // Client mapping
      client_title: claimData.Customer.Title,
      client_first_name: claimData.Customer.FirstName,
      client_last_name: claimData.Customer.LastName,
      client_email: claimData.Customer.Email,
      client_phone: claimData.Customer.PhoneNumber,
      client_address: claimData.Customer.StreetLine1,
      client_postal_code: claimData.Customer.PostalCode,
      client_city: claimData.Customer.City,
      client_country: claimData.Customer.Country,
      
      // Product mapping
      product_id: claimData.Product.ProductID,
      product_brand_id: claimData.Product.BrandID,
      product_serial_number: claimData.Product.ProductIdentificationNumber,
      product_commercial_reference: claimData.Product.CommercialReference,
      repair_type_code: claimData.Product.RepairTypeCode,
      iris_code: claimData.Product.IrisCode,
      
      // Repair info
      repair_place_id: claimData.RepairPlaceID,
      repair_date: claimData.RepairDate,
      repair_cost: claimData.Bill.TotalAmountInclVAT.amount,
      requested_bonus_amount: claimData.Bill.AmountCovered.amount,
      
      // Spare parts
      new_spare_parts_amount: claimData.SpareParts?.NewSparePartsAmount || 0,
      second_hand_spare_parts_amount: claimData.SpareParts?.SecondHandSparePartsAmount || 0,
      piec_spare_parts_amount: claimData.SpareParts?.PiecSparePartsAmount || 0,
      spare_parts_cost: claimData.Bill.SparePartsCost?.amount || 0,
      
      // API v3 fields
      reimbursement_claim_id: reimbursementClaimId,
      purchase_order_by_customer: claimData.PurchaseOrderByCustomer,
      v3_request_status: 'En cours de création',
      status: 'metadata_complete',
      api_status: 'created',
      wizard_step: 1,
      is_api_compliant: true
    };

    // Create the dossier in database
    const { data: newDossier, error: createError } = await supabase
      .from('qualirepar_dossiers')
      .insert(internalDossier)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating dossier:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create claim', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log API call
    await supabase
      .from('qualirepar_api_logs')
      .insert({
        endpoint: '/reimbursement-claims/new_claim',
        method: 'POST',
        user_id: tokenData.userId,
        request_data: claimData,
        response_data: { reimbursementClaimId },
        status_code: 200,
        execution_time_ms: 0
      });

    const response: NewClaimResponse = {
      ReimbursementClaimID: reimbursementClaimId,
      RequestStatus: 'En cours de création',
      RepairDate: claimData.RepairDate,
      PurchaseOrderByCustomer: claimData.PurchaseOrderByCustomer,
      AttachedFiles: [],
      creationDate: new Date().toISOString()
    };

    console.log('✅ Claim created successfully:', reimbursementClaimId);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 New claim error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});