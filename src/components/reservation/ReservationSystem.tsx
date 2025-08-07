import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Repairer } from '@/types/repairer';

interface ReservationSystemProps {
  repairer: Repairer;
  onClose: () => void;
  onConfirm?: (reservationData: any) => void;
}

interface ReservationData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deviceType: string;
  problemDescription: string;
  preferredDate: Date | null;
  preferredTime: string;
  urgency: 'low' | 'medium' | 'high';
}

const ReservationSystem: React.FC<ReservationSystemProps> = ({
  repairer,
  onClose,
  onConfirm
}) => {
  const [step, setStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    deviceType: '',
    problemDescription: '',
    preferredDate: null,
    preferredTime: '',
    urgency: 'medium'
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const deviceTypes = [
    'Smartphone',
    'Tablette',
    'Ordinateur portable',
    'Ordinateur de bureau',
    'Console de jeu',
    'Autre'
  ];

  const handleSubmit = async () => {
    try {
      // Validation
      if (!reservationData.clientName || !reservationData.clientPhone || 
          !reservationData.deviceType || !reservationData.problemDescription ||
          !reservationData.preferredDate || !reservationData.preferredTime) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Create reservation object
      const reservation = {
        ...reservationData,
        repairerId: repairer.id,
        repairerName: repairer.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedPrice: null,
        confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase()
      };

      // Send to API (mock for now)
      console.log('Sending reservation:', reservation);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Demande de réservation envoyée ! Code: ${reservation.confirmationCode}`);
      
      if (onConfirm) {
        onConfirm(reservation);
      }
      
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
      console.error('Reservation error:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="h-5 w-5" />
        Vos informations
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nom complet *</label>
          <Input
            value={reservationData.clientName}
            onChange={(e) => setReservationData(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Votre nom et prénom"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Téléphone *</label>
          <Input
            value={reservationData.clientPhone}
            onChange={(e) => setReservationData(prev => ({ ...prev, clientPhone: e.target.value }))}
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          value={reservationData.clientEmail}
          onChange={(e) => setReservationData(prev => ({ ...prev, clientEmail: e.target.value }))}
          placeholder="votre@email.com"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Détails de la réparation
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type d'appareil *</label>
          <Select 
            value={reservationData.deviceType} 
            onValueChange={(value) => setReservationData(prev => ({ ...prev, deviceType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {deviceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Urgence</label>
          <Select 
            value={reservationData.urgency} 
            onValueChange={(value: 'low' | 'medium' | 'high') => setReservationData(prev => ({ ...prev, urgency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Normale</SelectItem>
              <SelectItem value="medium">Rapide</SelectItem>
              <SelectItem value="high">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description du problème *</label>
        <Textarea
          value={reservationData.problemDescription}
          onChange={(e) => setReservationData(prev => ({ ...prev, problemDescription: e.target.value }))}
          placeholder="Décrivez le problème en détail..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Date et heure souhaitées
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date préférée *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {reservationData.preferredDate ? (
                  format(reservationData.preferredDate, "PPP", { locale: fr })
                ) : (
                  "Sélectionner une date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={reservationData.preferredDate}
                onSelect={(date) => setReservationData(prev => ({ ...prev, preferredDate: date }))}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Créneau horaire *</label>
          <Select 
            value={reservationData.preferredTime} 
            onValueChange={(value) => setReservationData(prev => ({ ...prev, preferredTime: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner l'heure" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map(time => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Récapitulatif</h3>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Réparateur:</span>
              <span>{repairer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Client:</span>
              <span>{reservationData.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Téléphone:</span>
              <span>{reservationData.clientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Appareil:</span>
              <span>{reservationData.deviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>
                {reservationData.preferredDate && format(reservationData.preferredDate, "PPP", { locale: fr })} 
                {' à '}{reservationData.preferredTime}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="font-medium">Problème:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {reservationData.problemDescription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Réservation chez {repairer.name}</CardTitle>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Étape {step} sur 4</span>
            <span>{repairer.city}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={step === 1 ? onClose : () => setStep(prev => prev - 1)}
              className="flex-1"
            >
              {step === 1 ? 'Annuler' : 'Précédent'}
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={() => setStep(prev => prev + 1)}
                className="flex-1"
                disabled={
                  (step === 1 && (!reservationData.clientName || !reservationData.clientPhone)) ||
                  (step === 2 && (!reservationData.deviceType || !reservationData.problemDescription)) ||
                  (step === 3 && (!reservationData.preferredDate || !reservationData.preferredTime))
                }
              >
                Suivant
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1">
                Confirmer la demande
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationSystem;