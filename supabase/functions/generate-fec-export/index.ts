import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FECLine {
  JournalCode: string;
  JournalLib: string;
  EcritureNum: string;
  EcritureDate: string;
  CompteNum: string;
  CompteLib: string;
  CompAuxNum: string;
  CompAuxLib: string;
  PieceRef: string;
  PieceDate: string;
  EcritureLib: string;
  Debit: string;
  Credit: string;
  EcritureLet: string;
  DateLet: string;
  ValidDate: string;
  Montantdevise: string;
  Idevise: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      repairer_id,
      start_date,
      end_date,
      siren,
      format = 'txt',
      separator = '|'
    } = await req.json();

    console.log('Génération FEC pour:', { repairer_id, start_date, end_date, siren });

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les factures de la période
    const { data: invoices, error: invoicesError } = await supabase
      .from('electronic_invoices')
      .select('*')
      .eq('repairer_id', repairer_id)
      .gte('invoice_date', start_date)
      .lte('invoice_date', end_date)
      .order('invoice_date', { ascending: true });

    if (invoicesError) {
      throw new Error(`Erreur récupération factures: ${invoicesError.message}`);
    }

    if (!invoices || invoices.length === 0) {
      throw new Error('Aucune facture trouvée pour la période');
    }

    console.log(`${invoices.length} factures trouvées`);

    // Générer les lignes FEC
    const fecLines: FECLine[] = [];

    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      const invoiceDate = invoice.invoice_date.replace(/-/g, '');
      const ecritureNum = `FAC${invoiceDate}${String(i + 1).padStart(4, '0')}`;

      // Ligne de débit client (411xxx)
      fecLines.push({
        JournalCode: 'VTE',
        JournalLib: 'Journal des ventes',
        EcritureNum: ecritureNum,
        EcritureDate: invoiceDate,
        CompteNum: '411000',
        CompteLib: 'Clients',
        CompAuxNum: invoice.client_id.substring(0, 8),
        CompAuxLib: `Client`,
        PieceRef: invoice.invoice_number,
        PieceDate: invoiceDate,
        EcritureLib: `Facture ${invoice.invoice_number}`,
        Debit: formatAmount(invoice.amount_ttc),
        Credit: '0,00',
        EcritureLet: '',
        DateLet: '',
        ValidDate: invoiceDate,
        Montantdevise: '',
        Idevise: ''
      });

      // Ligne de crédit ventes HT (707xxx)
      fecLines.push({
        JournalCode: 'VTE',
        JournalLib: 'Journal des ventes',
        EcritureNum: ecritureNum,
        EcritureDate: invoiceDate,
        CompteNum: '707000',
        CompteLib: 'Ventes de prestations de services',
        CompAuxNum: '',
        CompAuxLib: '',
        PieceRef: invoice.invoice_number,
        PieceDate: invoiceDate,
        EcritureLib: `Facture ${invoice.invoice_number}`,
        Debit: '0,00',
        Credit: formatAmount(invoice.amount_ht),
        EcritureLet: '',
        DateLet: '',
        ValidDate: invoiceDate,
        Montantdevise: '',
        Idevise: ''
      });

      // Ligne de crédit TVA (445710)
      fecLines.push({
        JournalCode: 'VTE',
        JournalLib: 'Journal des ventes',
        EcritureNum: ecritureNum,
        EcritureDate: invoiceDate,
        CompteNum: '445710',
        CompteLib: 'TVA collectee',
        CompAuxNum: '',
        CompAuxLib: '',
        PieceRef: invoice.invoice_number,
        PieceDate: invoiceDate,
        EcritureLib: `TVA ${invoice.tva_rate}%`,
        Debit: '0,00',
        Credit: formatAmount(invoice.tva_amount),
        EcritureLet: '',
        DateLet: '',
        ValidDate: invoiceDate,
        Montantdevise: '',
        Idevise: ''
      });
    }

    // Convertir en format FEC
    const fecContent = linesToFECFormat(fecLines, separator);
    
    // Générer le nom du fichier
    const fileName = `${siren}_FEC_${end_date.replace(/-/g, '')}.${format}`;
    
    console.log(`FEC généré: ${fecLines.length} lignes`);

    return new Response(
      JSON.stringify({
        success: true,
        content: fecContent,
        file_name: fileName,
        line_count: fecLines.length,
        file_size: new Blob([fecContent]).size
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erreur génération FEC:', error);
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

function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2).replace('.', ',');
}

function linesToFECFormat(lines: FECLine[], separator: string): string {
  const headers = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcritureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise'
  ];

  const headerLine = headers.join(separator);
  const dataLines = lines.map(line =>
    headers.map(header => line[header as keyof FECLine]).join(separator)
  );

  return [headerLine, ...dataLines].join('\n');
}
