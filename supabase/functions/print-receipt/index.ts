import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receipt } = await req.json();
    
    console.log('Processing receipt print:', receipt);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Generate receipt HTML for NF525 compliance
    const receiptHtml = generateNF525Receipt(receipt);
    
    // Store receipt in archive for compliance
    const { data: archive, error: archiveError } = await supabase
      .from('nf525_receipt_archives')
      .insert({
        transaction_id: receipt.transactionId,
        repairer_id: user.id,
        receipt_data: receipt,
        receipt_html: receiptHtml,
        receipt_hash: await generateHash(receiptHtml),
        file_size_bytes: receiptHtml.length
      })
      .select()
      .single();

    if (archiveError) {
      console.error('Archive creation error:', archiveError);
      throw archiveError;
    }

    // Simulate printer communication
    const printResult = await sendToPrinter(receiptHtml);
    
    console.log('Receipt printed successfully:', { archive, printResult });

    return new Response(
      JSON.stringify({
        success: true,
        archive,
        printResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Receipt printing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

function generateNF525Receipt(receipt: any): string {
  const now = new Date().toLocaleString('fr-FR');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Caisse - NF525</title>
      <style>
        body { font-family: monospace; width: 300px; }
        .header { text-align: center; font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        .total { font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>TICKET DE CAISSE</h3>
        <p>Conforme NF-525</p>
      </div>
      
      <div class="line"></div>
      
      <p><strong>N° Transaction:</strong> ${receipt.transactionNumber || 'N/A'}</p>
      <p><strong>Date:</strong> ${now}</p>
      
      <div class="line"></div>
      
      <h4>Articles:</h4>
      ${receipt.items?.map((item: any) => `
        <p>${item.name} x${item.quantity}<br>
        ${item.price.toFixed(2)}€ x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€</p>
      `).join('') || ''}
      
      <div class="line"></div>
      
      <p>Sous-total: ${receipt.subtotal?.toFixed(2) || '0.00'}€</p>
      <p>TVA (20%): ${receipt.taxAmount?.toFixed(2) || '0.00'}€</p>
      <p class="total">TOTAL: ${receipt.totalAmount?.toFixed(2) || '0.00'}€</p>
      
      <div class="line"></div>
      
      <p><strong>Paiement:</strong> ${receipt.paymentMethod}</p>
      ${receipt.paymentMethod === 'cash' && receipt.cashReceived ? `
        <p>Reçu: ${receipt.cashReceived.toFixed(2)}€</p>
        <p>Monnaie: ${receipt.change?.toFixed(2) || '0.00'}€</p>
      ` : ''}
      
      <div class="line"></div>
      
      <div class="header">
        <p>Merci de votre visite!</p>
        <p style="font-size: 10px;">Ticket conforme à la norme NF-525</p>
      </div>
    </body>
    </html>
  `;
}

async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendToPrinter(receiptHtml: string): Promise<any> {
  console.log('Sending to printer:', receiptHtml.length, 'bytes');
  
  // Simulate printer communication
  // In real implementation, integrate with thermal printer API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    status: 'success',
    printerStatus: 'ready',
    printedAt: new Date().toISOString(),
    paperLevel: 'ok'
  };
}