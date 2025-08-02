import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText,
  CreditCard,
  CheckCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  repairer_id: string;
}

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: TimeSlot;
  repairerName: string;
  onBookingConfirmed?: () => void;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  repairerName,
  onBookingConfirmed
}) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Confirmation, 3: Paiement, 4: Succès
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    deviceInfo: "",
    issueDescription: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, 'EEEE dd MMMM yyyy', { locale: fr }),
      time: format(date, 'HH:mm', { locale: fr })
    };
  };

  const { date: formattedDate, time: startTime } = formatDateTime(selectedSlot.start_time);
  const { time: endTime } = formatDateTime(selectedSlot.end_time);

  const handleSubmit = async () => {
    if (step === 1) {
      // Validation des données
      if (!formData.clientName || !formData.clientPhone || !formData.deviceInfo || !formData.issueDescription) {
        toast({
          title: "Informations manquantes",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Simuler le processus de paiement
      setIsSubmitting(true);
      
      try {
        // Simulation d'un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // TODO: Intégrer avec le vrai système de paiement
        console.log('Réservation confirmée:', {
          slot: selectedSlot,
          formData,
          repairer: repairerName
        });
        
        setStep(4);
        toast({
          title: "Rendez-vous confirmé !",
          description: "Votre réservation a été confirmée avec succès",
        });
        
        onBookingConfirmed?.();
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la réservation",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 4) {
      onClose();
      setStep(1);
      setFormData({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        deviceInfo: "",
        issueDescription: "",
        notes: ""
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{repairerName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{startTime} - {endTime}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Sélectionné</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom complet *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Votre nom et prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Téléphone *</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email (optionnel)</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceInfo">Appareil à réparer *</Label>
              <Input
                id="deviceInfo"
                value={formData.deviceInfo}
                onChange={(e) => handleInputChange('deviceInfo', e.target.value)}
                placeholder="ex: iPhone 14 Pro, Samsung Galaxy S23..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDescription">Description du problème *</Label>
              <Textarea
                id="issueDescription"
                value={formData.issueDescription}
                onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                placeholder="Décrivez le problème rencontré avec votre appareil..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informations supplémentaires..."
                rows={2}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Confirmez votre rendez-vous</h3>
              <p className="text-muted-foreground">Vérifiez les informations avant de procéder au paiement</p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formData.clientName}</p>
                    <p className="text-sm text-muted-foreground">{formData.clientPhone}</p>
                    {formData.clientEmail && (
                      <p className="text-sm text-muted-foreground">{formData.clientEmail}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{startTime} - {endTime}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{formData.deviceInfo}</p>
                    <p className="text-sm text-muted-foreground">{formData.issueDescription}</p>
                    {formData.notes && (
                      <p className="text-sm text-muted-foreground mt-1">Notes: {formData.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Frais de réservation</span>
                  <span className="text-lg font-semibold">20,00 €</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Déduits du montant total de la réparation
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Paiement sécurisé</h3>
              <p className="text-muted-foreground">Votre paiement est sécurisé et protégé</p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Réservation de créneau</span>
                    <span>20,00 €</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>20,00 €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Garantie de satisfaction</p>
                  <p className="text-blue-700">
                    Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Rendez-vous confirmé !
              </h3>
              <p className="text-muted-foreground">
                Votre réservation a été confirmée avec succès
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Réparateur</span>
                    <span className="font-medium">{repairerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Heure</span>
                    <span className="font-medium">{startTime} - {endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Référence</span>
                    <span className="font-medium">RDV-{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                Un SMS de confirmation sera envoyé au {formData.clientPhone}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Informations du rendez-vous";
      case 2: return "Confirmation";
      case 3: return "Paiement";
      case 4: return "Succès";
      default: return "";
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 1: return "Continuer";
      case 2: return "Procéder au paiement";
      case 3: return isSubmitting ? "Traitement..." : "Confirmer le paiement";
      case 4: return "Fermer";
      default: return "Continuer";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </DialogHeader>

        {/* Indicateur d'étapes */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-8 h-px mx-2 ${
                    stepNumber < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {renderStepContent()}

        <div className="flex justify-between pt-6">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          )}
          <div className="flex-1" />
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={step === 4 ? "w-full" : ""}
          >
            {getButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;