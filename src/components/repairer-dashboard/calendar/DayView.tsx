
import React from 'react';
import { format, isSameDay, startOfDay, endOfDay, eachHourOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  client_name: string;
  service: string | null;
  status: string;
  phone?: string;
}

interface DayViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (timeSlot: string) => void;
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
}) => {
  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);
  const hours = eachHourOfInterval({ start: dayStart, end: dayEnd });

  const getAppointmentsForHour = (hour: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return isSameDay(aptDate, selectedDate) && 
             aptDate.getHours() === hour.getHours();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>
        <Button size="sm" onClick={() => onTimeSlotClick('09:00')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      <div className="grid gap-2 max-h-96 overflow-y-auto">
        {hours.map((hour) => {
          const hourAppointments = getAppointmentsForHour(hour);
          const timeSlot = format(hour, 'HH:mm');
          
          return (
            <Card key={hour.toISOString()} className="hover:bg-gray-50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500 min-w-[50px]">
                      <Clock className="h-3 w-3" />
                      {timeSlot}
                    </div>
                    <div className="flex-1">
                      {hourAppointments.length > 0 ? (
                        <div className="space-y-2">
                          {hourAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => onAppointmentClick(apt)}
                              className="cursor-pointer p-2 bg-white rounded border hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">
                                    {apt.client_name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {apt.service || 'Consultation'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {apt.duration_minutes} min
                                  </div>
                                </div>
                                <Badge className={`text-xs ${getStatusColor(apt.status)}`}>
                                  {apt.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => onTimeSlotClick(timeSlot)}
                          className="text-sm text-gray-400 hover:text-gray-600"
                        >
                          Créneaux disponible
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
