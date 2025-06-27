
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
  quoteId?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  repairerId,
  quoteId
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Générer les créneaux horaires disponibles
  useEffect(() => {
    if (selectedDate) {
      // Simuler des créneaux disponibles (à remplacer par une vraie logique)
      const slots = [];
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 17) {
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
      setAvailableSlots(slots);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour prendre rendez-vous",
          variant: "destructive"
        });
        return;
      }

      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const appointmentData = {
        client_id: user.id,
        repairer_id: repairerId,
        appointment_date: appointmentDateTime.toISOString(),
        client_notes: notes,
        ...(quoteId && { quote_id: quoteId })
      };

      const { error } = await supabase
        .from('appointments_with_quotes')
        .insert([appointmentData]);

      if (error) throw error;

      // Créer une notification pour le réparateur
      await supabase
        .from('notifications_system')
        .insert([{
          user_id: repairerId,
          user_type: 'repairer',
          notification_type: 'appointment_booked',
          title: 'Nouveau rendez-vous',
          message: `Rendez-vous programmé le ${appointmentDateTime.toLocaleDateString('fr-FR')} à ${selectedTime}`
        }]);

      toast({
        title: "Rendez-vous confirmé !",
        description: "Votre rendez-vous a été programmé avec succès."
      });

      onClose();
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2); // 2 mois à l'avance

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Prendre rendez-vous
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Label>Sélectionnez une date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < today || date > maxDate}
                className="rounded-md border"
              />
            </div>

            {/* Time slots */}
            <div>
              <Label>Créneaux disponibles</Label>
              {selectedDate ? (
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={selectedTime === slot ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot)}
                      className="text-sm"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {slot}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Sélectionnez d'abord une date
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedDate || !selectedTime}
            >
              {loading ? 'Confirmation...' : 'Confirmer le rendez-vous'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
