
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return formData.opening_hours?.[day] || { open: '09:00', close: '18:00', closed: false };
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
            <div key={key} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-20 font-medium">{label}</div>
              
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
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${key}-open`} className="text-sm">
                    Ouverture:
                  </Label>
                  <Input
                    id={`${key}-open`}
                    type="time"
                    value={dayData.open}
                    onChange={(e) => handleDayChange(key, 'open', e.target.value)}
                    className="w-24"
                  />
                  
                  <Label htmlFor={`${key}-close`} className="text-sm">
                    Fermeture:
                  </Label>
                  <Input
                    id={`${key}-close`}
                    type="time"
                    value={dayData.close}
                    onChange={(e) => handleDayChange(key, 'close', e.target.value)}
                    className="w-24"
                  />
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
