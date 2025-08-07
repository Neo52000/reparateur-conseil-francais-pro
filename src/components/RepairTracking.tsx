
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrackingItem {
  id: string;
  status: string;
  status_message: string;
  estimated_completion: string;
  created_at: string;
  repairer_id: string;
}

interface RepairTrackingProps {
  quoteId: string;
  subscription?: string;
}

const RepairTracking = ({ quoteId, subscription }: RepairTrackingProps) => {
  const [tracking, setTracking] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccessToTracking = subscription === 'premium' || subscription === 'enterprise';

  useEffect(() => {
    if (hasAccessToTracking) {
      fetchTracking();
    }
  }, [quoteId, hasAccessToTracking]);

  const fetchTracking = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_tracking')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTracking(data || []);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'received': { label: 'Reçu', icon: Package, color: 'bg-blue-500', progress: 10 },
      'diagnosed': { label: 'Diagnostiqué', icon: CheckCircle, color: 'bg-orange-500', progress: 25 },
      'parts_ordered': { label: 'Pièces commandées', icon: Clock, color: 'bg-yellow-500', progress: 40 },
      'in_repair': { label: 'En réparation', icon: AlertCircle, color: 'bg-purple-500', progress: 65 },
      'testing': { label: 'Test en cours', icon: CheckCircle, color: 'bg-indigo-500', progress: 85 },
      'completed': { label: 'Terminé', icon: CheckCircle, color: 'bg-green-500', progress: 95 },
      'ready_pickup': { label: 'Prêt à récupérer', icon: CheckCircle, color: 'bg-green-600', progress: 100 }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.received;
  };

  if (!hasAccessToTracking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Suivi de réparation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">Fonctionnalité Premium</h3>
              <p className="text-gray-600 mt-2">
                Le suivi en temps réel est disponible avec les abonnements Premium et Enterprise.
              </p>
            </div>
            <Badge variant="outline">Disponible avec Premium (14.90€/mois)</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suivi de réparation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Chargement du suivi...</div>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = tracking[tracking.length - 1];
  const statusInfo = currentStatus ? getStatusInfo(currentStatus.status) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Suivi de réparation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tracking.length > 0 ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            {statusInfo && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progression</span>
                  <span className="text-sm text-gray-600">{statusInfo.progress}%</span>
                </div>
                <Progress value={statusInfo.progress} className="w-full" />
              </div>
            )}

            {/* Current Status */}
            {currentStatus && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${statusInfo?.color} text-white`}>
                    {statusInfo && <statusInfo.icon className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{statusInfo?.label}</h3>
                    {currentStatus.status_message && (
                      <p className="text-sm text-gray-600">{currentStatus.status_message}</p>
                    )}
                    {currentStatus.estimated_completion && (
                      <p className="text-sm text-blue-600">
                        Fin estimée: {new Date(currentStatus.estimated_completion).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold">Historique</h4>
              {tracking.map((item, index) => {
                const info = getStatusInfo(item.status);
                return (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${info.color} text-white mt-1`}>
                      <info.icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{info.label}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {item.status_message && (
                        <p className="text-sm text-gray-600 mt-1">{item.status_message}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun suivi disponible pour cette réparation
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepairTracking;
