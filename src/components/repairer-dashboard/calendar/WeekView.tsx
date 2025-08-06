
import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  client_name: string;
  service: string | null;
  status: string;
}

interface WeekViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  appointments,
  onAppointmentClick,
}) => {
  const weekStart = startOfWeek(selectedDate, { locale: fr });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), day)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-7 gap-2 h-96">
      {weekDays.map((day, index) => {
        const dayAppointments = getAppointmentsForDay(day);
        const isToday = isSameDay(day, new Date());
        
        return (
          <Card key={index} className={`${isToday ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-2">
              <div className="text-center mb-2">
                <div className="text-sm font-medium">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={`text-lg ${isToday ? 'font-bold text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    className="cursor-pointer p-1 rounded text-xs hover:bg-gray-50"
                  >
                    <div className="font-medium truncate">
                      {format(new Date(apt.appointment_date), 'HH:mm')}
                    </div>
                    <div className="truncate text-gray-600">
                      {apt.client_name}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WeekView;
