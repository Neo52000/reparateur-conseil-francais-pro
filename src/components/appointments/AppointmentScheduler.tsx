import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Quote {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  estimated_price: number;
  repair_duration: string;
}

interface AppointmentSchedulerProps {
  quote: Quote;
  repairerId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  quote,
  repairerId,
  onSuccess,
  onBack
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    client_notes: '',
    address: '',
    contact_preference: 'phone'
  });

  // Créneaux horaires disponibles (9h-18h)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Récupérer les RDV existants pour cette date
      const { data: existingAppointments, error } = await supabase
        .from('appointments_with_quotes')
        .select('appointment_date')
        .eq('repairer_id', repairerId)
        .gte('appointment_date', `${dateStr}T00:00:00`)
        .lt('appointment_date', `${dateStr}T23:59:59`);

      if (error) throw error;

      // Extraire les créneaux occupés
      const bookedTimes = existingAppointments?.map(apt => 
        format(new Date(apt.appointment_date), 'HH:mm')
      ) || [];

      // Filtrer les créneaux disponibles
      const available = timeSlots.filter(slot => !bookedTimes.includes(slot));
      setAvailableSlots(available);
    } catch (error) {
      console.error('Erreur:', error);
      setAvailableSlots(timeSlots); // En cas d'erreur, montrer tous les créneaux
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Date et heure requises",
        description: "Veuillez sélectionner une date et un créneau horaire",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Créer la date/heure du RDV
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Créer le rendez-vous
      const { error: appointmentError } = await supabase
        .from('appointments_with_quotes')
        .insert({
          quote_id: quote.id,
          client_id: quote.client_id,
          repairer_id: repairerId,
          appointment_date: appointmentDateTime.toISOString(),
          duration_minutes: getDurationMinutes(quote.repair_duration),
          status: 'scheduled',
          client_notes: formData.client_notes,
          contact_preference: formData.contact_preference
        });

      if (appointmentError) throw appointmentError;

      // Mettre à jour le statut du devis
      const { error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .update({ 
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      toast({
        title: "Rendez-vous planifié !",
        description: `RDV confirmé le ${format(appointmentDateTime, 'EEEE d MMMM à HH:mm', { locale: fr })}`
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de planifier le rendez-vous. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDurationMinutes = (duration?: string): number => {
    if (!duration) return 60;
    
    if (duration.includes('30 minutes')) return 30;
    if (duration.includes('1 heure')) return 60;
    if (duration.includes('2 heures')) return 120;
    if (duration.includes('Demi-journée')) return 240;
    if (duration.includes('1 jour')) return 480;
    
    return 60; // Par défaut
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Désactiver les weekends et les dates passées
    const dayOfWeek = date.getDay();
    return date < today || dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Retour
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Planifier le rendez-vous</h2>
          <p className="text-muted-foreground">
            Devis accepté - {quote.device_brand} {quote.device_model}
          </p>
        </div>
      </div>

      {/* Résumé du devis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Devis accepté
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{quote.client_name || 'Client'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Durée: {quote.repair_duration || '1 heure'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-lg">{quote.estimated_price}€</span>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de planification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Choisir la date et l'heure
          </CardTitle>
          <CardDescription>
            Sélectionnez un créneau disponible pour la réparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection de date */}
            <div className="space-y-4">
              <Label>Date du rendez-vous *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionnez une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sélection d'heure */}
            {selectedDate && (
              <div className="space-y-4">
                <Label>Créneau horaire *</Label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot}
                        type="button"
                        variant={selectedTime === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(slot)}
                        className="text-sm"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Aucun créneau disponible ce jour-là</span>
                  </div>
                )}
              </div>
            )}

            {/* Informations complémentaires */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations complémentaires</h3>
              
              <div className="space-y-2">
                <Label htmlFor="contact_preference">Méthode de contact préférée</Label>
                <Select value={formData.contact_preference} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, contact_preference: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">📞 Téléphone</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="sms">💬 SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_notes">Notes pour le réparateur</Label>
                <Textarea
                  id="client_notes"
                  value={formData.client_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_notes: e.target.value }))}
                  placeholder="Informations complémentaires, adresse précise, code d'accès..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !selectedDate || !selectedTime}
                className="flex-1"
              >
                {loading ? "Planification..." : "Confirmer le rendez-vous"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};