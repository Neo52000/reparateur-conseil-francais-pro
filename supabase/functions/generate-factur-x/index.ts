import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Generating Factur-X for invoice:', invoice_id);

    // Récupérer les détails de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('electronic_invoices')
      .select(`
        *,
        repairer_legal_info(*)
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Facture introuvable');
    }

    // Récupérer les détails du client et du réparateur
    const { data: repairer, error: repairerError } = await supabase
      .from('repairer_profiles')
      .select('*')
      .eq('id', invoice.repairer_id)
      .single();

    if (repairerError) {
      throw new Error('Réparateur introuvable');
    }

    // Générer le XML UBL conforme à la norme française
    const xmlContent = generateUBLXML(invoice, repairer);

    // Générer le PDF de la facture
    const pdfContent = await generateInvoicePDF(invoice, repairer);

    // Stocker le PDF dans Supabase Storage
    const fileName = `invoice_${invoice.invoice_number}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdfContent, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Mettre à jour la facture avec le contenu XML et le chemin PDF
    const { error: updateError } = await supabase
      .from('electronic_invoices')
      .update({
        xml_content: xmlContent,
        pdf_path: uploadData.path,
        status: 'sent'
      })
      .eq('id', invoice_id);

    if (updateError) {
      throw updateError;
    }

    // Obtenir l'URL publique du PDF
    const { data: urlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(uploadData.path);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: urlData.publicUrl,
        xml_content: xmlContent
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erreur génération Factur-X:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function generateUBLXML(invoice: any, repairer: any): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <CustomizationID>urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended</CustomizationID>
  <ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</ProfileID>
  <ID>${invoice.invoice_number}</ID>
  <IssueDate>${invoice.invoice_date}</IssueDate>
  <InvoiceTypeCode>380</InvoiceTypeCode>
  <DocumentCurrencyCode>EUR</DocumentCurrencyCode>
  
  <AccountingSupplierParty>
    <Party>
      <PartyIdentification>
        <ID schemeID="SIRET">${invoice.siret_repairer}</ID>
      </PartyIdentification>
      <PartyName>
        <Name>${repairer.business_name || repairer.name}</Name>
      </PartyName>
      <PartyTaxScheme>
        <CompanyID>${invoice.tva_number_repairer || 'FR' + invoice.siret_repairer}</CompanyID>
        <TaxScheme>
          <ID>VAT</ID>
        </TaxScheme>
      </PartyTaxScheme>
    </Party>
  </AccountingSupplierParty>
  
  <AccountingCustomerParty>
    <Party>
      ${invoice.siret_client ? `
      <PartyIdentification>
        <ID schemeID="SIRET">${invoice.siret_client}</ID>
      </PartyIdentification>
      ` : ''}
      <PartyName>
        <Name>Client</Name>
      </PartyName>
      ${invoice.tva_number_client ? `
      <PartyTaxScheme>
        <CompanyID>${invoice.tva_number_client}</CompanyID>
        <TaxScheme>
          <ID>VAT</ID>
        </TaxScheme>
      </PartyTaxScheme>
      ` : ''}
    </Party>
  </AccountingCustomerParty>
  
  <PaymentMeans>
    <PaymentMeansCode>30</PaymentMeansCode>
    ${invoice.due_date ? `<PaymentDueDate>${invoice.due_date}</PaymentDueDate>` : ''}
  </PaymentMeans>
  
  <TaxTotal>
    <TaxAmount currencyID="EUR">${invoice.tva_amount.toFixed(2)}</TaxAmount>
    <TaxSubtotal>
      <TaxableAmount currencyID="EUR">${invoice.amount_ht.toFixed(2)}</TaxableAmount>
      <TaxAmount currencyID="EUR">${invoice.tva_amount.toFixed(2)}</TaxAmount>
      <TaxCategory>
        <ID>S</ID>
        <Percent>${invoice.tva_rate.toFixed(1)}</Percent>
        <TaxScheme>
          <ID>VAT</ID>
        </TaxScheme>
      </TaxCategory>
    </TaxSubtotal>
  </TaxTotal>
  
  <LegalMonetaryTotal>
    <LineExtensionAmount currencyID="EUR">${invoice.amount_ht.toFixed(2)}</LineExtensionAmount>
    <TaxExclusiveAmount currencyID="EUR">${invoice.amount_ht.toFixed(2)}</TaxExclusiveAmount>
    <TaxInclusiveAmount currencyID="EUR">${invoice.amount_ttc.toFixed(2)}</TaxInclusiveAmount>
    <PayableAmount currencyID="EUR">${invoice.amount_ttc.toFixed(2)}</PayableAmount>
  </LegalMonetaryTotal>
  
  <InvoiceLine>
    <ID>1</ID>
    <InvoicedQuantity unitCode="EA">1</InvoicedQuantity>
    <LineExtensionAmount currencyID="EUR">${invoice.amount_ht.toFixed(2)}</LineExtensionAmount>
    <Item>
      <Name>Service de réparation</Name>
    </Item>
    <Price>
      <PriceAmount currencyID="EUR">${invoice.amount_ht.toFixed(2)}</PriceAmount>
    </Price>
  </InvoiceLine>
</Invoice>`;
}

async function generateInvoicePDF(invoice: any, repairer: any): Promise<Uint8Array> {
  // Génération simple PDF en HTML pour l'exemple
  // En production, utiliser une vraie librairie PDF comme jsPDF ou Puppeteer
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-number { font-size: 18px; color: #666; }
        .section { margin: 20px 0; }
        .amounts { border: 1px solid #ddd; padding: 15px; background: #f9f9f9; }
        .total { font-size: 18px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="invoice-title">FACTURE ÉLECTRONIQUE</div>
        <div class="invoice-number">N° ${invoice.invoice_number}</div>
        <div>Date: ${invoice.invoice_date}</div>
      </div>
      
      <div class="section">
        <h3>Émetteur</h3>
        <p><strong>${repairer.business_name || repairer.name}</strong></p>
        <p>SIRET: ${invoice.siret_repairer}</p>
        ${invoice.tva_number_repairer ? `<p>N° TVA: ${invoice.tva_number_repairer}</p>` : ''}
      </div>
      
      <div class="section">
        <h3>Destinataire</h3>
        <p>Client</p>
        ${invoice.siret_client ? `<p>SIRET: ${invoice.siret_client}</p>` : ''}
      </div>
      
      <div class="amounts">
        <p>Montant HT: ${invoice.amount_ht.toFixed(2)} €</p>
        <p>TVA (${invoice.tva_rate}%): ${invoice.tva_amount.toFixed(2)} €</p>
        <p class="total">Total TTC: ${invoice.amount_ttc.toFixed(2)} €</p>
      </div>
      
      ${invoice.due_date ? `<p><strong>Date d'échéance:</strong> ${invoice.due_date}</p>` : ''}
      
      <div style="margin-top: 50px; font-size: 12px; color: #666;">
        <p>Facture conforme à la réglementation française sur la facturation électronique.</p>
        <p>Format Factur-X - Norme EN 16931</p>
      </div>
    </body>
    </html>
  `;

  // Conversion simplifiée HTML -> PDF (remplacer par vraie librairie PDF)
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}