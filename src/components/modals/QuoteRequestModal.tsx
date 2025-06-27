
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/catalog/useBrands';
import { useDeviceModels } from '@/hooks/catalog/useDeviceModels';
import { useRepairTypes } from '@/hooks/catalog/useRepairTypes';
import { useDeviceTypes } from '@/hooks/catalog/useDeviceTypes';
import { usePendingQuoteAction } from '@/hooks/usePendingQuoteAction';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  repairerId
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { storePendingQuoteAction, executePendingAction, clearPendingAction } = usePendingQuoteAction();
  
  const [formData, setFormData] = useState({
    device_type: '',
    device_brand: '',
    device_model: '',
    repair_type: '',
    issue_description: '',
    client_email: '',
    client_name: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { deviceTypes } = useDeviceTypes();
  const { brands } = useBrands();
  const { deviceModels } = useDeviceModels();
  const { repairTypes } = useRepairTypes();

  // Pré-remplir les données utilisateur si connecté
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        client_email: user.email || '',
        client_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      }));
    }
  }, [user, profile]);

  // Restaurer les données d'une action en attente
  useEffect(() => {
    if (isOpen && user) {
      const pendingData = executePendingAction();
      if (pendingData && pendingData.repairerId === repairerId) {
        setFormData({
          device_type: pendingData.device_type,
          device_brand: pendingData.device_brand,
          device_model: pendingData.device_model,
          repair_type: pendingData.repair_type,
          issue_description: pendingData.issue_description,
          client_email: pendingData.client_email,
          client_name: pendingData.client_name
        });
        clearPendingAction();
        toast({
          title: "Données restaurées",
          description: "Votre formulaire de devis a été restauré après connexion."
        });
      }
    }
  }, [isOpen, user, repairerId, executePendingAction, clearPendingAction, toast]);

  const selectedBrand = brands.find(b => b.id === formData.device_brand);
  const filteredModels = deviceModels.filter(m => m.brand_id === formData.device_brand);
  const selectedModel = deviceModels.find(m => m.id === formData.device_model);
  const selectedRepairType = repairTypes.find(rt => rt.id === formData.repair_type);

  const handleAuthRedirect = () => {
    // Stocker les données du formulaire avant redirection
    storePendingQuoteAction({
      ...formData,
      repairerId
    });

    // Fermer le modal et rediriger vers l'authentification
    onClose();
    navigate('/client-auth');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier l'authentification
    if (!user) {
      handleAuthRedirect();
      return;
    }
    
    // Validation des champs obligatoires
    if (!formData.device_type || !formData.device_brand || !formData.device_model || 
        !formData.repair_type || !formData.client_email || !formData.client_name) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const quoteData = {
        client_id: user.id,
        repairer_id: repairerId,
        device_brand: selectedBrand?.name || formData.device_brand,
        device_model: selectedModel?.model_name || formData.device_model,
        repair_type: selectedRepairType?.name || formData.repair_type,
        issue_description: formData.issue_description,
        client_email: formData.client_email,
        client_name: formData.client_name
      };

      console.log('🔄 Sending quote request:', quoteData);

      const { error } = await supabase
        .from('quotes_with_timeline')
        .insert([quoteData]);

      if (error) {
        console.error('❌ Error inserting quote:', error);
        throw error;
      }

      // Envoyer la notification au réparateur
      try {
        await supabase
          .from('notifications_system')
          .insert([{
            user_id: repairerId,
            user_type: 'repairer',
            notification_type: 'quote_request',
            title: 'Nouvelle demande de devis',
            message: `Demande de devis pour ${quoteData.device_brand} ${quoteData.device_model} - ${quoteData.repair_type}`
          }]);
      } catch (notifError) {
        console.error('⚠️ Error sending notification:', notifError);
      }

      toast({
        title: "Demande envoyée !",
        description: "Votre demande de devis a été transmise au réparateur. Il a 24h pour vous répondre."
      });

      onClose();
      setFormData({
        device_type: '',
        device_brand: '',
        device_model: '',
        repair_type: '',
        issue_description: '',
        client_email: '',
        client_name: ''
      });
    } catch (error) {
      console.error('❌ Error submitting quote request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de devis. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Demande de devis</DialogTitle>
        </DialogHeader>

        {!user && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vous devez être connecté pour envoyer une demande de devis. 
              Vos données seront sauvegardées pendant l'inscription.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Nom complet *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="client_email">Email *</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Device Information */}
          <div>
            <Label htmlFor="device_type">Type de produit *</Label>
            <Select value={formData.device_type} onValueChange={(value) => setFormData({...formData, device_type: value, device_brand: '', device_model: ''})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de produit" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="device_brand">Marque *</Label>
              <Select value={formData.device_brand} onValueChange={(value) => setFormData({...formData, device_brand: value, device_model: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="device_model">Modèle *</Label>
              <Select value={formData.device_model} onValueChange={(value) => setFormData({...formData, device_model: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.model_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="repair_type">Type de réparation *</Label>
            <Select value={formData.repair_type} onValueChange={(value) => setFormData({...formData, repair_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de réparation" />
              </SelectTrigger>
              <SelectContent>
                {repairTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="issue_description">Description du problème</Label>
            <Textarea
              id="issue_description"
              value={formData.issue_description}
              onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
              placeholder="Décrivez le problème en détail..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : !user ? 'Se connecter et envoyer' : 'Envoyer la demande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestModal;
