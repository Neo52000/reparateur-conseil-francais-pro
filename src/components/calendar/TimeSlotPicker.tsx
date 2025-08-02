import React, { useState, useEffect } from "react";
import { format, addDays, isSameDay, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, CheckCircle } from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  repairer_id: string;
}

interface TimeSlotPickerProps {
  selectedDate: Date;
  repairerId: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  repairerId,
  onSlotSelect,
  selectedSlot
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Générer des créneaux horaires de démonstration
  const generateDemoSlots = () => {
    const slots: TimeSlot[] = [];
    const baseDate = selectedDate;
    
    // Créneaux de 9h à 18h, par tranches de 30 minutes
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(baseDate);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);

        // Simuler quelques créneaux déjà réservés
        const isBooked = Math.random() < 0.3; // 30% de chance d'être réservé
        
        slots.push({
          id: `slot-${hour}-${minute}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_booked: isBooked,
          repairer_id: repairerId
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    setLoading(true);
    // Simuler un délai de chargement
    setTimeout(() => {
      const slots = generateDemoSlots();
      setAvailableSlots(slots);
      setLoading(false);
    }, 500);
  }, [selectedDate, repairerId]);

  const formatTimeSlot = (startTime: string, endTime: string) => {
    return `${format(new Date(startTime), 'HH:mm', { locale: fr })} - ${format(new Date(endTime), 'HH:mm', { locale: fr })}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlotsList = availableSlots.filter(slot => !slot.is_booked);
  const bookedSlotsList = availableSlots.filter(slot => slot.is_booked);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Créneaux disponibles - {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{availableSlotsList.length} créneaux libres</span>
            </div>
          </div>

          {availableSlotsList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aucun créneau disponible pour cette date
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Essayez de sélectionner une autre date
              </p>
            </div>
          ) : (
            <>
              {/* Créneaux disponibles */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Créneaux disponibles
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlotsList.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSlotSelect(slot)}
                      className="justify-center text-xs h-10"
                    >
                      {formatTimeSlot(slot.start_time, slot.end_time)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Créneaux occupés (pour information) */}
              {bookedSlotsList.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <User className="h-4 w-4 text-orange-500 mr-2" />
                    Créneaux occupés
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {bookedSlotsList.map((slot) => (
                      <div key={slot.id} className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="justify-center text-xs h-10 w-full opacity-50"
                        >
                          {formatTimeSlot(slot.start_time, slot.end_time)}
                        </Button>
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 text-xs px-1 py-0"
                        >
                          Occupé
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Légende */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-border rounded"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Sélectionné</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-muted border border-border rounded opacity-50"></div>
                <span>Occupé</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotPicker;