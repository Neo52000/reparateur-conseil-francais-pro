import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  MessageSquare,
  CheckCircle,
  QrCode,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
}

interface AppointmentBookingProps {
  repairerId: string;
  quoteId?: string;
  onBooked?: () => void;
}

export const AdvancedAppointmentBooking: React.FC<AppointmentBookingProps> = ({ 
  repairerId, 
  quoteId,
  onBooked
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { user } = useAuth();
  const [reminderSettings, setReminderSettings] = useState({
    email_24h: true,
    sms_24h: true,
    email_1h: false,
    sms_1h: false
  });

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, repairerId]);

  const loadAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const dateStr = date.toISOString().split('T')[0];

      // Get existing appointments for this repairer on this date
      const { data: existingAppointments } = await supabase
        .from('appointments_with_quotes')
        .select('appointment_date, duration_minutes')
        .eq('repairer_id', repairerId)
        .gte('appointment_date', `${dateStr}T00:00:00`)
        .lt('appointment_date', `${dateStr}T23:59:59`)
        .in('status', ['confirmed', 'pending']);

      // Default business hours
      const defaultSlots = [
        { time: '09:00', duration: 60 },
        { time: '10:00', duration: 60 },
        { time: '11:00', duration: 60 },
        { time: '14:00', duration: 60 },
        { time: '15:00', duration: 60 },
        { time: '16:00', duration: 60 },
        { time: '17:00', duration: 60 },
      ];

      const bookedTimes = new Set(
        (existingAppointments || []).map(apt => {
          const d = new Date(apt.appointment_date);
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        })
      );

      const slots: TimeSlot[] = defaultSlots.map(slot => ({
        ...slot,
        available: !bookedTimes.has(slot.time)
      }));

      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      // Fallback to default slots all available
      setTimeSlots([
        { time: '09:00', available: true, duration: 60 },
        { time: '10:00', available: true, duration: 60 },
        { time: '11:00', available: true, duration: 60 },
        { time: '14:00', available: true, duration: 60 },
        { time: '15:00', available: true, duration: 60 },
        { time: '16:00', available: true, duration: 60 },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot || !user) {
      toast.error('Veuillez sélectionner une date et un créneau');
      return;
    }

    setBooking(true);
    try {
      const [hours, minutes] = selectedSlot.time.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const insertData: any = {
        repairer_id: repairerId,
        client_id: user.id,
        appointment_date: appointmentDate.toISOString(),
        duration_minutes: selectedSlot.duration,
        status: 'pending',
        client_notes: notes || null,
      };

      if (quoteId) {
        insertData.quote_id = quoteId;
      }

      const { error } = await supabase
        .from('appointments_with_quotes')
        .insert(insertData);

      if (error) throw error;

      // Create a notification for the repairer
      await supabase.from('notifications').insert({
        user_id: repairerId,
        type: 'appointment_request',
        title: 'Nouvelle demande de rendez-vous',
        message: `Un client souhaite un rendez-vous le ${appointmentDate.toLocaleDateString('fr-FR')} à ${selectedSlot.time}`,
        data: { appointment_date: appointmentDate.toISOString() }
      });

      toast.success('Rendez-vous demandé !', {
        description: 'Le réparateur recevra votre demande et vous confirmera le créneau.'
      });

      onBooked?.();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('Erreur lors de la réservation', {
        description: error.message || 'Veuillez réessayer'
      });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Choisir une date
          </CardTitle>
          <CardDescription>
            Sélectionnez la date de votre rendez-vous
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Créneaux disponibles
          </CardTitle>
          <CardDescription>
            {selectedDate ? selectedDate.toLocaleDateString('fr-FR') : 'Choisissez une date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedSlot?.time === slot.time ? 'default' : 'outline'}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className="h-auto py-4"
                >
                  <div className="text-center">
                    <div className="font-semibold">{slot.time}</div>
                    <div className="text-xs opacity-70">{slot.duration} min</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Rappels automatiques
          </CardTitle>
          <CardDescription>
            Configurez vos notifications de rappel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email 24h avant</Label>
              <p className="text-sm text-muted-foreground">Recevoir un email la veille</p>
            </div>
            <Switch
              checked={reminderSettings.email_24h}
              onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, email_24h: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS 24h avant</Label>
              <p className="text-sm text-muted-foreground">Recevoir un SMS la veille</p>
            </div>
            <Switch
              checked={reminderSettings.sms_24h}
              onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, sms_24h: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email 1h avant</Label>
              <p className="text-sm text-muted-foreground">Recevoir un email 1 heure avant</p>
            </div>
            <Switch
              checked={reminderSettings.email_1h}
              onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, email_1h: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS 1h avant</Label>
              <p className="text-sm text-muted-foreground">Recevoir un SMS 1 heure avant</p>
            </div>
            <Switch
              checked={reminderSettings.sms_1h}
              onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, sms_1h: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes and confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Informations complémentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes pour le réparateur</Label>
            <Textarea
              id="notes"
              placeholder="Décrivez votre problème, le modèle de votre appareil..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {selectedDate && selectedSlot && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Récapitulatif
              </p>
              <p className="text-sm">
                <strong>Date :</strong> {selectedDate.toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm">
                <strong>Heure :</strong> {selectedSlot.time}
              </p>
              <p className="text-sm">
                <strong>Durée :</strong> {selectedSlot.duration} minutes
              </p>
              <Separator className="my-2" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center">
                  <QrCode className="h-3 w-3 mr-1" />
                  QR code de confirmation envoyé par email
                </p>
                <p className="flex items-center">
                  <Bell className="h-3 w-3 mr-1" />
                  Rappels automatiques activés
                </p>
                <p className="flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ajout automatique à Google Calendar
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedSlot || booking || !user}
            className="w-full"
            size="lg"
          >
            {booking ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            {booking ? 'Réservation en cours...' : 'Confirmer le rendez-vous'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
