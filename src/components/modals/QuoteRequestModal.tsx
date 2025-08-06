
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBrands } from '@/hooks/catalog/useBrands';
import { useDeviceModels } from '@/hooks/catalog/useDeviceModels';
import { useRepairTypes } from '@/hooks/catalog/useRepairTypes';
import { useQuoteForm } from '@/hooks/useQuoteForm';
import ContactInfoSection from './quote/ContactInfoSection';
import DeviceTypeSection from './quote/DeviceTypeSection';
import BrandModelSection from './quote/BrandModelSection';
import RepairTypeSection from './quote/RepairTypeSection';
import IssueDescriptionSection from './quote/IssueDescriptionSection';
import AuthAlert from './quote/AuthAlert';

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
  const { formData, setFormData, loading, user, submitQuote } = useQuoteForm(repairerId, isOpen, onClose);
  
  const { brands, loading: brandsLoading } = useBrands();
  const { deviceModels, loading: modelsLoading } = useDeviceModels();
  const { repairTypes, loading: repairTypesLoading } = useRepairTypes();

  // Filtrer les marques qui ont des modèles pour le type d'appareil sélectionné
  const availableBrands = React.useMemo(() => {
    if (!formData.device_type || !deviceModels.length || !brands.length) {
      console.log('🔍 No filtering criteria:', { 
        deviceType: formData.device_type, 
        modelsCount: deviceModels.length,
        brandsCount: brands.length
      });
      return brands; // Retourner toutes les marques si pas de critères
    }
    
    console.log('🔍 Filtering brands for device type:', formData.device_type);
    
    const modelsForDeviceType = deviceModels.filter(model => {
      const matches = model.device_type_id === formData.device_type;
      return matches;
    });
    
    console.log('📱 Models for selected device type:', modelsForDeviceType.length);
    
    if (modelsForDeviceType.length === 0) {
      console.log('⚠️ No models found for device type, showing all brands');
      return brands;
    }
    
    const brandIds = [...new Set(modelsForDeviceType.map(model => model.brand_id))];
    const filteredBrands = brands.filter(brand => brandIds.includes(brand.id));
    
    console.log('✅ Filtered brands:', filteredBrands.length);
    
    return filteredBrands;
  }, [formData.device_type, deviceModels, brands]);

  // Filtrer les modèles par type d'appareil et marque
  const filteredModels = React.useMemo(() => {
    if (!formData.device_type || !deviceModels.length) {
      console.log('📱 No device type selected for models filtering');
      return [];
    }
    
    let filtered = deviceModels.filter(model => {
      return model.device_type_id === formData.device_type;
    });
    
    console.log('📱 Models filtered by device type:', filtered.length);
    
    if (formData.device_brand) {
      filtered = filtered.filter(model => {
        return model.brand_id === formData.device_brand;
      });
      console.log('📱 Models filtered by brand:', filtered.length);
    }
    
    return filtered;
  }, [formData.device_type, formData.device_brand, deviceModels]);

  const selectedBrand = brands.find(b => b.id === formData.device_brand);
  const selectedModel = deviceModels.find(m => m.id === formData.device_model);
  const selectedRepairType = repairTypes.find(rt => rt.id === formData.repair_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuote(selectedBrand, selectedModel, selectedRepairType);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeviceTypeChange = (value: string) => {
    console.log('📱 Device type changed to:', value);
    setFormData(prev => ({ 
      ...prev, 
      device_type: value, 
      device_brand: '', 
      device_model: '' 
    }));
  };

  const handleBrandChange = (value: string) => {
    console.log('🏷️ Brand changed to:', value);
    setFormData(prev => ({ 
      ...prev, 
      device_brand: value, 
      device_model: '' 
    }));
  };

  // Loading state
  if (brandsLoading || modelsLoading || repairTypesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Demande de devis</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des données du catalogue...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  console.log('🎯 Render state:', {
    deviceType: formData.device_type,
    availableBrandsCount: availableBrands.length,
    filteredModelsCount: filteredModels.length,
    selectedBrand: formData.device_brand,
    selectedModel: formData.device_model
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Demande de devis</DialogTitle>
        </DialogHeader>

        {!user && <AuthAlert />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <ContactInfoSection
            clientName={formData.client_name}
            clientEmail={formData.client_email}
            onClientNameChange={(value) => updateFormData('client_name', value)}
            onClientEmailChange={(value) => updateFormData('client_email', value)}
          />

          <DeviceTypeSection
            deviceType={formData.device_type}
            onDeviceTypeChange={handleDeviceTypeChange}
          />

          {/* Toujours afficher cette section une fois qu'un type est sélectionné */}
          {formData.device_type && (
            <BrandModelSection
              deviceBrand={formData.device_brand}
              deviceModel={formData.device_model}
              brands={availableBrands}
              filteredModels={filteredModels}
              onBrandChange={handleBrandChange}
              onModelChange={(value) => updateFormData('device_model', value)}
            />
          )}

          <RepairTypeSection
            repairType={formData.repair_type}
            repairTypes={repairTypes}
            onRepairTypeChange={(value) => updateFormData('repair_type', value)}
          />

          <IssueDescriptionSection
            issueDescription={formData.issue_description}
            onIssueDescriptionChange={(value) => updateFormData('issue_description', value)}
          />

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
