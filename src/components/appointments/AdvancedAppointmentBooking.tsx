import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  Mail, 
  MessageSquare,
  CheckCircle,
  QrCode,
  ExternalLink
} from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
}

interface AppointmentBookingProps {
  repairerId: string;
  quoteId?: string;
}

export const AdvancedAppointmentBooking: React.FC<AppointmentBookingProps> = ({ 
  repairerId, 
  quoteId 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [reminderSettings, setReminderSettings] = useState({
    email_24h: true,
    sms_24h: true,
    email_1h: false,
    sms_1h: false
  });

  // Mock time slots - en production, à charger depuis l'API
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true, duration: 60 },
    { time: '10:00', available: true, duration: 60 },
    { time: '11:00', available: false, duration: 60 },
    { time: '14:00', available: true, duration: 60 },
    { time: '15:00', available: true, duration: 60 },
    { time: '16:00', available: true, duration: 60 },
  ];

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Veuillez sélectionner une date et un créneau');
      return;
    }

    try {
      // TODO: Appel API pour créer le rendez-vous
      toast.success('Rendez-vous confirmé !', {
        description: 'Un email de confirmation vous a été envoyé avec le QR code.'
      });
    } catch (error) {
      toast.error('Erreur lors de la réservation');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendrier */}
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

      {/* Créneaux horaires */}
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
        </CardContent>
      </Card>

      {/* Paramètres de rappel */}
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
              <p className="text-sm text-muted-foreground">
                Recevoir un email la veille
              </p>
            </div>
            <Switch
              checked={reminderSettings.email_24h}
              onCheckedChange={(checked) =>
                setReminderSettings({ ...reminderSettings, email_24h: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS 24h avant</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un SMS la veille
              </p>
            </div>
            <Switch
              checked={reminderSettings.sms_24h}
              onCheckedChange={(checked) =>
                setReminderSettings({ ...reminderSettings, sms_24h: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email 1h avant</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un email 1 heure avant
              </p>
            </div>
            <Switch
              checked={reminderSettings.email_1h}
              onCheckedChange={(checked) =>
                setReminderSettings({ ...reminderSettings, email_1h: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS 1h avant</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un SMS 1 heure avant
              </p>
            </div>
            <Switch
              checked={reminderSettings.sms_1h}
              onCheckedChange={(checked) =>
                setReminderSettings({ ...reminderSettings, sms_1h: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes et confirmation */}
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
              placeholder="Ajoutez des informations importantes..."
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
            disabled={!selectedDate || !selectedSlot}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Confirmer le rendez-vous
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
