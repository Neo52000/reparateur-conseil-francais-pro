
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Calendar, Home } from 'lucide-react';
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
      morning_appointment_only: false,
      morning_home_service: false,
      afternoon_open: '14:00',
      afternoon_close: '18:00',
      afternoon_appointment_only: false,
      afternoon_home_service: false,
      closed: false
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
            <div key={key} className="p-4 border rounded-lg space-y-4">
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

              {!dayData.closed && (
                <div className="space-y-4">
                  {/* Horaires du matin */}
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-sm text-blue-800">Matin</div>
                    
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Label htmlFor={`${key}-morning-open`} className="text-sm">
                        De:
                      </Label>
                      <Input
                        id={`${key}-morning-open`}
                        type="time"
                        value={dayData.morning_open}
                        onChange={(e) => handleDayChange(key, 'morning_open', e.target.value)}
                        className="w-24"
                      />
                      
                      <Label htmlFor={`${key}-morning-close`} className="text-sm">
                        à:
                      </Label>
                      <Input
                        id={`${key}-morning-close`}
                        type="time"
                        value={dayData.morning_close}
                        onChange={(e) => handleDayChange(key, 'morning_close', e.target.value)}
                        className="w-24"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-morning-appointment`}
                          checked={dayData.morning_appointment_only}
                          onCheckedChange={(checked) => handleDayChange(key, 'morning_appointment_only', checked)}
                        />
                        <Label htmlFor={`${key}-morning-appointment`} className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sur RDV
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-morning-home`}
                          checked={dayData.morning_home_service}
                          onCheckedChange={(checked) => handleDayChange(key, 'morning_home_service', checked)}
                        />
                        <Label htmlFor={`${key}-morning-home`} className="text-sm flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          À domicile
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Horaires de l'après-midi */}
                  <div className="space-y-3 p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-sm text-green-800">Après-midi</div>
                    
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Label htmlFor={`${key}-afternoon-open`} className="text-sm">
                        De:
                      </Label>
                      <Input
                        id={`${key}-afternoon-open`}
                        type="time"
                        value={dayData.afternoon_open}
                        onChange={(e) => handleDayChange(key, 'afternoon_open', e.target.value)}
                        className="w-24"
                      />
                      
                      <Label htmlFor={`${key}-afternoon-close`} className="text-sm">
                        à:
                      </Label>
                      <Input
                        id={`${key}-afternoon-close`}
                        type="time"
                        value={dayData.afternoon_close}
                        onChange={(e) => handleDayChange(key, 'afternoon_close', e.target.value)}
                        className="w-24"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-afternoon-appointment`}
                          checked={dayData.afternoon_appointment_only}
                          onCheckedChange={(checked) => handleDayChange(key, 'afternoon_appointment_only', checked)}
                        />
                        <Label htmlFor={`${key}-afternoon-appointment`} className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sur RDV
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-afternoon-home`}
                          checked={dayData.afternoon_home_service}
                          onCheckedChange={(checked) => handleDayChange(key, 'afternoon_home_service', checked)}
                        />
                        <Label htmlFor={`${key}-afternoon-home`} className="text-sm flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          À domicile
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Conseil :</strong> Définissez vos horaires d'ouverture et vos modalités de service (sur RDV, à domicile) pour chaque demi-journée.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursSection;
