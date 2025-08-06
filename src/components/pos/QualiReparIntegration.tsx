import React, { useState, useEffect } from 'react';
import { useQualiReparEligibility } from '@/hooks/useQualiReparEligibility';
import QualiReparEligibilityBanner from '@/components/qualirepar/QualiReparEligibilityBanner';
import QualiReparCreateForm from '@/components/qualirepar/QualiReparCreateForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DossierCreationData } from '@/types/qualirepar';
import { Recycle } from 'lucide-react';

interface QualiReparIntegrationProps {
  // Données de la transaction POS ou commande de réparation
  deviceInfo?: {
    category: string;
    brand: string;
    model: string;
    serialNumber?: string;
  };
  clientInfo?: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    postalCode: string;
    city: string;
  };
  repairInfo?: {
    description: string;
    cost: number;
    date: string;
  };
  orderId?: string;
  transactionId?: string;
}

const QualiReparIntegration: React.FC<QualiReparIntegrationProps> = ({
  deviceInfo,
  clientInfo,
  repairInfo,
  orderId,
  transactionId
}) => {
  const { checkEligibility } = useQualiReparEligibility();
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (deviceInfo?.category && deviceInfo?.brand && deviceInfo?.model && repairInfo?.cost) {
      const result = checkEligibility(
        deviceInfo.category,
        deviceInfo.brand,
        deviceInfo.model,
        repairInfo.cost
      );
      setEligibilityResult(result);
    }
  }, [deviceInfo, repairInfo, checkEligibility]);

  const handleCreateDossier = () => {
    setShowCreateForm(true);
  };

  const prepareFormData = (): Partial<DossierCreationData> => {
    return {
      clientName: clientInfo?.name || '',
      clientEmail: clientInfo?.email || '',
      clientPhone: clientInfo?.phone || '',
      clientAddress: clientInfo?.address || '',
      clientPostalCode: clientInfo?.postalCode || '',
      clientCity: clientInfo?.city || '',
      productCategory: deviceInfo?.category || '',
      productBrand: deviceInfo?.brand || '',
      productModel: deviceInfo?.model || '',
      productSerialNumber: deviceInfo?.serialNumber || '',
      repairDescription: repairInfo?.description || '',
      repairCost: repairInfo?.cost || 0,
      repairDate: repairInfo?.date || new Date().toISOString().split('T')[0],
      requestedBonusAmount: eligibilityResult?.maxBonusAmount || 0,
      repairOrderId: orderId,
      posTransactionId: transactionId
    };
  };

  // Si pas d'infos sur l'appareil, pas d'affichage
  if (!deviceInfo?.category || !deviceInfo?.brand || !deviceInfo?.model || !repairInfo?.cost) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Bannière d'éligibilité */}
      {eligibilityResult && (
        <QualiReparEligibilityBanner
          eligibilityResult={eligibilityResult}
          onCreateDossier={handleCreateDossier}
        />
      )}

      {/* Dialog pour créer le dossier */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-emerald-600" />
              Créer un dossier QualiRépar
            </DialogTitle>
          </DialogHeader>
          
          <QualiReparCreateForm
            prefillData={prepareFormData()}
            onDossierCreated={() => {
              setShowCreateForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualiReparIntegration;