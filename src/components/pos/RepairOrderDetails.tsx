import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Smartphone, 
  FileText, 
  Clock, 
  Euro, 
  Package, 
  CheckCircle,
  PlayCircle,
  Pause,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRepairManagement, type RepairOrder, type RepairStatus } from '@/hooks/useRepairManagement';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RepairOrderDetailsProps {
  orderId: string;
  onClose: () => void;
}

const RepairOrderDetails: React.FC<RepairOrderDetailsProps> = ({
  orderId,
  onClose,
}) => {
  const { updateRepairStatus } = useRepairManagement();
  const { toast } = useToast();
  const [order, setOrder] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Load order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('repair_orders')
          .select(`
            *,
            device:repair_devices(*)
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data as RepairOrder);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de la réparation.',
          variant: 'destructive',
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, onClose, toast]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      diagnostic: 'bg-blue-500',
      quote_pending: 'bg-yellow-500',
      quote_accepted: 'bg-orange-500',
      in_progress: 'bg-purple-500',
      waiting_parts: 'bg-red-500',
      testing: 'bg-indigo-500',
      completed: 'bg-green-500',
      ready_pickup: 'bg-emerald-500',
      delivered: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
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
    return labels[status] || status;
  };

  const handleStatusChange = async (newStatus: RepairStatus) => {
    if (!order) return;

    const updates: Partial<RepairOrder> = {};
    
    if (newStatus === 'in_progress' && order.status !== 'in_progress') {
      updates.started_at = new Date().toISOString();
      setIsTimerRunning(true);
    }
    
    if (newStatus === 'completed' && order.status === 'in_progress') {
      updates.completed_at = new Date().toISOString();
      updates.time_spent_minutes = (order.time_spent_minutes || 0) + currentTime;
      setIsTimerRunning(false);
    }

    await updateRepairStatus(order.id, newStatus, updates);
    
    // Refresh order data
    const { data } = await supabase
      .from('repair_orders')
      .select(`*, device:repair_devices(*)`)
      .eq('id', orderId)
      .single();
    
    if (data) setOrder(data as RepairOrder);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}m`;
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Settings className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Chargement...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const nextStatusOptions: Record<RepairStatus, RepairStatus[]> = {
    diagnostic: ['quote_pending', 'cancelled'],
    quote_pending: ['quote_accepted', 'cancelled'],
    quote_accepted: ['in_progress', 'cancelled'],
    in_progress: ['waiting_parts', 'testing', 'completed'],
    waiting_parts: ['in_progress', 'cancelled'],
    testing: ['completed', 'in_progress'],
    completed: ['ready_pickup', 'warranty_return'],
    ready_pickup: ['delivered'],
    delivered: [],
    cancelled: [],
    warranty_return: ['in_progress']
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Réparation {order.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {getStatusLabel(order.status)}
              </Badge>
              
              {isTimerRunning && (
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">
                    En cours - {formatTime(currentTime)}
                  </span>
                </div>
              )}
              
              {order.time_spent_minutes > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Temps total: {formatTime(order.time_spent_minutes)}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {nextStatusOptions[order.status].map((nextStatus) => (
                <Button
                  key={nextStatus}
                  size="sm"
                  variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
                  onClick={() => handleStatusChange(nextStatus)}
                >
                  {nextStatus === 'in_progress' && <PlayCircle className="w-3 h-3 mr-1" />}
                  {nextStatus === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {getStatusLabel(nextStatus)}
                </Button>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnostic</TabsTrigger>
              <TabsTrigger value="parts">Pièces</TabsTrigger>
              <TabsTrigger value="timeline">Historique</TabsTrigger>
              <TabsTrigger value="customer">Client</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Informations Appareil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Appareil</Label>
                      <p>{order.device?.custom_device_info || 'Non spécifié'}</p>
                    </div>
                    {order.device?.imei_serial && (
                      <div>
                        <Label className="text-sm font-medium">IMEI/Série</Label>
                        <p className="font-mono text-sm">{order.device.imei_serial}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">État initial</Label>
                      <p>État rapporté par le client</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      Informations Financières
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.device?.estimated_cost && (
                      <div>
                        <Label className="text-sm font-medium">Estimation initiale</Label>
                        <p className="text-lg font-semibold">{order.device.estimated_cost}€</p>
                      </div>
                    )}
                    {order.quote_amount && (
                      <div>
                        <Label className="text-sm font-medium">Montant du devis</Label>
                        <p className="text-lg font-semibold text-green-600">{order.quote_amount}€</p>
                      </div>
                    )}
                    {order.final_amount && (
                      <div>
                        <Label className="text-sm font-medium">Montant final</Label>
                        <p className="text-lg font-semibold">{order.final_amount}€</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Diagnosis Tab */}
            <TabsContent value="diagnosis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Diagnostic et Notes Techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="initial_diagnosis">Problème initial rapporté</Label>
                    <Textarea
                      id="initial_diagnosis"
                      value={order.device?.initial_diagnosis || ''}
                      readOnly
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="technician_notes">Notes du technicien</Label>
                    <Textarea
                      id="technician_notes"
                      value={order.technician_notes || ''}
                      placeholder="Ajouter des notes techniques..."
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="internal_notes">Notes internes</Label>
                    <Textarea
                      id="internal_notes"
                      value={order.internal_notes || ''}
                      placeholder="Notes internes (non visibles par le client)..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts Tab */}
            <TabsContent value="parts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Pièces Détachées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune pièce ajoutée pour le moment</p>
                    <Button className="mt-4" size="sm">
                      Ajouter une pièce
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique de la Réparation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Réparation créée</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(order.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {order.started_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        <div>
                          <p className="font-medium">Réparation démarrée</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(order.started_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {order.completed_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div>
                          <p className="font-medium">Réparation terminée</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(order.completed_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customer Tab */}
            <TabsContent value="customer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informations Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom</Label>
                      <p className="font-medium">{order.device?.customer_name}</p>
                    </div>
                    {order.device?.customer_phone && (
                      <div>
                        <Label>Téléphone</Label>
                        <p className="font-medium">{order.device.customer_phone}</p>
                      </div>
                    )}
                  </div>
                  
                  {order.device?.customer_email && (
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{order.device.customer_email}</p>
                    </div>
                  )}
                  
                  {order.device?.customer_notes && (
                    <div>
                      <Label>Notes client</Label>
                      <p className="text-sm bg-muted p-3 rounded">
                        {order.device.customer_notes}
                      </p>
                    </div>
                  )}

                  {order.device?.accessories && order.device.accessories.length > 0 && (
                    <div>
                      <Label>Accessoires fournis</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {order.device.accessories.map((accessory, index) => (
                          <Badge key={index} variant="outline">
                            {accessory}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepairOrderDetails;