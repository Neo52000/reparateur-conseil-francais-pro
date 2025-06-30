
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  client_name: string;
  service: string | null;
  status: string;
}

interface MonthViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date | undefined) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  selectedDate,
  appointments,
  onDateSelect,
  onAppointmentClick,
}) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), day)
    );
  };

  const dayWithAppointments = monthDays.filter(day => 
    getAppointmentsForDay(day).length > 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          locale={fr}
          className="rounded-md border"
          modifiers={{
            hasAppointments: dayWithAppointments,
          }}
          modifiersStyles={{
            hasAppointments: { backgroundColor: '#dbeafe', fontWeight: 'bold' },
          }}
        />
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Jours avec rendez-vous</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-4">
          Rendez-vous du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {getAppointmentsForDay(selectedDate).map(apt => (
            <div
              key={apt.id}
              onClick={() => onAppointmentClick(apt)}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {format(new Date(apt.appointment_date), 'HH:mm')} - {apt.client_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {apt.service || 'Consultation'}
                  </div>
                </div>
                <Badge variant="outline">{apt.status}</Badge>
              </div>
            </div>
          ))}
          {getAppointmentsForDay(selectedDate).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun rendez-vous ce jour
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
