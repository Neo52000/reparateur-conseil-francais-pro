import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RepairTracking {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  estimated_completion?: string;
  device: {
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    custom_device_info?: string;
    initial_diagnosis?: string;
    estimated_cost?: number;
  };
}

const RepairTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [repair, setRepair] = useState<RepairTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepairStatus = async () => {
      if (!orderId) {
        setError('ID de réparation manquant');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('repair_orders')
          .select(`
            id,
            order_number,
            status,
            created_at,
            updated_at,
            
            device:repair_devices(
              customer_name,
              customer_phone,
              customer_email,
              custom_device_info,
              initial_diagnosis,
              estimated_cost
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) {
          setError('Réparation non trouvée');
          return;
        }

        setRepair(data as RepairTracking);
      } catch (err) {
        console.error('Error fetching repair:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchRepairStatus();
  }, [orderId]);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
      diagnostic: {
        label: 'Diagnostic en cours',
        color: 'bg-blue-500',
        icon: <AlertCircle className="w-4 h-4" />,
        description: 'Votre appareil est en cours de diagnostic'
      },
      quote_pending: {
        label: 'Devis en attente',
        color: 'bg-yellow-500',
        icon: <Clock className="w-4 h-4" />,
        description: 'Un devis vous sera envoyé prochainement'
      },
      quote_accepted: {
        label: 'Devis accepté',
        color: 'bg-orange-500',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Réparation programmée'
      },
      in_progress: {
        label: 'Réparation en cours',
        color: 'bg-purple-500',
        icon: <Clock className="w-4 h-4" />,
        description: 'Votre appareil est en cours de réparation'
      },
      waiting_parts: {
        label: 'Attente de pièces',
        color: 'bg-red-500',
        icon: <Clock className="w-4 h-4" />,
        description: 'En attente de réception des pièces détachées'
      },
      testing: {
        label: 'Tests en cours',
        color: 'bg-indigo-500',
        icon: <Clock className="w-4 h-4" />,
        description: 'Tests de fonctionnement en cours'
      },
      completed: {
        label: 'Réparation terminée',
        color: 'bg-green-500',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Réparation terminée avec succès'
      },
      ready_pickup: {
        label: 'Prêt à récupérer',
        color: 'bg-emerald-500',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Votre appareil est prêt à être récupéré'
      },
      delivered: {
        label: 'Livré',
        color: 'bg-gray-500',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Appareil livré au client'
      },
      cancelled: {
        label: 'Annulé',
        color: 'bg-red-600',
        icon: <AlertCircle className="w-4 h-4" />,
        description: 'Réparation annulée'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'bg-gray-400',
      icon: <AlertCircle className="w-4 h-4" />,
      description: 'Statut inconnu'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Chargement du suivi...</p>
        </div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Réparation non trouvée</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'Cette réparation n\'existe pas ou n\'est plus accessible.'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(repair.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Suivi de Réparation
            </h1>
            <p className="text-lg text-gray-600">
              Ordre N° {repair.order_number}
            </p>
          </div>

          {/* Status Card */}
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${statusInfo.color} text-white`}>
                  {statusInfo.icon}
                </div>
                <div>
                  <CardTitle className="text-2xl">{statusInfo.label}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {statusInfo.description}
                  </p>
                </div>
              </div>
              <Badge className={`${statusInfo.color} text-white text-sm px-4 py-1`}>
                Mis à jour {formatDistanceToNow(new Date(repair.updated_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </Badge>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Votre Appareil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {repair.device.custom_device_info && (
                  <div>
                    <span className="font-medium">Appareil:</span>
                    <p className="text-muted-foreground">{repair.device.custom_device_info}</p>
                  </div>
                )}
                {repair.device.initial_diagnosis && (
                  <div>
                    <span className="font-medium">Problème rapporté:</span>
                    <p className="text-muted-foreground">{repair.device.initial_diagnosis}</p>
                  </div>
                )}
                {repair.device.estimated_cost && (
                  <div>
                    <span className="font-medium">Estimation:</span>
                    <p className="text-lg font-semibold text-green-600">
                      {repair.device.estimated_cost}€
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Chronologie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Réparation créée</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(repair.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 ${statusInfo.color} rounded-full mt-2`}></div>
                  <div>
                    <p className="font-medium">{statusInfo.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(repair.updated_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>

                {repair.estimated_completion && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Livraison prévue</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(repair.estimated_completion).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Nous Contacter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>01 23 45 67 89</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>contact@reparation-mobile.fr</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Lun-Ven 9h-18h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          {repair.status === 'ready_pickup' && (
            <div className="text-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                Votre appareil est prêt !
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Vous pouvez venir récupérer votre appareil
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairTrackingPage;