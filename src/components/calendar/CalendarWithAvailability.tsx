import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isAfter, startOfDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Clock, Users } from "lucide-react";

interface CalendarWithAvailabilityProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  repairerId: string;
}

const CalendarWithAvailability: React.FC<CalendarWithAvailabilityProps> = ({
  selectedDate,
  onDateSelect,
  repairerId
}) => {
  // Données simulées pour les disponibilités
  const getAvailabilityForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Simuler des disponibilités différentes selon les jours
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend - moins de créneaux
      return {
        totalSlots: Math.floor(Math.random() * 6) + 2, // 2-8 créneaux
        availableSlots: Math.floor(Math.random() * 4) + 1, // 1-5 disponibles
        bookedSlots: Math.floor(Math.random() * 3) + 1 // 1-4 réservés
      };
    } else {
      // Jours de semaine - plus de créneaux
      return {
        totalSlots: Math.floor(Math.random() * 12) + 8, // 8-20 créneaux
        availableSlots: Math.floor(Math.random() * 8) + 3, // 3-11 disponibles
        bookedSlots: Math.floor(Math.random() * 6) + 2 // 2-8 réservés
      };
    }
  };

  const getDayContent = (date: Date) => {
    // Ne pas afficher d'informations pour les dates passées
    if (!isAfter(date, startOfDay(new Date())) && !isToday(date)) {
      return null;
    }

    const availability = getAvailabilityForDate(date);
    const occupancyRate = availability.bookedSlots / availability.totalSlots;
    
    let badgeColor = "bg-green-100 text-green-800";
    let badgeText = "Libre";
    
    if (occupancyRate > 0.8) {
      badgeColor = "bg-red-100 text-red-800";
      badgeText = "Complet";
    } else if (occupancyRate > 0.6) {
      badgeColor = "bg-orange-100 text-orange-800";
      badgeText = "Limité";
    } else if (occupancyRate > 0.3) {
      badgeColor = "bg-yellow-100 text-yellow-800";
      badgeText = "Moyen";
    }

    return (
      <div className="w-full mt-1">
        <Badge 
          variant="secondary" 
          className={`text-xs px-1 py-0 w-full justify-center ${badgeColor}`}
        >
          {badgeText}
        </Badge>
        <div className="text-xs text-muted-foreground text-center mt-1">
          {availability.availableSlots}/{availability.totalSlots}
        </div>
      </div>
    );
  };

  const modifiers = {
    available: (date: Date) => {
      if (!isAfter(date, startOfDay(new Date())) && !isToday(date)) return false;
      const availability = getAvailabilityForDate(date);
      return availability.availableSlots > 0;
    },
    fullyBooked: (date: Date) => {
      if (!isAfter(date, startOfDay(new Date())) && !isToday(date)) return false;
      const availability = getAvailabilityForDate(date);
      return availability.availableSlots === 0;
    },
    highDemand: (date: Date) => {
      if (!isAfter(date, startOfDay(new Date())) && !isToday(date)) return false;
      const availability = getAvailabilityForDate(date);
      const occupancyRate = availability.bookedSlots / availability.totalSlots;
      return occupancyRate > 0.6 && availability.availableSlots > 0;
    }
  };

  const modifiersStyles = {
    available: {
      backgroundColor: "rgb(240 253 244)", // green-50
      border: "1px solid rgb(34 197 94)" // green-500
    },
    fullyBooked: {
      backgroundColor: "rgb(254 242 242)", // red-50
      border: "1px solid rgb(239 68 68)", // red-500
      color: "rgb(185 28 28)" // red-700
    },
    highDemand: {
      backgroundColor: "rgb(255 251 235)", // yellow-50
      border: "1px solid rgb(245 158 11)" // yellow-500
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Sélectionner une date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            locale={fr}
            disabled={(date) => 
              !isAfter(date, startOfDay(new Date())) && !isToday(date)
            }
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            components={{
              DayContent: ({ date }) => (
                <div className="w-full h-full flex flex-col items-center justify-center p-1">
                  <span className="text-sm">{format(date, 'd')}</span>
                  {getDayContent(date)}
                </div>
              )
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Légende */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3">Légende des disponibilités</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 border border-green-500 rounded"></div>
              <span>Créneaux disponibles</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-500 rounded"></div>
              <span>Forte demande</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-50 border border-red-500 rounded"></div>
              <span>Complet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted border border-border rounded"></div>
              <span>Indisponible</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Horaires :</span>
              </div>
              <span>9h00 - 18h00</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Durée :</span>
              </div>
              <span>30 min / créneau</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarWithAvailability;