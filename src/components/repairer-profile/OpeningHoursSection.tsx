
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface OpeningHoursSectionProps {
  formData: RepairerProfile;
  setFormData: (data: RepairerProfile) => void;
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

const OpeningHoursSection: React.FC<OpeningHoursSectionProps> = ({
  formData,
  setFormData
}) => {
  const handleDayChange = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      opening_hours: {
        ...formData.opening_hours,
        [day]: {
          ...formData.opening_hours?.[day],
          [field]: value
        }
      }
    });
  };

  const getDayData = (day: string) => {
    return formData.opening_hours?.[day] || { 
      morning_open: '09:00', 
      morning_close: '12:00',
      afternoon_open: '14:00',
      afternoon_close: '18:00',
      closed: false,
      appointment_only: false,
      home_service: false
    };
  };

  const duplicateToWeek = (sourceDay: string) => {
    const sourceData = getDayData(sourceDay);
    const newOpeningHours = { ...formData.opening_hours };
    
    DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        newOpeningHours[key] = { ...sourceData };
      }
    });

    setFormData({
      ...formData,
      opening_hours: newOpeningHours
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horaires d'ouverture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const dayData = getDayData(key);
          return (
            <div key={key} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-20 font-medium">{label}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateToWeek(key)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Copy className="h-3 w-3" />
                  Dupliquer
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-closed`}
                    checked={dayData.closed}
                    onCheckedChange={(checked) => handleDayChange(key, 'closed', checked)}
                  />
                  <Label htmlFor={`${key}-closed`} className="text-sm">
                    Fermé
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-appointment`}
                    checked={dayData.appointment_only}
                    onCheckedChange={(checked) => handleDayChange(key, 'appointment_only', checked)}
                  />
                  <Label htmlFor={`${key}-appointment`} className="text-sm">
                    Sur rendez-vous
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-home`}
                    checked={dayData.home_service}
                    onCheckedChange={(checked) => handleDayChange(key, 'home_service', checked)}
                  />
                  <Label htmlFor={`${key}-home`} className="text-sm">
                    À domicile
                  </Label>
                </div>
              </div>

              {!dayData.closed && (
                <div className="space-y-2">
                  {/* Horaires du matin */}
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Label className="text-sm font-medium w-16">Matin:</Label>
                    <Label htmlFor={`${key}-morning-open`} className="text-sm">
                      Ouverture:
                    </Label>
                    <Input
                      id={`${key}-morning-open`}
                      type="time"
                      value={dayData.morning_open}
                      onChange={(e) => handleDayChange(key, 'morning_open', e.target.value)}
                      className="w-24"
                    />
                    
                    <Label htmlFor={`${key}-morning-close`} className="text-sm">
                      Fermeture:
                    </Label>
                    <Input
                      id={`${key}-morning-close`}
                      type="time"
                      value={dayData.morning_close}
                      onChange={(e) => handleDayChange(key, 'morning_close', e.target.value)}
                      className="w-24"
                    />
                  </div>

                  {/* Horaires de l'après-midi */}
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Label className="text-sm font-medium w-16">Après-midi:</Label>
                    <Label htmlFor={`${key}-afternoon-open`} className="text-sm">
                      Ouverture:
                    </Label>
                    <Input
                      id={`${key}-afternoon-open`}
                      type="time"
                      value={dayData.afternoon_open}
                      onChange={(e) => handleDayChange(key, 'afternoon_open', e.target.value)}
                      className="w-24"
                    />
                    
                    <Label htmlFor={`${key}-afternoon-close`} className="text-sm">
                      Fermeture:
                    </Label>
                    <Input
                      id={`${key}-afternoon-close`}
                      type="time"
                      value={dayData.afternoon_close}
                      onChange={(e) => handleDayChange(key, 'afternoon_close', e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Conseil :</strong> Définissez vos horaires d'ouverture pour que vos clients sachent quand vous contacter.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursSection;
