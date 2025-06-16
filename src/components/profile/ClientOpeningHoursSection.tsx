
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Home, Calendar } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientOpeningHoursSectionProps {
  profile: RepairerProfile;
}

const DAYS_LABELS = {
  monday: 'Lundi',
  tuesday: 'Mardi', 
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

const ClientOpeningHoursSection: React.FC<ClientOpeningHoursSectionProps> = ({
  profile
}) => {
  if (!profile.opening_hours) {
    return null;
  }

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '';
  };

  const renderDaySchedule = (dayKey: string, dayData: any) => {
    if (!dayData) return null;

    if (dayData.closed) {
      return (
        <div key={dayKey} className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="font-medium">{DAYS_LABELS[dayKey as keyof typeof DAYS_LABELS]}</span>
          <span className="text-gray-500">Fermé</span>
        </div>
      );
    }

    const badges = [];
    if (dayData.appointment_only) {
      badges.push(
        <Badge key="appointment" variant="outline" className="text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          Sur RDV
        </Badge>
      );
    }
    if (dayData.home_service) {
      badges.push(
        <Badge key="home" variant="outline" className="text-xs">
          <Home className="h-3 w-3 mr-1" />
          À domicile
        </Badge>
      );
    }

    return (
      <div key={dayKey} className="py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex justify-between items-start">
          <span className="font-medium">{DAYS_LABELS[dayKey as keyof typeof DAYS_LABELS]}</span>
          <div className="text-right">
            <div className="text-sm">
              {formatTime(dayData.morning_open)} - {formatTime(dayData.morning_close)}
            </div>
            <div className="text-sm">
              {formatTime(dayData.afternoon_open)} - {formatTime(dayData.afternoon_close)}
            </div>
            {badges.length > 0 && (
              <div className="flex gap-1 mt-1 justify-end">
                {badges}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horaires d'ouverture
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(profile.opening_hours).map(([dayKey, dayData]) =>
            renderDaySchedule(dayKey, dayData)
          )}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Note :</strong> Ces horaires ne tiennent pas compte des jours fériés.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientOpeningHoursSection;
