import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  client_notes: string;
  repairer_notes: string;
  quote_id: string;
  repairer_id: string;
  contact_preference: string | null;
  quote: {
    device_brand: string;
    device_model: string;
    repair_type: string;
    estimated_price: number;
    repairer_name: string;
  };
}

const statusConfig = {
  scheduled: { label: 'Planifié', icon: Calendar, color: 'bg-blue-500' },
  confirmed: { label: 'Confirmé', icon: CheckCircle, color: 'bg-green-500' },
  in_progress: { label: 'En cours', icon: Clock, color: 'bg-yellow-500' },
  completed: { label: 'Terminé', icon: CheckCircle, color: 'bg-green-600' },
  cancelled: { label: 'Annulé', icon: AlertCircle, color: 'bg-red-500' }
};

export const ClientAppointments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments_with_quotes')
        .select(`
          *,
          quotes_with_timeline!inner(
            device_brand,
            device_model,
            repair_type,
            estimated_price
          )
        `)
        .eq('client_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface
      const transformedData = data?.map(apt => ({
        id: apt.id,
        appointment_date: apt.appointment_date,
        duration_minutes: apt.duration_minutes,
        status: apt.status,
        client_notes: apt.client_notes || '',
        repairer_notes: apt.repairer_notes || '',
        quote_id: apt.quote_id,
        repairer_id: apt.repairer_id,
        contact_preference: null, // Sera ajouté plus tard
        quote: {
          device_brand: apt.quotes_with_timeline.device_brand,
          device_model: apt.quotes_with_timeline.device_model,
          repair_type: apt.quotes_with_timeline.repair_type,
          estimated_price: apt.quotes_with_timeline.estimated_price,
          repairer_name: 'Réparateur' // TODO: récupérer le nom du réparateur
        }
      })) || [];

      setAppointments(transformedData);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filterAppointmentsByStatus = (status: string) => {
    const now = new Date();
    
    switch (status) {
      case 'upcoming':
        return appointments.filter(apt => 
          new Date(apt.appointment_date) > now && 
          ['scheduled', 'confirmed'].includes(apt.status)
        );
      case 'past':
        return appointments.filter(apt => 
          new Date(apt.appointment_date) < now || 
          ['completed', 'cancelled'].includes(apt.status)
        );
      default:
        return appointments;
    }
  };

  const isUpcoming = (appointmentDate: string) => {
    return new Date(appointmentDate) > new Date();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  const upcomingCount = filterAppointmentsByStatus('upcoming').length;
  const pastCount = filterAppointmentsByStatus('past').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
        <div className="text-sm text-muted-foreground">
          {appointments.length} rendez-vous au total
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">À venir</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Historique</p>
                <p className="text-2xl font-bold">{pastCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des rendez-vous */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">À venir ({upcomingCount})</TabsTrigger>
          <TabsTrigger value="past">Historique ({pastCount})</TabsTrigger>
          <TabsTrigger value="all">Tous ({appointments.length})</TabsTrigger>
        </TabsList>

        {['upcoming', 'past', 'all'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterAppointmentsByStatus(status).map(appointment => (
              <Card key={appointment.id} className={`transition-all ${
                isUpcoming(appointment.appointment_date) ? 'border-blue-200 bg-blue-50/50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">
                          {appointment.quote.device_brand} {appointment.quote.device_model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {appointment.quote.repair_type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {format(new Date(appointment.appointment_date), 'EEEE d MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(appointment.appointment_date), 'HH:mm')} 
                          ({appointment.duration_minutes} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>{appointment.quote.repairer_name}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Prix: {appointment.quote.estimated_price}€</span>
                      </div>
                      {appointment.contact_preference && (
                        <div className="flex items-center gap-2 text-sm">
                          {appointment.contact_preference === 'phone' && <Phone className="h-4 w-4" />}
                          {appointment.contact_preference === 'email' && <Mail className="h-4 w-4" />}
                          <span>Contact préféré: {
                            appointment.contact_preference === 'phone' ? 'Téléphone' :
                            appointment.contact_preference === 'email' ? 'Email' : 'SMS'
                          }</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {appointment.client_notes && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Vos notes:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {appointment.client_notes}
                      </p>
                    </div>
                  )}

                  {appointment.repairer_notes && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Notes du réparateur:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {appointment.repairer_notes}
                      </p>
                    </div>
                  )}

                  {isUpcoming(appointment.appointment_date) && appointment.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm">
                        Annuler
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filterAppointmentsByStatus(status).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {status === 'upcoming' ? 'Aucun rendez-vous à venir' :
                     status === 'past' ? 'Aucun rendez-vous dans l\'historique' :
                     'Aucun rendez-vous'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};