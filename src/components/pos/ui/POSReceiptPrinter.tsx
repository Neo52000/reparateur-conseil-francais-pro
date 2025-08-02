import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { 
  Printer,
  FileText,
  Download,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Settings,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Receipt {
  id: string;
  transactionId: string;
  date: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface POSReceiptPrinterProps {
  receipt?: Receipt;
  onPrint?: (receipt: Receipt) => void;
  onEmailSend?: (receipt: Receipt, email: string) => void;
  onSMSSend?: (receipt: Receipt, phone: string) => void;
}

const POSReceiptPrinter: React.FC<POSReceiptPrinterProps> = ({
  receipt,
  onPrint,
  onEmailSend,
  onSMSSend
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [autoPrint, setAutoPrint] = useState(true);
  const [emailOnRequest, setEmailOnRequest] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<'ready' | 'busy' | 'error' | 'offline'>('ready');

  // Données de démonstration de la boutique
  const storeInfo = {
    name: 'PhoneRepair Pro',
    address: '123 Rue de la Réparation\n75001 Paris, France',
    phone: '01 23 45 67 89',
    email: 'contact@phonerepairpro.fr',
    siret: '12345678901234',
    tva: 'FR12345678901'
  };

  const handlePrint = async (receiptData?: Receipt) => {
    if (!receiptData && !receipt) return;

    const targetReceipt = receiptData || receipt!;
    setPrinterStatus('busy');

    try {
      // Print receipt via Supabase function
      const { error } = await supabase.functions.invoke('print-receipt', {
        body: { receipt: targetReceipt }
      });

      if (error) throw error;
      
      onPrint?.(targetReceipt);
      toast.success('Ticket imprimé avec succès');
      setPrinterStatus('ready');
    } catch (error) {
      toast.error('Erreur d\'impression');
      setPrinterStatus('error');
    }
  };

  const handleEmailSend = async (email: string) => {
    if (!receipt) return;

    try {
      onEmailSend?.(receipt, email);
      toast.success(`Ticket envoyé par email à ${email}`);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleDownloadPDF = () => {
    if (!receipt) return;
    
    // Simulation du téléchargement PDF
    toast.success('Ticket téléchargé en PDF');
  };

  const copyReceiptText = () => {
    if (!receipt) return;

    const receiptText = generateReceiptText(receipt);
    navigator.clipboard.writeText(receiptText);
    toast.success('Contenu du ticket copié');
  };

  const generateReceiptText = (receiptData: Receipt) => {
    return `
${storeInfo.name}
${storeInfo.address}
Tél: ${storeInfo.phone}
SIRET: ${storeInfo.siret}

================================
TICKET DE CAISSE
================================

N° Transaction: ${receiptData.transactionId}
Date: ${format(receiptData.date, 'dd/MM/yyyy HH:mm', { locale: fr })}

--------------------------------
ARTICLES
--------------------------------
${receiptData.items.map(item => 
  `${item.name} x${item.quantity}\n  ${item.price.toFixed(2)}€ x ${item.quantity} = ${item.total.toFixed(2)}€`
).join('\n')}

--------------------------------
TOTAUX
--------------------------------
Sous-total: ${receiptData.subtotal.toFixed(2)}€
TVA (20%): ${receiptData.tax.toFixed(2)}€
TOTAL: ${receiptData.total.toFixed(2)}€

--------------------------------
PAIEMENT
--------------------------------
Mode: ${receiptData.paymentMethod}
${receiptData.cashReceived ? `Reçu: ${receiptData.cashReceived.toFixed(2)}€` : ''}
${receiptData.change ? `Rendu: ${receiptData.change.toFixed(2)}€` : ''}

================================
Merci de votre visite !
Garantie: 6 mois sur les réparations
Support: ${storeInfo.email}
================================
    `.trim();
  };

  const getPrinterStatusBadge = () => {
    switch (printerStatus) {
      case 'ready':
        return <Badge className="bg-admin-green text-white"><CheckCircle className="w-3 h-3 mr-1" />Prête</Badge>;
      case 'busy':
        return <Badge className="bg-admin-orange text-white">Impression...</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erreur</Badge>;
      case 'offline':
        return <Badge variant="secondary">Hors ligne</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const renderReceiptPreview = () => {
    if (!receipt) return null;

    return (
      <div className="bg-white text-black p-6 font-mono text-sm max-w-xs mx-auto border">
        <div className="text-center mb-4">
          <div className="font-bold text-lg">{storeInfo.name}</div>
          <div className="whitespace-pre-line text-xs">{storeInfo.address}</div>
          <div className="text-xs">Tél: {storeInfo.phone}</div>
          <div className="text-xs">SIRET: {storeInfo.siret}</div>
        </div>

        <div className="text-center border-t border-b border-dashed py-2 my-4">
          <div className="font-bold">TICKET DE CAISSE</div>
        </div>

        <div className="mb-4">
          <div>N° {receipt.transactionId}</div>
          <div>{format(receipt.date, 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
        </div>

        <div className="border-t border-dashed pt-2 mb-4">
          {receipt.items.map((item, index) => (
            <div key={index} className="mb-1">
              <div className="flex justify-between">
                <span>{item.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{item.price.toFixed(2)}€ x {item.quantity}</span>
                <span>{item.total.toFixed(2)}€</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-2 mb-4">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>{receipt.subtotal.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span>TVA (20%):</span>
            <span>{receipt.tax.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between font-bold border-t border-dashed pt-1">
            <span>TOTAL:</span>
            <span>{receipt.total.toFixed(2)}€</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mb-4">
          <div>Mode: {receipt.paymentMethod}</div>
          {receipt.cashReceived && <div>Reçu: {receipt.cashReceived.toFixed(2)}€</div>}
          {receipt.change && <div>Rendu: {receipt.change.toFixed(2)}€</div>}
        </div>

        <div className="text-center text-xs border-t border-dashed pt-2">
          <div>Merci de votre visite !</div>
          <div>Garantie: 6 mois sur les réparations</div>
          <div>Support: {storeInfo.email}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Statut de l'imprimante */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Imprimante de tickets
            </span>
            {getPrinterStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Paramètres d'impression */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-print">Impression automatique</Label>
                <Switch
                  id="auto-print"
                  checked={autoPrint}
                  onCheckedChange={setAutoPrint}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-request">Proposer envoi par email</Label>
                <Switch
                  id="email-request"
                  checked={emailOnRequest}
                  onCheckedChange={setEmailOnRequest}
                />
              </div>
            </div>

            {/* Actions rapides */}
            {receipt && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePrint()}
                  disabled={printerStatus === 'busy' || printerStatus === 'offline'}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Aperçu
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                
                <Button
                  variant="outline"
                  onClick={copyReceiptText}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'aperçu */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aperçu du ticket</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {renderReceiptPreview()}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => handlePrint()} className="bg-admin-blue hover:bg-admin-blue/90">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSReceiptPrinter;