import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, AlertTriangle, FileText, Shield, User, Smartphone, ShoppingCart } from 'lucide-react';

interface EnhancedBuybackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuybackComplete: (buybackData: any) => void;
}

const EnhancedBuybackForm: React.FC<EnhancedBuybackFormProps> = ({
  open,
  onOpenChange,
  onBuybackComplete
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('seller');

  // Form data conforming to Code pénal requirements
  const [formData, setFormData] = useState({
    // Seller identity (Code pénal R321-8)
    seller_name: '',
    seller_id_type: 'carte_identite',
    seller_id_number: '',
    seller_address: '',
    seller_birth_date: '',
    seller_birth_place: '',
    seller_phone: '',
    seller_email: '',
    identity_verified: false,
    
    // Device information (Code pénal R321-9)
    device_brand: '',
    device_model: '',
    device_color: '',
    device_serial_number: '',
    device_imei: '',
    device_condition: '',
    device_description: '',
    device_accessories: '',
    
    // Transaction details (Code pénal R321-10)
    purchase_price: '',
    evaluation_notes: '',
    transaction_date: new Date().toISOString().split('T')[0],
    
    // Legal compliance
    origin_declaration: false,
    terms_accepted: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = [
      'seller_name', 'seller_id_number', 'seller_address', 'seller_birth_date',
      'device_brand', 'device_model', 'device_serial_number', 'purchase_price'
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Champ requis",
          description: `Le champ ${field.replace('_', ' ')} est obligatoire`,
          variant: "destructive"
        });
        return false;
      }
    }

    if (!formData.identity_verified) {
      toast({
        title: "Vérification identité",
        description: "La vérification d'identité est obligatoire (Code pénal R321-8)",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.origin_declaration || !formData.terms_accepted) {
      toast({
        title: "Déclarations manquantes",
        description: "Les déclarations d'origine et l'acceptation des conditions sont obligatoires",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utilisateur non connecté');

      // Create buyback transaction with legal compliance
      const buybackData = {
        repairer_id: user.user.id,
        seller_identity_verified: formData.identity_verified,
        seller_id_type: formData.seller_id_type,
        seller_id_number: formData.seller_id_number,
        seller_address: formData.seller_address,
        seller_birth_date: formData.seller_birth_date,
        seller_birth_place: formData.seller_birth_place,
        device_brand: formData.device_brand,
        device_model: formData.device_model,
        device_serial_number: formData.device_serial_number,
        device_imei: formData.device_imei,
        device_condition: formData.device_condition,
        device_description: formData.device_description,
        purchase_price: parseFloat(formData.purchase_price),
        transaction_date: formData.transaction_date,
        status: 'completed',
        police_logbook_exported: false,
        retention_until: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString() // 5 years
      };

      // Insert into digital police logbook
      const policeLogbookEntry = {
        repairer_id: user.user.id,
        transaction_type: 'buyback',
        transaction_date: formData.transaction_date,
        seller_identity: {
          name: formData.seller_name,
          id_type: formData.seller_id_type,
          id_number: formData.seller_id_number,
          address: formData.seller_address,
          birth_date: formData.seller_birth_date,
          birth_place: formData.seller_birth_place
        },
        product_description: {
          brand: formData.device_brand,
          model: formData.device_model,
          serial: formData.device_serial_number,
          imei: formData.device_imei,
          condition: formData.device_condition,
          description: formData.device_description
        },
        purchase_amount: parseFloat(formData.purchase_price)
      };

      // Call an edge function to handle the complete buyback process
      const { data, error } = await supabase.functions.invoke('process-buyback', {
        body: { buybackData, policeLogbookEntry }
      });

      if (error) throw error;

      toast({
        title: "Rachat enregistré",
        description: "Transaction conforme au Code pénal enregistrée avec succès",
        variant: "default"
      });

      onBuybackComplete(data);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors du rachat:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la transaction de rachat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      seller_name: '',
      seller_id_type: 'carte_identite',
      seller_id_number: '',
      seller_address: '',
      seller_birth_date: '',
      seller_birth_place: '',
      seller_phone: '',
      seller_email: '',
      identity_verified: false,
      device_brand: '',
      device_model: '',
      device_color: '',
      device_serial_number: '',
      device_imei: '',
      device_condition: '',
      device_description: '',
      device_accessories: '',
      purchase_price: '',
      evaluation_notes: '',
      transaction_date: new Date().toISOString().split('T')[0],
      origin_declaration: false,
      terms_accepted: false
    });
    setCurrentTab('seller');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nouveau rachat - Conforme Code pénal
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold">Conformité légale</span>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            Formulaire conforme au Code pénal articles R321-8 à R321-10. 
            Conservation obligatoire 5 ans minimum.
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="seller" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Vendeur
            </TabsTrigger>
            <TabsTrigger value="device" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Appareil
            </TabsTrigger>
            <TabsTrigger value="transaction" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transaction
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Conformité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seller" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Identification du vendeur (Art. R321-8)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seller_name">Nom complet *</Label>
                    <Input
                      id="seller_name"
                      value={formData.seller_name}
                      onChange={(e) => handleInputChange('seller_name', e.target.value)}
                      placeholder="Nom et prénom du vendeur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seller_id_type">Type de pièce d'identité *</Label>
                    <select
                      id="seller_id_type"
                      className="w-full p-2 border rounded"
                      value={formData.seller_id_type}
                      onChange={(e) => handleInputChange('seller_id_type', e.target.value)}
                    >
                      <option value="carte_identite">Carte d'identité</option>
                      <option value="passeport">Passeport</option>
                      <option value="permis_conduire">Permis de conduire</option>
                      <option value="titre_sejour">Titre de séjour</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="seller_id_number">Numéro de pièce d'identité *</Label>
                    <Input
                      id="seller_id_number"
                      value={formData.seller_id_number}
                      onChange={(e) => handleInputChange('seller_id_number', e.target.value)}
                      placeholder="Numéro de la pièce d'identité"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seller_birth_date">Date de naissance *</Label>
                    <Input
                      id="seller_birth_date"
                      type="date"
                      value={formData.seller_birth_date}
                      onChange={(e) => handleInputChange('seller_birth_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seller_birth_place">Lieu de naissance *</Label>
                    <Input
                      id="seller_birth_place"
                      value={formData.seller_birth_place}
                      onChange={(e) => handleInputChange('seller_birth_place', e.target.value)}
                      placeholder="Ville et pays de naissance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seller_phone">Téléphone</Label>
                    <Input
                      id="seller_phone"
                      value={formData.seller_phone}
                      onChange={(e) => handleInputChange('seller_phone', e.target.value)}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="seller_address">Adresse complète *</Label>
                  <Textarea
                    id="seller_address"
                    value={formData.seller_address}
                    onChange={(e) => handleInputChange('seller_address', e.target.value)}
                    placeholder="Adresse postale complète du vendeur"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="identity_verified"
                    checked={formData.identity_verified}
                    onChange={(e) => handleInputChange('identity_verified', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="identity_verified" className="text-sm">
                    Identité vérifiée et pièce d'identité contrôlée *
                  </Label>
                  {formData.identity_verified && (
                    <Badge variant="default" className="ml-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Description de l'objet (Art. R321-9)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="device_brand">Marque *</Label>
                    <Input
                      id="device_brand"
                      value={formData.device_brand}
                      onChange={(e) => handleInputChange('device_brand', e.target.value)}
                      placeholder="Apple, Samsung, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="device_model">Modèle *</Label>
                    <Input
                      id="device_model"
                      value={formData.device_model}
                      onChange={(e) => handleInputChange('device_model', e.target.value)}
                      placeholder="iPhone 13, Galaxy S21, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="device_color">Couleur</Label>
                    <Input
                      id="device_color"
                      value={formData.device_color}
                      onChange={(e) => handleInputChange('device_color', e.target.value)}
                      placeholder="Noir, Blanc, Bleu, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="device_condition">État général</Label>
                    <select
                      id="device_condition"
                      className="w-full p-2 border rounded"
                      value={formData.device_condition}
                      onChange={(e) => handleInputChange('device_condition', e.target.value)}
                    >
                      <option value="">Sélectionner un état</option>
                      <option value="excellent">Excellent</option>
                      <option value="tres_bon">Très bon</option>
                      <option value="bon">Bon</option>
                      <option value="moyen">Moyen</option>
                      <option value="defaillant">Défaillant</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="device_serial_number">Numéro de série *</Label>
                    <Input
                      id="device_serial_number"
                      value={formData.device_serial_number}
                      onChange={(e) => handleInputChange('device_serial_number', e.target.value)}
                      placeholder="Numéro de série de l'appareil"
                    />
                  </div>
                  <div>
                    <Label htmlFor="device_imei">IMEI</Label>
                    <Input
                      id="device_imei"
                      value={formData.device_imei}
                      onChange={(e) => handleInputChange('device_imei', e.target.value)}
                      placeholder="IMEI de l'appareil"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="device_description">Description détaillée</Label>
                  <Textarea
                    id="device_description"
                    value={formData.device_description}
                    onChange={(e) => handleInputChange('device_description', e.target.value)}
                    placeholder="Description détaillée de l'appareil et de son état"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="device_accessories">Accessoires inclus</Label>
                  <Textarea
                    id="device_accessories"
                    value={formData.device_accessories}
                    onChange={(e) => handleInputChange('device_accessories', e.target.value)}
                    placeholder="Chargeur, boîte, écouteurs, etc."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transaction" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Détails de la transaction (Art. R321-10)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase_price">Prix de rachat (€) *</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transaction_date">Date de transaction *</Label>
                    <Input
                      id="transaction_date"
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="evaluation_notes">Notes d'évaluation</Label>
                  <Textarea
                    id="evaluation_notes"
                    value={formData.evaluation_notes}
                    onChange={(e) => handleInputChange('evaluation_notes', e.target.value)}
                    placeholder="Notes sur l'évaluation et la négociation"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Déclarations et conformité légale
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="origin_declaration"
                      checked={formData.origin_declaration}
                      onChange={(e) => handleInputChange('origin_declaration', e.target.checked)}
                      className="rounded mt-1"
                    />
                    <Label htmlFor="origin_declaration" className="text-sm">
                      Le vendeur déclare être propriétaire légitime de l'appareil et 
                      garantit son origine licite. L'appareil n'est pas volé, perdu 
                      ou fait l'objet d'un litige. *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                      className="rounded mt-1"
                    />
                    <Label htmlFor="terms_accepted" className="text-sm">
                      J'ai informé le vendeur que cette transaction sera conservée 
                      pendant 5 ans minimum conformément au Code pénal et que les 
                      informations pourront être transmises aux autorités compétentes 
                      en cas de besoin. *
                    </Label>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Conservation des données</h4>
                    <p className="text-sm text-blue-700">
                      Cette transaction sera automatiquement enregistrée dans le livre 
                      de police numérique et conservée pendant 5 ans minimum, conformément 
                      aux articles R321-8 à R321-10 du Code pénal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Enregistrement...' : 'Finaliser le rachat'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBuybackForm;