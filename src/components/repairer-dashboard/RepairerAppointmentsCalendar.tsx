
import React, { useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Sous-composants
import AppointmentListForDay from "./AppointmentListForDay";
import CreateAppointmentPopover from "./CreateAppointmentPopover";
import CalendarViewSelector from "./calendar/CalendarViewSelector";
import WeekView from "./calendar/WeekView";
import MonthView from "./calendar/MonthView";

type CalendarView = 'day' | 'week' | 'month';

type Appointment = {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  client_name: string;
  phone: string | null;
  service: string | null;
  status: string;
};

export default function RepairerAppointmentsCalendar() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('day');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTime, setNewTime] = useState<string>("14:00");
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newClient, setNewClient] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newService, setNewService] = useState<string>("Consultation");
  const { toast } = useToast();

  // Fetch appointments pour le réparateur connecté
  const fetchAppointments = async () => {
    if (!profile?.id) return;
    setLoading(true);
    
    try {
      // D'abord, récupérer les rendez-vous depuis appointments_with_quotes
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments_with_quotes")
        .select(`
          id,
          appointment_date,
          duration_minutes,
          client_notes,
          repairer_notes,
          status,
          quote_id,
          client_id
        `)
        .eq("repairer_id", profile.id)
        .order("appointment_date", { ascending: true });

      if (appointmentsError) throw appointmentsError;

      if (appointmentsData && appointmentsData.length > 0) {
        // Récupérer les informations des clients
        const clientIds = appointmentsData.map(apt => apt.client_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", clientIds);

        if (profilesError) {
          console.warn("Erreur lors du chargement des profils clients:", profilesError);
        }

        // Combiner les données
        const combinedAppointments = appointmentsData.map((apt: any) => {
          const clientProfile = profilesData?.find(p => p.id === apt.client_id);
          const clientName = clientProfile 
            ? `${clientProfile.first_name} ${clientProfile.last_name}`.trim()
            : "Client";

          return {
            id: apt.id,
            appointment_date: apt.appointment_date,
            duration_minutes: apt.duration_minutes,
            client_name: clientName,
            phone: clientProfile?.email || "",
            service: apt.client_notes || "Rendez-vous",
            status: apt.status,
          };
        });

        setAppointments(combinedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      toast({ 
        title: "Erreur de chargement", 
        description: error.message, 
        variant: "destructive" 
      });
      setAppointments([]);
    }
    
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [profile?.id]);

  // Création rapide d'un rendez-vous
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !selectedDate) return;
    setLoading(true);

    // Combine date et heure :
    const [h, m] = newTime.split(":").map(Number);
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(h, m, 0, 0);

    const { error } = await supabase.from("appointments").insert({
      repairer_id: profile.id,
      appointment_date: dateWithTime.toISOString(),
      duration_minutes: newDuration,
      notes: newService,
      user_id: null, // Peut être renseigné si on veut lier à un utilisateur
      status: "scheduled",
    });
    if (error) {
      toast({ title: "Erreur création rendez-vous", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rendez-vous créé", description: format(dateWithTime, "PPPp", { locale: fr }) });
      fetchAppointments();
      setShowCreateModal(false);
      setNewClient("");
      setNewPhone("");
      setNewService("Consultation");
    }
    setLoading(false);
  };

  // Suppression rapide
  const handleDelete = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rendez-vous supprimé" });
      fetchAppointments();
    }
    setLoading(false);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // Logique pour afficher les détails du rendez-vous
    console.log('Rendez-vous sélectionné:', appointment);
  };

  // Filtrer les RDVs pour la date sélectionnée
  const appointmentsForDay = selectedDate
    ? appointments.filter(a => isSameDay(new Date(a.appointment_date), selectedDate))
    : [];

  const renderCurrentView = () => {
    if (!selectedDate) return null;

    switch (currentView) {
      case 'week':
        return (
          <WeekView
            selectedDate={selectedDate}
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      case 'month':
        return (
          <MonthView
            selectedDate={selectedDate}
            appointments={appointments}
            onDateSelect={setSelectedDate}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      default: // day view
        return (
          <div className="flex flex-col md:flex-row gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="pointer-events-auto"
                locale={fr}
              />
              <div className="mt-3">
                <Button onClick={() => setShowCreateModal(true)} className="w-full" disabled={!selectedDate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {selectedDate ? "Ajouter un rendez-vous le " + format(selectedDate, "PPP", { locale: fr }) : "Sélectionnez une date"}
                </Button>
              </div>
            </div>
            {/* Liste des rendez-vous pour la journée */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <CalendarDays className="h-5 w-5 mr-2" /> Rendez-vous du jour
              </h3>
              <AppointmentListForDay
                appointments={appointmentsForDay}
                loading={loading}
                onDelete={handleDelete}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      {/* Sélecteur de vue */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Planning des rendez-vous</h2>
        <CalendarViewSelector
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Vue actuelle */}
      {renderCurrentView()}

      {/* Modale création rapide */}
      <Popover open={showCreateModal} onOpenChange={setShowCreateModal}>
        <CreateAppointmentPopover
          show={showCreateModal}
          selectedDate={selectedDate}
          newTime={newTime}
          newDuration={newDuration}
          newService={newService}
          loading={loading}
          onTimeChange={setNewTime}
          onDurationChange={setNewDuration}
          onServiceChange={setNewService}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAppointment}
        />
      </Popover>
    </div>
  );
}
