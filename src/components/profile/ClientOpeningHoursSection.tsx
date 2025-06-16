
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

  const renderHalfDayBadges = (period: 'morning' | 'afternoon', dayData: any) => {
    const badges = [];
    const appointmentKey = `${period}_appointment_only`;
    const homeKey = `${period}_home_service`;
    
    if (dayData[appointmentKey]) {
      badges.push(
        <Badge key={`${period}-appointment`} variant="outline" className="text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          RDV
        </Badge>
      );
    }
    if (dayData[homeKey]) {
      badges.push(
        <Badge key={`${period}-home`} variant="outline" className="text-xs">
          <Home className="h-3 w-3 mr-1" />
          Domicile
        </Badge>
      );
    }
    return badges;
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

    const morningBadges = renderHalfDayBadges('morning', dayData);
    const afternoonBadges = renderHalfDayBadges('afternoon', dayData);

    return (
      <div key={dayKey} className="py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex justify-between items-center">
          <span className="font-medium">{DAYS_LABELS[dayKey as keyof typeof DAYS_LABELS]}</span>
          <div className="text-right">
            <div className="flex items-center gap-4 text-sm">
              {/* Matin */}
              <div className="flex items-center gap-2">
                <span>
                  {formatTime(dayData.morning_open)} - {formatTime(dayData.morning_close)}
                </span>
                {morningBadges.length > 0 && (
                  <div className="flex gap-1">
                    {morningBadges}
                  </div>
                )}
              </div>
              
              <span className="text-gray-400">|</span>
              
              {/* Après-midi */}
              <div className="flex items-center gap-2">
                <span>
                  {formatTime(dayData.afternoon_open)} - {formatTime(dayData.afternoon_close)}
                </span>
                {afternoonBadges.length > 0 && (
                  <div className="flex gap-1">
                    {afternoonBadges}
                  </div>
                )}
              </div>
            </div>
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
