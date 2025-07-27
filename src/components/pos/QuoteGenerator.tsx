import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Mail, 
  Phone, 
  Edit,
  Save,
  Printer,
  ShoppingCart,
  Plus,
  Trash2
} from 'lucide-react';
import { RepairOrder } from '@/hooks/useRepairManagement';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import ProductSelection from '@/components/repairer-dashboard/pricing/ProductSelection';
import { useCatalog } from '@/hooks/useCatalog';
import { useRepairerPrices } from '@/hooks/catalog/useRepairerPrices';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  repairs: RepairItem[];
}

interface RepairItem {
  id: string;
  name: string;
  brandName: string;
  modelName: string;
  repairTypeName: string;
  basePrice?: number;
  customPrice?: number;
  manualPrice?: number;
  margin?: number;
  quantity: number;
  total: number;
  isCustom?: boolean; // Indique si c'est une réparation personnalisée
}

interface RepairerProfileData {
  business_name?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ 
  repairOrder, 
  onQuoteUpdate 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { brands, deviceModels, repairTypes, loading: catalogLoading } = useCatalog();
  const { basePrices, repairerPrices, loading: pricesLoading } = useRepairerPrices();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRepairType, setSelectedRepairType] = useState('');
  const [repairerProfile, setRepairerProfile] = useState<RepairerProfileData | null>(null);
  
  // États pour l'ajout de réparations personnalisées
  const [customRepairName, setCustomRepairName] = useState('');
  const [customRepairPrice, setCustomRepairPrice] = useState('');
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    diagnostic: repairOrder.device?.initial_diagnosis || '',
    labor_cost: 0,
    parts_cost: 0,
    total_cost: repairOrder.quote_amount || 0,
    estimated_duration: '24-48h',
    warranty_duration: '3 mois',
    terms_conditions: 'Devis valable 30 jours. Paiement à la réparation. Garantie 3 mois sur la réparation.',
    notes: '',
    repairs: []
  });

  // Charger le profil du réparateur
  useEffect(() => {
    const fetchRepairerProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('repairer_profiles')
          .select('business_name, address, postal_code, city, phone, email')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setRepairerProfile(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil réparateur:', error);
      }
    };

    fetchRepairerProfile();
  }, [user?.id]);

  const handleInputChange = (field: keyof QuoteData, value: string | number) => {
    const newData = { ...quoteData, [field]: value };
    
    // Recalcul automatique du total
    if (field === 'labor_cost' || field === 'parts_cost') {
      const repairsTotal = quoteData.repairs.reduce((sum, repair) => sum + repair.total, 0);
      newData.total_cost = newData.labor_cost + newData.parts_cost + repairsTotal;
    }
    
    setQuoteData(newData);
  };

  const addRepairFromCatalog = () => {
    if (!selectedBrand || !selectedModel || !selectedRepairType) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une marque, un modèle et un type de réparation.",
        variant: "destructive"
      });
      return;
    }

    // Trouver les données des entités sélectionnées
    const brand = brands.find(b => b.id === selectedBrand);
    const model = deviceModels.find(m => m.id === selectedModel);
    const repairType = repairTypes.find(rt => rt.id === selectedRepairType);

    // Trouver le prix de base
    const basePrice = basePrices.find(bp => 
      bp.device_model_id === selectedModel && bp.repair_type_id === selectedRepairType
    );

    // Trouver le prix personnalisé du réparateur
    const customPrice = repairerPrices.find(rp => 
      rp.repair_price_id === basePrice?.id
    );

    if (!basePrice) {
      toast({
        title: "Prix non trouvé",
        description: "Aucun prix de base trouvé pour cette combinaison.",
        variant: "destructive"
      });
      return;
    }

    const finalPrice = customPrice?.custom_price_eur || basePrice.price_eur;
    const margin = customPrice?.margin_percentage;

    const newRepair: RepairItem = {
      id: Date.now().toString(),
      name: `${brand?.name} ${model?.model_name} - ${repairType?.name}`,
      brandName: brand?.name || '',
      modelName: model?.model_name || '',
      repairTypeName: repairType?.name || '',
      basePrice: basePrice.price_eur,
      customPrice: customPrice?.custom_price_eur,
      margin: margin,
      quantity: 1,
      total: finalPrice,
      isCustom: false
    };

    const newRepairs = [...quoteData.repairs, newRepair];
    const repairsTotal = newRepairs.reduce((sum, r) => sum + r.total, 0);
    
    setQuoteData({
      ...quoteData,
      repairs: newRepairs,
      total_cost: quoteData.labor_cost + quoteData.parts_cost + repairsTotal
    });

    // Reset des sélections
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedRepairType('');

    toast({
      title: "Réparation ajoutée",
      description: `${newRepair.name} ajouté au devis.`
    });
  };

  const addCustomRepair = () => {
    if (!customRepairName.trim() || !customRepairPrice) {
      toast({
        title: "Champs manquants",
        description: "Veuillez saisir un nom et un prix pour la réparation personnalisée.",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(customRepairPrice);
    if (price <= 0) {
      toast({
        title: "Prix invalide",
        description: "Le prix doit être supérieur à 0.",
        variant: "destructive"
      });
      return;
    }

    const newRepair: RepairItem = {
      id: Date.now().toString(),
      name: customRepairName.trim(),
      brandName: '',
      modelName: '',
      repairTypeName: customRepairName.trim(),
      manualPrice: price,
      quantity: 1,
      total: price,
      isCustom: true
    };

    const newRepairs = [...quoteData.repairs, newRepair];
    const repairsTotal = newRepairs.reduce((sum, r) => sum + r.total, 0);
    
    setQuoteData({
      ...quoteData,
      repairs: newRepairs,
      total_cost: quoteData.labor_cost + quoteData.parts_cost + repairsTotal
    });

    // Reset des champs
    setCustomRepairName('');
    setCustomRepairPrice('');

    toast({
      title: "Réparation ajoutée",
      description: `${newRepair.name} ajouté au devis.`
    });
  };

  const updateRepairQuantity = (repairId: string, quantity: number) => {
    const updatedRepairs = quoteData.repairs.map(repair => {
      if (repair.id === repairId) {
        const price = repair.manualPrice || repair.customPrice || repair.basePrice || 0;
        return { ...repair, quantity, total: price * quantity };
      }
      return repair;
    });

    const repairsTotal = updatedRepairs.reduce((sum, repair) => sum + repair.total, 0);
    
    setQuoteData({
      ...quoteData,
      repairs: updatedRepairs,
      total_cost: quoteData.labor_cost + quoteData.parts_cost + repairsTotal
    });
  };

  const updateRepairPrice = (repairId: string, newPrice: number) => {
    if (newPrice < 0) {
      toast({
        title: "Prix invalide",
        description: "Le prix ne peut pas être négatif.",
        variant: "destructive"
      });
      return;
    }

    const updatedRepairs = quoteData.repairs.map(repair => {
      if (repair.id === repairId) {
        return { 
          ...repair, 
          manualPrice: newPrice,
          total: newPrice * repair.quantity 
        };
      }
      return repair;
    });

    const repairsTotal = updatedRepairs.reduce((sum, repair) => sum + repair.total, 0);
    
    setQuoteData({
      ...quoteData,
      repairs: updatedRepairs,
      total_cost: quoteData.labor_cost + quoteData.parts_cost + repairsTotal
    });

    toast({
      title: "Prix modifié",
      description: "Le prix de la réparation a été mis à jour."
    });
  };

  const removeRepair = (repairId: string) => {
    const updatedRepairs = quoteData.repairs.filter(repair => repair.id !== repairId);
    const repairsTotal = updatedRepairs.reduce((sum, repair) => sum + repair.total, 0);
    
    setQuoteData({
      ...quoteData,
      repairs: updatedRepairs,
      total_cost: quoteData.labor_cost + quoteData.parts_cost + repairsTotal
    });

    toast({
      title: "Réparation supprimée",
      description: "La réparation a été retirée du devis."
    });
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
        <!-- En-tête avec informations réparateur -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px;">
          <div>
            <h1 style="color: #3B82F6; font-size: 28px; margin: 0; font-weight: bold;">DEVIS DE RÉPARATION</h1>
            <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Document officiel</p>
            ${repairerProfile ? `
              <div style="margin-top: 15px; font-size: 12px; color: #6B7280;">
                <div style="font-weight: bold;">${repairerProfile.business_name || 'Réparateur'}</div>
                ${repairerProfile.address ? `<div>${repairerProfile.address}</div>` : ''}
                ${repairerProfile.postal_code && repairerProfile.city ? `<div>${repairerProfile.postal_code} ${repairerProfile.city}</div>` : ''}
                ${repairerProfile.phone ? `<div>Tél: ${repairerProfile.phone}</div>` : ''}
                ${repairerProfile.email ? `<div>Email: ${repairerProfile.email}</div>` : ''}
              </div>
            ` : ''}
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
              <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${repairOrder.device?.device_type?.name || 'Non renseigné'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Marque:</strong> ${repairOrder.device?.brand?.name || 'Non renseigné'}</p>
              <p style="margin: 0 0 8px 0;"><strong>Modèle:</strong> ${repairOrder.device?.device_model?.name || 'Non renseigné'}</p>
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
                <th style="padding: 15px; text-align: center; font-weight: bold; color: #374151;">Qté</th>
                <th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">Prix unitaire</th>
                <th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quoteData.repairs.map(repair => `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 15px;">${repair.repairTypeName}<br><small style="color: #6B7280;">${repair.brandName} ${repair.modelName}</small></td>
                  <td style="padding: 15px; text-align: center;">${repair.quantity}</td>
                  <td style="padding: 15px; text-align: right;">${(repair.manualPrice || repair.customPrice || repair.basePrice || 0).toFixed(2)} €</td>
                  <td style="padding: 15px; text-align: right;">${repair.total.toFixed(2)} €</td>
                </tr>
              `).join('')}
              ${quoteData.labor_cost > 0 ? `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 15px;">Main d'œuvre</td>
                  <td style="padding: 15px; text-align: center;">1</td>
                  <td style="padding: 15px; text-align: right;">${quoteData.labor_cost.toFixed(2)} €</td>
                  <td style="padding: 15px; text-align: right;">${quoteData.labor_cost.toFixed(2)} €</td>
                </tr>
              ` : ''}
              ${quoteData.parts_cost > 0 ? `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 15px;">Pièces détachées</td>
                  <td style="padding: 15px; text-align: center;">1</td>
                  <td style="padding: 15px; text-align: right;">${quoteData.parts_cost.toFixed(2)} €</td>
                  <td style="padding: 15px; text-align: right;">${quoteData.parts_cost.toFixed(2)} €</td>
                </tr>
              ` : ''}
              <tr style="background: #F9FAFB; font-weight: bold; font-size: 18px;">
                <td style="padding: 15px;" colspan="3">TOTAL TTC</td>
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

        <!-- Conditions et mentions légales -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">CONDITIONS GÉNÉRALES</h3>
          <p style="font-size: 12px; line-height: 1.5; color: #6B7280; background: #F9FAFB; padding: 15px; border-radius: 6px; margin: 0 0 15px 0;">
            ${quoteData.terms_conditions}
          </p>
          <div style="font-size: 10px; color: #9CA3AF; line-height: 1.4;">
            <p style="margin: 0 0 5px 0;"><strong>Mentions légales :</strong></p>
            <p style="margin: 0;">• Devis valable 30 jours à compter de la date d'émission</p>
            <p style="margin: 0;">• En cas d'acceptation, acompte de 30% à la commande</p>
            <p style="margin: 0;">• Garantie contractuelle selon conditions générales de vente</p>
            <p style="margin: 0;">• Médiation de la consommation : www.medicys.fr</p>
          </div>
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

      // Envoyer via l'edge function avec l'URL complète
      const supabaseUrl = 'https://nbugpbakfkyvvjzgfjmw.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/send-quote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc`
        },
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
        toast({ 
          title: "📧 Email envoyé", 
          description: `Le devis a été envoyé à ${repairOrder.device.customer_email}` 
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Erreur envoi email:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendBySMS = async () => {
    if (!repairOrder.device?.customer_phone) {
      toast({
        title: "Téléphone manquant",
        description: "Aucun numéro de téléphone client disponible.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const supabaseUrl = 'https://nbugpbakfkyvvjzgfjmw.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/send-quote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc`
        },
        body: JSON.stringify({
          repairOrderId: repairOrder.id,
          recipientPhone: repairOrder.device.customer_phone,
          pdfBase64: '', // Pas besoin du PDF pour SMS
          sendMethod: 'sms',
          quoteName: `Devis_${repairOrder.order_number}`
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({ 
          title: "📱 SMS envoyé", 
          description: `Notification envoyée au ${repairOrder.device.customer_phone}` 
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Erreur envoi SMS:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le SMS.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="catalog">Catalogue</TabsTrigger>
            <TabsTrigger value="edit">Édition</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Liste des réparations sélectionnées */}
            {quoteData.repairs.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Réparations sélectionnées</h4>
                {quoteData.repairs.map(repair => (
                  <div key={repair.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{repair.repairTypeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {repair.brandName} {repair.modelName}
                        </div>
                         <div className="text-sm text-muted-foreground">
                           Quantité: {repair.quantity} × {(repair.manualPrice || repair.customPrice || repair.basePrice || 0).toFixed(2)} €
                           {repair.margin && (
                             <Badge variant="outline" className="ml-2 text-xs">
                               {repair.margin > 0 ? '+' : ''}{repair.margin}%
                             </Badge>
                           )}
                         </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRepair(repair.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Quantité</Label>
                        <Input
                          type="number"
                          min="1"
                          value={repair.quantity}
                          onChange={(e) => updateRepairQuantity(repair.id, parseInt(e.target.value) || 1)}
                          className="text-center"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Prix unitaire (€)
                          {repair.manualPrice && (
                            <Badge variant="outline" className="ml-1 text-xs">Manuel</Badge>
                          )}
                        </Label>
                         <Input
                           type="number"
                           min="0"
                           step="0.01"
                           value={repair.manualPrice || repair.customPrice || repair.basePrice || 0}
                           onChange={(e) => updateRepairPrice(repair.id, parseFloat(e.target.value) || 0)}
                           className="text-center"
                         />
                         {repair.manualPrice && (
                           <div className="text-xs text-muted-foreground text-center">
                             Prix original: {(repair.customPrice || repair.basePrice || 0).toFixed(2)} €
                           </div>
                         )}
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Total</Label>
                        <div className="text-center font-bold text-lg">
                          {repair.total.toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
          </TabsContent>

            <TabsContent value="catalog" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter une réparation au devis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {catalogLoading || pricesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      <ProductSelection
                        brands={brands}
                        deviceModels={deviceModels}
                        repairTypes={repairTypes}
                        selectedBrand={selectedBrand}
                        selectedModel={selectedModel}
                        selectedRepairType={selectedRepairType}
                        onBrandChange={setSelectedBrand}
                        onModelChange={setSelectedModel}
                        onRepairTypeChange={setSelectedRepairType}
                      />
                      
                      {selectedBrand && selectedModel && selectedRepairType && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Aperçu du prix</h4>
                              <p className="text-sm text-muted-foreground">
                                {brands.find(b => b.id === selectedBrand)?.name} {' '}
                                {deviceModels.find(m => m.id === selectedModel)?.model_name} - {' '}
                                {repairTypes.find(rt => rt.id === selectedRepairType)?.name}
                              </p>
                            </div>
                            <div className="text-right">
                              {(() => {
                                const basePrice = basePrices.find(bp => 
                                  bp.device_model_id === selectedModel && bp.repair_type_id === selectedRepairType
                                );
                                const customPrice = repairerPrices.find(rp => 
                                  rp.repair_price_id === basePrice?.id
                                );
                                const finalPrice = customPrice?.custom_price_eur || basePrice?.price_eur || 0;
                                
                                return (
                                  <div>
                                    <div className="font-bold text-lg">{finalPrice.toFixed(2)} €</div>
                                    {customPrice && (
                                      <div className="text-xs text-muted-foreground">
                                        Prix de base: {basePrice?.price_eur.toFixed(2)} €
                                        {customPrice.margin_percentage && (
                                          <Badge variant="secondary" className="ml-1">
                                            {customPrice.margin_percentage > 0 ? '+' : ''}{customPrice.margin_percentage}%
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={addRepairFromCatalog}
                        disabled={!selectedBrand || !selectedModel || !selectedRepairType}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter au devis
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Section pour ajouter une réparation personnalisée */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Réparation personnalisée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customRepairName">Nom de la réparation</Label>
                      <Input
                        id="customRepairName"
                        value={customRepairName}
                        onChange={(e) => setCustomRepairName(e.target.value)}
                        placeholder="ex: Réparation écran cassé"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customRepairPrice">Prix (€)</Label>
                      <Input
                        id="customRepairPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={customRepairPrice}
                        onChange={(e) => setCustomRepairPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={addCustomRepair}
                    disabled={!customRepairName.trim() || !customRepairPrice}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter la réparation personnalisée
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {/* Formulaire d'édition */}
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
          </TabsContent>
        </Tabs>


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
            disabled={isGenerating || !repairOrder.device?.customer_email}
            className="flex-1 min-w-fit bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none animate-fade-in hover-scale"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isGenerating ? 'Envoi...' : 'Envoyer par Email'}
          </Button>

          <Button 
            variant="outline" 
            onClick={sendBySMS}
            disabled={isGenerating || !repairOrder.device?.customer_phone}
            className="flex-1 min-w-fit bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none animate-fade-in hover-scale"
          >
            <Phone className="w-4 h-4 mr-2" />
            {isGenerating ? 'Envoi...' : 'Envoyer par SMS'}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex-1 min-w-fit hover-scale animate-fade-in"
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