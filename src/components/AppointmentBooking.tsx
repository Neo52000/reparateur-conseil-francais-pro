
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppointmentBookingProps {
  repairerId: string;
  quoteId?: string;
  onSuccess?: () => void;
}

const AppointmentBooking = ({ repairerId, quoteId, onSuccess }: AppointmentBookingProps) => {
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);

      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          repairer_id: repairerId,
          quote_id: quoteId,
          appointment_date: appointmentDateTime.toISOString(),
          notes: formData.notes
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre rendez-vous a été réservé avec succès"
      });

      setFormData({
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réserver le rendez-vous",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Prendre rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment_date">Date</Label>
              <Input
                id="appointment_date"
                type="date"
                min={today}
                value={formData.appointment_date}
                onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="appointment_time">Heure</Label>
              <div className="relative">
                <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="appointment_time"
                  type="time"
                  min="08:00"
                  max="18:00"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Informations complémentaires..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Réservation en cours...' : 'Confirmer le rendez-vous'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;
