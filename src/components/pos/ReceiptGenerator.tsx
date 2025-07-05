import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail } from 'lucide-react';

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
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  receiptData,
  onPrint,
  onDownloadPDF,
  onSendEmail
}) => {
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

  const downloadPDF = () => {
    // Placeholder pour génération PDF - nécessiterait une librairie comme jsPDF
    const element = document.createElement('a');
    const file = new Blob([generateReceiptHTML()], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `ticket-${receiptData.transactionNumber}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onDownloadPDF();
  };

  return (
    <div className="space-y-4">
      {/* Aperçu du ticket */}
      <div className="bg-white border rounded-lg p-4 max-w-sm mx-auto shadow-sm">
        <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <Button onClick={printReceipt} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        
        <Button onClick={downloadPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </Button>
        
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