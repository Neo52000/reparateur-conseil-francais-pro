import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download, 
  Mail, 
  Phone, 
  Edit,
  Save,
  Printer
} from 'lucide-react';
import { RepairOrder } from '@/hooks/useRepairManagement';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface QuoteGeneratorProps {
  repairOrder: RepairOrder;
  onQuoteUpdate?: (quoteData: any) => void;
}

interface QuoteData {
  diagnostic: string;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  estimated_duration: string;
  warranty_duration: string;
  terms_conditions: string;
  notes: string;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ 
  repairOrder, 
  onQuoteUpdate 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData>({
    diagnostic: repairOrder.device?.initial_diagnosis || '',
    labor_cost: 0,
    parts_cost: 0,
    total_cost: repairOrder.quote_amount || 0,
    estimated_duration: '24-48h',
    warranty_duration: '3 mois',
    terms_conditions: 'Devis valable 30 jours. Paiement à la réparation. Garantie 3 mois sur la réparation.',
    notes: ''
  });

  const handleInputChange = (field: keyof QuoteData, value: string | number) => {
    const newData = { ...quoteData, [field]: value };
    
    // Recalcul automatique du total
    if (field === 'labor_cost' || field === 'parts_cost') {
      newData.total_cost = newData.labor_cost + newData.parts_cost;
    }
    
    setQuoteData(newData);
  };

  const saveQuote = () => {
    setIsEditing(false);
    onQuoteUpdate?.(quoteData);
    toast({
      title: "Devis sauvegardé",
      description: "Les modifications ont été enregistrées."
    });
  };

  const generateQuoteHTML = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
        <!-- En-tête -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px;">
          <div>
            <h1 style="color: #3B82F6; font-size: 28px; margin: 0; font-weight: bold;">DEVIS DE RÉPARATION</h1>
            <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Document officiel</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">N° ${repairOrder.order_number}</p>
            <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 14px;">Date: ${currentDate}</p>
          </div>
        </div>

