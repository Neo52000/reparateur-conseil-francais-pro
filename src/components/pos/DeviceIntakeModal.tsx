import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Camera, 
  FileText, 
  User, 
  Package 
} from 'lucide-react';
import { useRepairManagement, type DeviceCondition } from '@/hooks/useRepairManagement';
import { useToast } from '@/hooks/use-toast';
import { generateRepairTicket } from '@/components/pos/RepairTicketGenerator';
import { supabase } from '@/integrations/supabase/client';

interface DeviceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeviceIntakeForm {
  // Device info
  device_type_id: string;
  brand_id: string;
  device_model_id: string;
  imei_serial: string;
  custom_device_info: string;
  initial_condition_id: string;
  
  // Security codes
  pin_code: string;
  sim_code: string;
  lock_pattern: string;
  security_notes: string;
  
  // Customer info
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_notes: string;
  
  // Diagnosis
  initial_diagnosis: string;
  estimated_cost: number;
  estimated_duration_hours: number;
  
  // Accessories
  accessories: string[];
}

const DeviceIntakeModal: React.FC<DeviceIntakeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createRepairOrder, deviceConditions } = useRepairManagement();
  const { toast } = useToast();
  
  // Local state for catalog data
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [deviceModels, setDeviceModels] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<Partial<DeviceIntakeForm>>({
    accessories: [],
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load catalog data
  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        const [typesRes, brandsRes, modelsRes] = await Promise.all([
          supabase.from('device_types').select('*').order('name'),
          supabase.from('brands').select('*').order('name'),
          supabase.from('device_models').select('*').order('model_name')
        ]);

        if (typesRes.data) setDeviceTypes(typesRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
        if (modelsRes.data) setDeviceModels(modelsRes.data);
      } catch (error) {
        console.error('Error loading catalog data:', error);
      }
    };

    if (isOpen) {
      loadCatalogData();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({ accessories: [] });
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.device_type_id) {
      toast({
        title: 'Informations manquantes',
        description: 'Le nom du client et le type d\'appareil sont obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const repairOrder = await createRepairOrder({
        device_type_id: formData.device_type_id,
        brand_id: formData.brand_id,
        device_model_id: formData.device_model_id,
        imei_serial: formData.imei_serial,
        custom_device_info: formData.custom_device_info,
        initial_condition_id: formData.initial_condition_id,
        pin_code: formData.pin_code,
        sim_code: formData.sim_code,
        lock_pattern: formData.lock_pattern,
        security_notes: formData.security_notes,
        customer_name: formData.customer_name!,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        customer_notes: formData.customer_notes,
        initial_diagnosis: formData.initial_diagnosis,
        estimated_cost: formData.estimated_cost,
        estimated_duration_hours: formData.estimated_duration_hours,
        accessories: formData.accessories || [],
      });

      // Générer et imprimer le bon de prise en charge
      if (repairOrder) {
        await generateRepairTicket(repairOrder as any);
      }

      handleClose();
    } catch (error) {
      console.error('Error creating repair order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredModels = deviceModels.filter(model => 
    formData.brand_id ? model.brand_id === formData.brand_id : true
  );

  const commonAccessories = [
    'Chargeur',
    'Écouteurs',
    'Coque',
    'Verre trempé',
    'Support voiture',
    'Câble USB',
    'Adaptateur',
    'Carte SD'
  ];

  const toggleAccessory = (accessory: string) => {
    const currentAccessories = formData.accessories || [];
    const newAccessories = currentAccessories.includes(accessory)
      ? currentAccessories.filter(a => a !== accessory)
      : [...currentAccessories, accessory];
    
    setFormData({ ...formData, accessories: newAccessories });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Accueil d'un nouvel appareil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && <div className="w-8 h-0.5 bg-muted mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Customer Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Nom du client *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name || ''}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Téléphone</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone || ''}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email || ''}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_notes">Notes client</Label>
                  <Textarea
                    id="customer_notes"
                    value={formData.customer_notes || ''}
                    onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                    placeholder="Informations particulières du client..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Device Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Informations Appareil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type d'appareil *</Label>
                    <Select 
                      value={formData.device_type_id || ''} 
                      onValueChange={(value) => setFormData({ ...formData, device_type_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
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
                  <div>
                    <Label>Marque</Label>
                    <Select 
                      value={formData.brand_id || ''} 
                      onValueChange={(value) => setFormData({ ...formData, brand_id: value, device_model_id: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
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
                    <Label>Modèle</Label>
                    <Select 
                      value={formData.device_model_id || ''} 
                      onValueChange={(value) => setFormData({ ...formData, device_model_id: value })}
                      disabled={!formData.brand_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imei_serial">IMEI / Numéro de série</Label>
                    <Input
                      id="imei_serial"
                      value={formData.imei_serial || ''}
                      onChange={(e) => setFormData({ ...formData, imei_serial: e.target.value })}
                      placeholder="123456789012345"
                    />
                  </div>
                  <div>
                    <Label>État initial</Label>
                    <Select 
                      value={formData.initial_condition_id || ''} 
                      onValueChange={(value) => setFormData({ ...formData, initial_condition_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Évaluer l'état..." />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceConditions.map((condition) => (
                          <SelectItem key={condition.id} value={condition.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: condition.color }}
                              />
                              {condition.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Codes de sécurité */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Codes de sécurité</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pin_code">Code PIN appareil</Label>
                      <Input
                        id="pin_code"
                        type="password"
                        value={formData.pin_code || ''}
                        onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                        placeholder="0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sim_code">Code PIN SIM</Label>
                      <Input
                        id="sim_code"
                        type="password"
                        value={formData.sim_code || ''}
                        onChange={(e) => setFormData({ ...formData, sim_code: e.target.value })}
                        placeholder="0000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lock_pattern">Modèle de verrouillage (9 points)</Label>
                    <Input
                      id="lock_pattern"
                      value={formData.lock_pattern || ''}
                      onChange={(e) => setFormData({ ...formData, lock_pattern: e.target.value })}
                      placeholder="Ex: 1-2-3-6-9 ou description du motif"
                    />
                  </div>
                  <div>
                    <Label htmlFor="security_notes">Notes de sécurité</Label>
                    <Textarea
                      id="security_notes"
                      value={formData.security_notes || ''}
                      onChange={(e) => setFormData({ ...formData, security_notes: e.target.value })}
                      placeholder="Autres informations de sécurité..."
                      rows={2}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom_device_info">Informations supplémentaires</Label>
                  <Textarea
                    id="custom_device_info"
                    value={formData.custom_device_info || ''}
                    onChange={(e) => setFormData({ ...formData, custom_device_info: e.target.value })}
                    placeholder="Couleur, capacité, spécificités..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Accessories */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Accessoires fournis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {commonAccessories.map((accessory) => (
                    <Button
                      key={accessory}
                      variant={formData.accessories?.includes(accessory) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAccessory(accessory)}
                    >
                      {accessory}
                    </Button>
                  ))}
                </div>
                
                {formData.accessories && formData.accessories.length > 0 && (
                  <div>
                    <Label>Accessoires sélectionnés :</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.accessories.map((accessory) => (
                        <Badge key={accessory} variant="secondary">
                          {accessory}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Initial Diagnosis */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Diagnostic Initial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="initial_diagnosis">Problème rapporté par le client</Label>
                  <Textarea
                    id="initial_diagnosis"
                    value={formData.initial_diagnosis || ''}
                    onChange={(e) => setFormData({ ...formData, initial_diagnosis: e.target.value })}
                    placeholder="Décrivez le problème rapporté par le client..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimated_cost">Estimation initiale (€)</Label>
                    <Input
                      id="estimated_cost"
                      type="number"
                      value={formData.estimated_cost || ''}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimated_duration_hours">Durée estimée (heures)</Label>
                    <Input
                      id="estimated_duration_hours"
                      type="number"
                      value={formData.estimated_duration_hours || ''}
                      onChange={(e) => setFormData({ ...formData, estimated_duration_hours: parseInt(e.target.value) || 0 })}
                      placeholder="2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Annuler
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Suivant
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Création...' : 'Créer l\'ordre de réparation'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceIntakeModal;