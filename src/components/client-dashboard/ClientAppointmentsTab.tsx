
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppointmentBooking from '@/components/AppointmentBooking';

interface Appointment {
  id: string;
  repairer: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

interface ClientAppointmentsTabProps {
  appointments: Appointment[];
}

const ClientAppointmentsTab: React.FC<ClientAppointmentsTabProps> = ({ appointments }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{appointment.repairer}</h3>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                  <p className="text-sm text-gray-500">{appointment.date} à {appointment.time}</p>
                </div>
                <Badge>{appointment.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AppointmentBooking 
        repairerId="demo-repairer"
        onSuccess={() => console.log('Appointment booked')} 
      />
    </div>
  );
};

export default ClientAppointmentsTab;
