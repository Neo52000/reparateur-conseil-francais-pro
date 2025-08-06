import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  Package, 
  AlertTriangle,
  User,
  Smartphone,
  FileText
} from 'lucide-react';
import { useRepairManagement } from '@/hooks/useRepairManagement';
import DeviceIntakeModal from './DeviceIntakeModal';
import RepairQueue from './RepairQueue';
import RepairOrderDetailsModal from './RepairOrderDetailsModal';

const RepairManagement: React.FC = () => {
  const { repairOrders, loading, getRepairsByStatus, getRepairStats, updateRepairStatus } = useRepairManagement();
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('queue');

  const stats = getRepairStats();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Wrench className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Chargement des réparations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Gestion des Réparations</h2>
        </div>
        <Button onClick={() => setShowIntakeModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvel Appareil
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.totalRepairs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prêtes</p>
                <p className="text-2xl font-bold">{stats.readyForPickup}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">File d'attente</TabsTrigger>
          <TabsTrigger value="progress">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
          <TabsTrigger value="pickup">Prêtes</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <RepairQueue 
            orders={getRepairsByStatus('diagnostic').concat(getRepairsByStatus('quote_pending'))}
            onSelectOrder={setSelectedOrderId}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <RepairQueue 
            orders={getRepairsByStatus('in_progress')
              .concat(getRepairsByStatus('waiting_parts'))
              .concat(getRepairsByStatus('testing'))}
            onSelectOrder={setSelectedOrderId}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <RepairQueue 
            orders={getRepairsByStatus('completed')}
            onSelectOrder={setSelectedOrderId}
          />
        </TabsContent>

        <TabsContent value="pickup" className="space-y-4">
          <RepairQueue 
            orders={getRepairsByStatus('ready_pickup')}
            onSelectOrder={setSelectedOrderId}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <DeviceIntakeModal 
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
      />

      {selectedOrderId && (
        <RepairOrderDetailsModal
          repairOrder={repairOrders.find(order => order.id === selectedOrderId) || null}
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdate={updateRepairStatus}
        />
      )}
    </div>
  );
};

export default RepairManagement;