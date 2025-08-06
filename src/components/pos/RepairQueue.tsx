import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2,
  Package,
  PlayCircle,
  Pause
} from 'lucide-react';
import { type RepairOrder } from '@/hooks/useRepairManagement';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RepairQueueProps {
  orders: RepairOrder[];
  onSelectOrder: (orderId: string) => void;
}

const RepairQueue: React.FC<RepairQueueProps> = ({
  orders,
  onSelectOrder,
}) => {
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

  const getPriorityIcon = (priority: number) => {
    if (priority === 3) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (priority === 2) return <Clock className="w-4 h-4 text-orange-500" />;
    return null;
  };

  const getPriorityLabel = (priority: number) => {
    const labels: Record<number, string> = {
      1: 'Normal',
      2: 'Urgent',
      3: 'Express'
    };
    return labels[priority] || 'Normal';
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune réparation dans cette catégorie</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  <span className="font-mono text-sm font-medium">
                    {order.order_number}
                  </span>
                  {getPriorityIcon(order.priority)}
                  <span className="text-sm text-muted-foreground">
                    {getPriorityLabel(order.priority)}
                  </span>
                </div>

                {/* Customer and Device Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.device?.customer_name}</p>
                      {order.device?.customer_phone && (
                        <p className="text-sm text-muted-foreground">
                          {order.device.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {order.device?.custom_device_info || 'Appareil non spécifié'}
                      </p>
                      {order.device?.imei_serial && (
                        <p className="text-sm text-muted-foreground font-mono">
                          {order.device.imei_serial}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagnosis and timing */}
                <div className="space-y-2">
                  {order.device?.initial_diagnosis && (
                    <p className="text-sm bg-muted p-2 rounded">
                      <strong>Diagnostic :</strong> {order.device.initial_diagnosis}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Créé {formatDistanceToNow(new Date(order.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </div>
                    
                    {order.quote_amount && (
                      <div className="font-medium text-foreground">
                        Devis: {order.quote_amount}€
                      </div>
                    )}

                    {order.time_spent_minutes > 0 && (
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        {Math.floor(order.time_spent_minutes / 60)}h{order.time_spent_minutes % 60}m
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => onSelectOrder(order.id)}
                >
                  Ouvrir
                </Button>
                
                {order.status === 'quote_accepted' && (
                  <Button size="sm" variant="outline">
                    <PlayCircle className="w-3 h-3 mr-1" />
                    Démarrer
                  </Button>
                )}
                
                {order.status === 'in_progress' && (
                  <Button size="sm" variant="outline">
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                )}
                
                {order.status === 'completed' && (
                  <Button size="sm" variant="outline">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Livrer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RepairQueue;