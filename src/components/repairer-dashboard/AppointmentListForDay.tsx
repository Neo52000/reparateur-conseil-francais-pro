
import React from "react";
import { CalendarClock, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  client_name: string;
  phone: string | null;
  service: string | null;
  status: string;
};

interface AppointmentListForDayProps {
  appointments: Appointment[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const AppointmentListForDay: React.FC<AppointmentListForDayProps> = ({
  appointments,
  loading,
  onDelete,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
        Aucun rendez-vous ce jour.<br />Utilisez le bouton <b>Ajouter</b> pour planifier un nouveau créneau.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map(a => (
        <div
          key={a.id}
          className="p-3 flex items-center bg-blue-50 hover:bg-blue-100 rounded shadow-sm border border-blue-100 relative"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              <CalendarClock className="h-4 w-4" />
              {format(new Date(a.appointment_date), "p", { locale: fr })} – {a.service || "Consultation"}
            </div>
            {/* Plus d'infos (client, téléphone) à ajouter si besoin */}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-100 ml-2"
            onClick={() => onDelete(a.id)}
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AppointmentListForDay;