        <!-- Informations client -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">INFORMATIONS CLIENT</h3>
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
              <p style="margin: 0 0 8px 0;"><strong>Nom:</strong> ${repairOrder.device?.customer_name || 'Non renseigné'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Téléphone:</strong> ${repairOrder.device?.customer_phone || 'Non renseigné'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${repairOrder.device?.customer_email || 'Non renseigné'}</p>
            </div>
          </div>
          
          <div>
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">APPAREIL</h3>
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
              <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${repairOrder.device?.device_type_id || 'Non renseigné'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Marque:</strong> ${repairOrder.device?.brand_id || 'Non renseigné'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Modèle:</strong> ${repairOrder.device?.device_model_id || 'Non renseigné'}</p>
              <p style="margin: 0;"><strong>IMEI/Série:</strong> ${repairOrder.device?.imei_serial || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        <!-- Diagnostic et réparation -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">DIAGNOSTIC ET RÉPARATION</h3>
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0 0 10px 0;"><strong>Problème identifié:</strong></p>
            <p style="margin: 0; line-height: 1.5;">${quoteData.diagnostic}</p>
          </div>
        </div>

        <!-- Détail des coûts -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">DÉTAIL DES COÛTS</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #F3F4F6;">
                <th style="padding: 15px; text-align: left; font-weight: bold; color: #374151;">Description</th>
                <th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 15px;">Main d'œuvre</td>
                <td style="padding: 15px; text-align: right;">${quoteData.labor_cost.toFixed(2)} €</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 15px;">Pièces détachées</td>
                <td style="padding: 15px; text-align: right;">${quoteData.parts_cost.toFixed(2)} €</td>
              </tr>
              <tr style="background: #F9FAFB; font-weight: bold; font-size: 18px;">
                <td style="padding: 15px;">TOTAL TTC</td>
                <td style="padding: 15px; text-align: right; color: #3B82F6;">${quoteData.total_cost.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Informations complémentaires -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">DÉLAI ESTIMÉ</h3>
            <p style="margin: 0; background: #EEF2FF; padding: 10px; border-radius: 6px; color: #3730A3; font-weight: bold;">
              ${quoteData.estimated_duration}
            </p>
          </div>
          <div>
            <h3 style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">GARANTIE</h3>
            <p style="margin: 0; background: #F0FDF4; padding: 10px; border-radius: 6px; color: #166534; font-weight: bold;">
              ${quoteData.warranty_duration}
            </p>
          </div>
        </div>

        <!-- Conditions -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">CONDITIONS GÉNÉRALES</h3>
          <p style="font-size: 12px; line-height: 1.5; color: #6B7280; background: #F9FAFB; padding: 15px; border-radius: 6px; margin: 0;">
            ${quoteData.terms_conditions}
          </p>
        </div>

        <!-- Signatures -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 30px;">
          <div>
            <p style="font-weight: bold; margin: 0 0 30px 0;">Signature du réparateur</p>
            <div style="border-bottom: 1px solid #D1D5DB; height: 40px;"></div>
          </div>
          <div>
            <p style="font-weight: bold; margin: 0 0 30px 0;">Signature du client (pour acceptation)</p>
            <div style="border-bottom: 1px solid #D1D5DB; height: 40px;"></div>
          </div>
        </div>
      </div>
    `;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Créer un élément temporaire avec le HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateQuoteHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Générer le canvas à partir du HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Créer le PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Télécharger le PDF
      pdf.save(`Devis_${repairOrder.order_number}_${new Date().toISOString().split('T')[0]}.pdf`);

      // Nettoyer
      document.body.removeChild(tempDiv);

      toast({
        title: "PDF généré",
        description: "Le devis PDF a été téléchargé avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendByEmail = async () => {
    if (!repairOrder.device?.customer_email) {
      toast({
        title: "Email manquant",
        description: "Aucune adresse email client disponible.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Générer le PDF en base64
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateQuoteHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      document.body.removeChild(tempDiv);

      // Envoyer via l'edge function
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairOrderId: repairOrder.id,
          recipientEmail: repairOrder.device.customer_email,
          pdfBase64,
          sendMethod: 'email',
          quoteName: `Devis_${repairOrder.order_number}`
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: "Email envoyé", description: "Le devis a été envoyé par email." });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendBySMS = () => {
    toast({
      title: "Fonctionnalité à venir", 
      description: "L'envoi par SMS sera bientôt disponible."
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Générateur de Devis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {repairOrder.order_number}
            </Badge>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? saveQuote() : setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulaire d'édition */}
        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="diagnostic">Diagnostic</Label>
              <Textarea
                id="diagnostic"
                value={quoteData.diagnostic}
                onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                placeholder="Description du problème et de la réparation"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes complémentaires</Label>
              <Textarea
                id="notes"
                value={quoteData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notes internes ou commentaires"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor_cost">Main d'œuvre (€)</Label>
              <Input
                id="labor_cost"
                type="number"
                step="0.01"
                value={quoteData.labor_cost}
                onChange={(e) => handleInputChange('labor_cost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parts_cost">Pièces détachées (€)</Label>
              <Input
                id="parts_cost"
                type="number"
                step="0.01"
                value={quoteData.parts_cost}
                onChange={(e) => handleInputChange('parts_cost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Délai estimé</Label>
              <Input
                id="estimated_duration"
                value={quoteData.estimated_duration}
                onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                placeholder="ex: 24-48h"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty_duration">Durée de garantie</Label>
              <Input
                id="warranty_duration"
                value={quoteData.warranty_duration}
                onChange={(e) => handleInputChange('warranty_duration', e.target.value)}
                placeholder="ex: 3 mois"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="terms_conditions">Conditions générales</Label>
              <Textarea
                id="terms_conditions"
                value={quoteData.terms_conditions}
                onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                placeholder="Conditions générales du devis"
              />
            </div>
          </div>
        )}

        {/* Résumé du devis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Main d'œuvre</p>
            <p className="text-2xl font-bold text-blue-600">{quoteData.labor_cost.toFixed(2)} €</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Pièces détachées</p>
            <p className="text-2xl font-bold text-orange-600">{quoteData.parts_cost.toFixed(2)} €</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total TTC</p>
            <p className="text-3xl font-bold text-green-600">{quoteData.total_cost.toFixed(2)} €</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex-1 min-w-fit"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={sendByEmail}
            className="flex-1 min-w-fit"
          >
            <Mail className="w-4 h-4 mr-2" />
            Envoyer par Email
          </Button>

          <Button 
            variant="outline" 
            onClick={sendBySMS}
            className="flex-1 min-w-fit"
          >
            <Phone className="w-4 h-4 mr-2" />
            Envoyer par SMS
          </Button>

          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex-1 min-w-fit"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteGenerator;