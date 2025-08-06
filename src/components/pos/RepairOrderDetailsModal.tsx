import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  FileText, 
  Clock, 
  User, 
  Smartphone,
  Settings
} from 'lucide-react';
import { RepairOrder } from '@/hooks/useRepairManagement';
import RepairProgressTracker from './RepairProgressTracker';
import QuoteGenerator from './QuoteGenerator';

interface RepairOrderDetailsModalProps {
  repairOrder: RepairOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, status: string) => void;
}

const RepairOrderDetailsModal: React.FC<RepairOrderDetailsModalProps> = ({
  repairOrder,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const [activeTab, setActiveTab] = useState('progress');

  if (!repairOrder) return null;

  const handleStatusUpdate = (status: string) => {
    onStatusUpdate?.(repairOrder.id, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diagnostic': return 'bg-blue-500';
      case 'quote_pending': return 'bg-yellow-500';
      case 'quote_accepted': return 'bg-orange-500';
      case 'in_progress': return 'bg-purple-500';
      case 'waiting_parts': return 'bg-red-500';
      case 'testing': return 'bg-indigo-500';
      case 'completed': return 'bg-green-500';
      case 'ready_pickup': return 'bg-emerald-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      diagnostic: 'Diagnostic',
      quote_pending: 'Devis en attente',
      quote_accepted: 'Devis accepté',
      in_progress: 'En cours',
      waiting_parts: 'Attente pièces',
      testing: 'Tests',
      completed: 'Terminé',
      ready_pickup: 'Prêt à récupérer',
      delivered: 'Livré',
      cancelled: 'Annulé',
      warranty_return: 'Retour garantie'
    };
    return statusLabels[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">
                Commande {repairOrder.order_number}
              </DialogTitle>
              <Badge 
                className={`${getStatusColor(repairOrder.status)} text-white animate-fade-in`}
              >
                {getStatusLabel(repairOrder.status)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Progression
              </TabsTrigger>
              <TabsTrigger value="quote" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Devis
              </TabsTrigger>
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Client
              </TabsTrigger>
              <TabsTrigger value="device" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Appareil
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="progress" className="mt-0 space-y-4">
                <RepairProgressTracker 
                  repairOrder={repairOrder}
                  onStatusUpdate={handleStatusUpdate}
                />
              </TabsContent>

              <TabsContent value="quote" className="mt-0 space-y-4">
                <QuoteGenerator 
                  repairOrder={repairOrder}
                  onQuoteUpdate={(quoteData) => {
                    console.log('Quote updated:', quoteData);
                  }}
                />
              </TabsContent>

              <TabsContent value="customer" className="mt-0 space-y-4">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations Client
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Nom complet
                        </label>
                        <p className="text-base font-medium">
                          {repairOrder.device?.customer_name || 'Non renseigné'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Téléphone principal
                        </label>
                        <p className="text-base">
                          {repairOrder.device?.customer_phone || 'Non renseigné'}
                        </p>
                      </div>
                      
                      {repairOrder.device?.customer_phone_fixed && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Téléphone fixe
                          </label>
                          <p className="text-base">
                            {repairOrder.device.customer_phone_fixed}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-base">
                          {repairOrder.device?.customer_email || 'Non renseigné'}
                        </p>
                      </div>
                      
                      {repairOrder.device?.customer_notes && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Notes client
                          </label>
                          <p className="text-base bg-muted/50 p-3 rounded-md">
                            {repairOrder.device.customer_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="device" className="mt-0 space-y-4">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Détails de l'Appareil
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Type d'appareil
                        </label>
                        <p className="text-base font-medium flex items-center gap-2">
                          {repairOrder.device?.device_type?.name || 'Non renseigné'}
                          {repairOrder.device?.device_type?.description && (
                            <span className="text-xs text-muted-foreground">
                              ({repairOrder.device.device_type.description})
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Marque
                        </label>
                        <div className="flex items-center gap-2">
                          {repairOrder.device?.brand?.logo_url && (
                            <img 
                              src={repairOrder.device.brand.logo_url} 
                              alt={repairOrder.device.brand.name}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <p className="text-base font-medium">
                            {repairOrder.device?.brand?.name || 'Non renseigné'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Modèle
                        </label>
                        <div className="flex items-center gap-2">
                          {repairOrder.device?.device_model?.image_url && (
                            <img 
                              src={repairOrder.device.device_model.image_url} 
                              alt={repairOrder.device.device_model.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          <div>
                            <p className="text-base font-medium">
                              {repairOrder.device?.device_model?.name || 'Non renseigné'}
                            </p>
                            {repairOrder.device?.device_model?.release_year && (
                              <p className="text-xs text-muted-foreground">
                                Année: {repairOrder.device.device_model.release_year}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          IMEI/Série
                        </label>
                        <p className="text-base font-mono text-sm bg-muted/50 p-2 rounded">
                          {repairOrder.device?.imei_serial || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* États de l'appareil */}
                      <div className="grid grid-cols-1 gap-3">
                        {repairOrder.device?.initial_condition && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              État initial
                            </label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: repairOrder.device.initial_condition.color }}
                              />
                              <span className="font-medium">
                                {repairOrder.device.initial_condition.name}
                              </span>
                              {repairOrder.device.initial_condition.description && (
                                <span className="text-xs text-muted-foreground">
                                  - {repairOrder.device.initial_condition.description}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {repairOrder.device?.current_condition && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              État actuel
                            </label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: repairOrder.device.current_condition.color }}
                              />
                              <span className="font-medium">
                                {repairOrder.device.current_condition.name}
                              </span>
                              {repairOrder.device.current_condition.description && (
                                <span className="text-xs text-muted-foreground">
                                  - {repairOrder.device.current_condition.description}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {repairOrder.device?.pin_code && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Code PIN
                          </label>
                          <p className="text-base font-mono">
                            {repairOrder.device.pin_code}
                          </p>
                        </div>
                      )}
                      
                      {repairOrder.device?.sim_code && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Code SIM
                          </label>
                          <p className="text-base font-mono">
                            {repairOrder.device.sim_code}
                          </p>
                        </div>
                      )}
                      
                      {repairOrder.device?.initial_diagnosis && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Diagnostic initial
                          </label>
                          <p className="text-base bg-muted/50 p-3 rounded-md">
                            {repairOrder.device.initial_diagnosis}
                          </p>
                        </div>
                      )}
                      
                      {repairOrder.device?.security_notes && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Notes de sécurité
                          </label>
                          <p className="text-base bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border-l-4 border-yellow-400">
                            {repairOrder.device.security_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accessoires */}
                  {repairOrder.device?.accessories && repairOrder.device.accessories.length > 0 && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-muted-foreground">
                        Accessoires fournis
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {repairOrder.device.accessories.map((accessory, index) => (
                          <Badge key={index} variant="secondary">
                            {accessory}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepairOrderDetailsModal;