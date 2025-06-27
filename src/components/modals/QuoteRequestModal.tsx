
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBrands } from '@/hooks/catalog/useBrands';
import { useDeviceModels } from '@/hooks/catalog/useDeviceModels';
import { useRepairTypes } from '@/hooks/catalog/useRepairTypes';
import { useDeviceTypes } from '@/hooks/catalog/useDeviceTypes';
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
  
  const { deviceTypes } = useDeviceTypes();
  const { brands } = useBrands();
  const { deviceModels } = useDeviceModels();
  const { repairTypes } = useRepairTypes();

  const selectedBrand = brands.find(b => b.id === formData.device_brand);
  const filteredModels = deviceModels.filter(m => m.brand_id === formData.device_brand);
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
    setFormData(prev => ({ 
      ...prev, 
      device_type: value, 
      device_brand: '', 
      device_model: '' 
    }));
  };

  const handleBrandChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      device_brand: value, 
      device_model: '' 
    }));
  };

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
            deviceTypes={deviceTypes}
            onDeviceTypeChange={handleDeviceTypeChange}
          />

          <BrandModelSection
            deviceBrand={formData.device_brand}
            deviceModel={formData.device_model}
            brands={brands}
            filteredModels={filteredModels}
            onBrandChange={handleBrandChange}
            onModelChange={(value) => updateFormData('device_model', value)}
          />

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
