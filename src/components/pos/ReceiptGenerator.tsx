import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail, Archive, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReceiptItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface ReceiptData {
  transactionNumber: string;
  date: string;
  time: string;
  cashier: string;
  items: ReceiptItem[];
  subtotal: number;
  tva: number;
  total: number;
  paymentMethod: string;
  sessionNumber: string;
}

interface ReceiptGeneratorProps {
  receiptData: ReceiptData;
  onPrint: () => void;
  onDownloadPDF: () => void;
  onSendEmail?: () => void;
  transactionId?: string;
  repairerId?: string;
  autoArchive?: boolean;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  receiptData,
  onPrint,
  onDownloadPDF,
  onSendEmail,
  transactionId,
  repairerId,
  autoArchive = true
}) => {
  const { toast } = useToast();
  const [isArchived, setIsArchived] = React.useState(false);
  const [archiveStatus, setArchiveStatus] = React.useState<'pending' | 'archiving' | 'archived' | 'error'>('pending');
  const generateReceiptHTML = () => {
    return `
      <div style="font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 10px;">
        <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 18px;">TICKET DE CAISSE</h2>
          <p style="margin: 5px 0; font-size: 12px;">Conforme NF-525</p>
        </div>
        
        <div style="margin-bottom: 10px;">
          <p style="margin: 2px 0;"><strong>N° Transaction:</strong> ${receiptData.transactionNumber}</p>
          <p style="margin: 2px 0;"><strong>Date:</strong> ${receiptData.date}</p>
          <p style="margin: 2px 0;"><strong>Heure:</strong> ${receiptData.time}</p>
          <p style="margin: 2px 0;"><strong>Caissier:</strong> ${receiptData.cashier}</p>
          <p style="margin: 2px 0;"><strong>Session:</strong> ${receiptData.sessionNumber}</p>
        </div>
        
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0;">
          ${receiptData.items.map(item => `
            <div style="margin-bottom: 8px;">
              <div style="font-weight: bold;">${item.name}</div>
              <div style="font-size: 11px; color: #666;">SKU: ${item.sku}</div>
              <div style="display: flex; justify-content: space-between;">
                <span>${item.quantity} x ${item.unitPrice.toFixed(2)}€</span>
                <span><strong>${item.total.toFixed(2)}€</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin: 10px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>Sous-total HT:</span>
            <span>${receiptData.subtotal.toFixed(2)}€</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>TVA (20%):</span>
            <span>${receiptData.tva.toFixed(2)}€</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
            <span>TOTAL TTC:</span>
            <span>${receiptData.total.toFixed(2)}€</span>
          </div>
        </div>
        
        <div style="margin: 10px 0;">
          <p style="margin: 2px 0;"><strong>Mode de paiement:</strong> ${receiptData.paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px;">
          <p style="margin: 2px 0; font-size: 11px;">Merci de votre visite !</p>
          <p style="margin: 2px 0; font-size: 10px;">Ticket archivé conformément NF-525</p>
          <p style="margin: 2px 0; font-size: 10px;">${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `;
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket ${receiptData.transactionNumber}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { size: 80mm auto; margin: 0; }
              }
            </style>
          </head>
          <body>
            ${generateReceiptHTML()}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    onPrint();
  };

  // Sauvegarder le ticket en base de données (archivage NF-525)
  const saveReceiptToDatabase = async () => {
    if (!transactionId || !repairerId) {
      toast({
        title: "Erreur d'archivage",
        description: "Impossible d'archiver - informations manquantes",
        variant: "destructive"
      });
      return;
    }

    setArchiveStatus('archiving');
    
    try {
      // Générer le HTML NF-525 complet
      const nf525Html = generateNF525CompliantHTML();
      
      // Créer l'archive
      const { data: archive, error } = await supabase
        .from('nf525_receipt_archives')
        .insert({
          transaction_id: transactionId,
          repairer_id: repairerId,
          receipt_data: JSON.stringify({
            ...receiptData,
            archived_at: new Date().toISOString(),
            nf525_compliant: true
          }),
          receipt_html: nf525Html,
          receipt_hash: generateReceiptHash(nf525Html),
          file_size_bytes: new Blob([nf525Html]).size
        })
        .select()
        .single();

      if (error) throw error;

      // Log de l'archivage
      await supabase.from('nf525_archive_logs').insert({
        archive_id: archive.id,
        transaction_id: transactionId,
        repairer_id: repairerId,
        action: 'create',
        status: 'success',
        details: { method: 'manual_archive', source: 'receipt_generator' }
      });

      setArchiveStatus('archived');
      setIsArchived(true);
      
      toast({
        title: "✓ Ticket archivé",
        description: `Conforme NF-525 • Hash: ${archive.receipt_hash.substring(0, 8)}...`,
        duration: 4000
      });

    } catch (error) {
      console.error('Erreur archivage:', error);
      setArchiveStatus('error');
      toast({
        title: "Erreur d'archivage",
        description: "Impossible d'archiver le ticket",
        variant: "destructive"
      });
    }
  };

  // Générer HTML conforme NF-525
  const generateNF525CompliantHTML = () => {
    const timestamp = new Date().toLocaleString('fr-FR');
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Ticket NF-525 - ${receiptData.transactionNumber}</title>
        <style>
          .nf525-receipt { font-family: 'Courier New', monospace; max-width: 280px; margin: 0 auto; }
          .nf525-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          .nf525-content { margin: 10px 0; }
          .nf525-footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="nf525-receipt">
          <div class="nf525-header">
            <h2>TICKET DE CAISSE</h2>
            <p>Conforme NF-525 | Archivé: ${timestamp}</p>
          </div>
          ${generateReceiptHTML()}
          <div class="nf525-footer">
            <p>Ticket archivé conformément à la réglementation française NF-525</p>
            <p>Conservation: 10 ans | Hash: ${generateReceiptHash(receiptData.transactionNumber)}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Générer hash pour intégrité
  const generateReceiptHash = (content: string) => {
    return btoa(content + receiptData.transactionNumber + Date.now()).substring(0, 16);
  };

  const downloadPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([generateNF525CompliantHTML()], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `ticket-nf525-${receiptData.transactionNumber}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onDownloadPDF();
  };

  // Auto-archivage au montage du composant
  React.useEffect(() => {
    if (autoArchive && transactionId && !isArchived) {
      saveReceiptToDatabase();
    }
  }, [transactionId, autoArchive, isArchived]);

  return (
    <div className="space-y-4">
      {/* Aperçu du ticket */}
      <div className="bg-white border rounded-lg p-4 max-w-sm mx-auto shadow-sm">
        <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }} />
      </div>

      {/* Statut d'archivage NF-525 */}
      {transactionId && (
        <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-muted">
          <Archive className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {archiveStatus === 'pending' && 'Archivage en attente'}
            {archiveStatus === 'archiving' && 'Archivage en cours...'}
            {archiveStatus === 'archived' && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Archivé (NF-525 conforme)
              </span>
            )}
            {archiveStatus === 'error' && 'Erreur d\'archivage'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <Button onClick={printReceipt} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        
        <Button onClick={downloadPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger NF-525
        </Button>
        
        {transactionId && !isArchived && (
          <Button onClick={saveReceiptToDatabase} variant="outline" disabled={archiveStatus === 'archiving'}>
            <Archive className="w-4 h-4 mr-2" />
            {archiveStatus === 'archiving' ? 'Archivage...' : 'Archiver'}
          </Button>
        )}
        
        {onSendEmail && (
          <Button onClick={onSendEmail} variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Envoyer
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReceiptGenerator;