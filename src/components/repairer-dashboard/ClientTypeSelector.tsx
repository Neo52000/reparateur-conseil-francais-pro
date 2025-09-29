import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building, User, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ClientTypeProps {
  clientId?: string;
  onClientTypeSelected?: (clientType: 'B2B' | 'B2C', clientData?: any) => void;
}

interface ClientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  siret_number?: string;
  tva_number?: string;
  company_name?: string;
  address?: string;
}

const ClientTypeSelector: React.FC<ClientTypeProps> = ({ 
  clientId, 
  onClientTypeSelected 
}) => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    siret_number: '',
    tva_number: '',
    company_name: '',
    address: ''
  });

  React.useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      
      // Get legal info separately
      const { data: legalData } = await supabase
        .from('repairer_legal_info')
        .select('siret, tva_number')
        .eq('repairer_id', clientId)
        .single();
      
      const enrichedData = {
        ...data,
        siret_number: legalData?.siret || '',
        tva_number: legalData?.tva_number || '',
        company_name: '',
        address: ''
      };
      
      setClientData(enrichedData);
      setFormData({
        siret_number: enrichedData.siret_number,
        tva_number: enrichedData.tva_number,
        company_name: enrichedData.company_name,
        address: enrichedData.address
      });

      // Notifier le type de client détecté
      const clientType = enrichedData.siret_number ? 'B2B' : 'B2C';
      onClientTypeSelected?.(clientType, enrichedData);
    } catch (error) {
      console.error('Erreur chargement client:', error);
      toast.error('Erreur lors du chargement des données client');
    }
  };

  const handleSaveB2BInfo = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      // Save to repairer_legal_info table instead
      const { error } = await supabase
        .from('repairer_legal_info')
        .upsert({
          repairer_id: clientId,
          siret: formData.siret_number,
          tva_number: formData.tva_number,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Informations B2B sauvegardées');
      setIsEditing(false);
      await loadClientData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const validateSIRET = (siret: string): boolean => {
    const cleanSiret = siret.replace(/\s/g, '');
    return /^[0-9]{14}$/.test(cleanSiret);
  };

  const validateTVA = (tva: string): boolean => {
    const cleanTva = tva.replace(/\s/g, '');
    return /^[A-Z]{2}[0-9A-Z]{2}[0-9]{9}$/.test(cleanTva);
  };

  const getClientType = (): 'B2B' | 'B2C' => {
    return clientData?.siret_number ? 'B2B' : 'B2C';
  };

  const isB2BComplete = (): boolean => {
    return !!(clientData?.siret_number && clientData?.company_name);
  };

  if (!clientData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Aucun client sélectionné
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {getClientType() === 'B2B' ? (
              <Building className="h-5 w-5 mr-2 text-blue-600" />
            ) : (
              <User className="h-5 w-5 mr-2 text-green-600" />
            )}
            Type de client
          </div>
          <Badge variant={getClientType() === 'B2B' ? 'default' : 'secondary'}>
            {getClientType()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations de base */}
        <div className="space-y-2">
          <div>
            <strong>Nom:</strong> {clientData.first_name} {clientData.last_name}
          </div>
          <div>
            <strong>Email:</strong> {clientData.email}
          </div>
          {clientData.phone && (
            <div>
              <strong>Téléphone:</strong> {clientData.phone}
            </div>
          )}
        </div>

        {/* Statut B2B */}
        {getClientType() === 'B2B' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isB2BComplete() ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                )}
                <span className="font-medium">
                  {isB2BComplete() ? 'Conforme Chorus Pro' : 'Informations incomplètes'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
            </div>

            {clientData.company_name && (
              <div>
                <strong>Entreprise:</strong> {clientData.company_name}
              </div>
            )}
            {clientData.siret_number && (
              <div>
                <strong>SIRET:</strong> {clientData.siret_number}
              </div>
            )}
            {clientData.tva_number && (
              <div>
                <strong>N° TVA:</strong> {clientData.tva_number}
              </div>
            )}

            {!isB2BComplete() && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Informations B2B incomplètes. La soumission à Chorus Pro nécessite 
                  au minimum un SIRET et un nom d'entreprise.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Client particulier (B2C) - Facturation électronique standard
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Convertir en client professionnel (B2B)
            </Button>
          </div>
        )}

        {/* Dialog de modification */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {getClientType() === 'B2B' ? 'Modifier' : 'Ajouter'} informations B2B
              </DialogTitle>
              <DialogDescription>
                Ces informations sont nécessaires pour la facturation B2B et Chorus Pro.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Ma Société SARL"
                />
              </div>

              <div>
                <Label htmlFor="siret_number">SIRET *</Label>
                <Input
                  id="siret_number"
                  value={formData.siret_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, siret_number: e.target.value }))}
                  placeholder="12345678901234"
                />
                {formData.siret_number && !validateSIRET(formData.siret_number) && (
                  <p className="text-sm text-red-600 mt-1">
                    Format SIRET invalide (14 chiffres requis)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tva_number">N° TVA Intracommunautaire</Label>
                <Input
                  id="tva_number"
                  value={formData.tva_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, tva_number: e.target.value }))}
                  placeholder="FR12345678901"
                />
                {formData.tva_number && !validateTVA(formData.tva_number) && (
                  <p className="text-sm text-red-600 mt-1">
                    Format TVA invalide (ex: FR12345678901)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Rue de la République, 75001 Paris"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSaveB2BInfo} 
                disabled={loading || !formData.company_name || !formData.siret_number}
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ClientTypeSelector;