import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CalendarWithAvailability from "@/components/calendar/CalendarWithAvailability";
import TimeSlotPicker from "@/components/calendar/TimeSlotPicker";
import AppointmentBookingModal from "@/components/calendar/AppointmentBookingModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Settings,
  Plus,
  BarChart3
} from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  repairer_id: string;
}

const CalendarDemo = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const demoRepairer = {
    id: "demo-repairer-1",
    name: "TechRepair Pro",
    city: "Paris",
    rating: 4.8
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = () => {
    if (selectedSlot) {
      setShowBookingModal(true);
    }
  };

  const handleBookingConfirmed = () => {
    // Refresh the calendar data
    setSelectedSlot(undefined);
    setShowBookingModal(false);
  };

  const statsCards = [
    {
      title: "Rendez-vous cette semaine",
      value: "23",
      change: "+12%",
      icon: CalendarIcon,
      color: "text-blue-500"
    },
    {
      title: "Taux d'occupation",
      value: "78%",
      change: "+5%",
      icon: BarChart3,
      color: "text-green-500"
    },
    {
      title: "Créneaux disponibles",
      value: "156",
      change: "-8%",
      icon: Clock,
      color: "text-orange-500"
    },
    {
      title: "Nouveaux clients",
      value: "12",
      change: "+18%",
      icon: User,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Système de Calendrier et Rendez-vous
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestion complète des disponibilités et réservations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>
                      {' '}vs semaine dernière
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="booking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="booking">Réservation</TabsTrigger>
            <TabsTrigger value="management">Gestion</TabsTrigger>
            <TabsTrigger value="availability">Disponibilités</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CalendarWithAvailability
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  repairerId={demoRepairer.id}
                />
              </div>

              <div className="space-y-6">
                {selectedDate ? (
                  <>
                    <TimeSlotPicker
                      selectedDate={selectedDate}
                      repairerId={demoRepairer.id}
                      onSlotSelect={handleSlotSelect}
                      selectedSlot={selectedSlot}
                    />

                    {selectedSlot && (
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-4">Récapitulatif de la réservation</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Réparateur</span>
                              <span className="font-medium">{demoRepairer.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Date</span>
                              <span className="font-medium">
                                {format(selectedDate, 'EEEE dd MMMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Heure</span>
                              <span className="font-medium">
                                {format(new Date(selectedSlot.start_time), 'HH:mm', { locale: fr })} - {format(new Date(selectedSlot.end_time), 'HH:mm', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Durée</span>
                              <span className="font-medium">30 minutes</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Frais de réservation</span>
                              <span className="font-medium">20,00 €</span>
                            </div>
                          </div>
                          <Button 
                            onClick={handleBookAppointment}
                            className="w-full mt-6"
                          >
                            Réserver ce créneau
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Sélectionnez une date</h3>
                      <p className="text-muted-foreground">
                        Choisissez une date dans le calendrier pour voir les créneaux disponibles
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="management">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Gestion des créneaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Créneaux récurrents</h4>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    
                    {[
                      { day: "Lundi - Vendredi", time: "9h00 - 18h00", slots: "18 créneaux/jour" },
                      { day: "Samedi", time: "9h00 - 17h00", slots: "16 créneaux/jour" },
                      { day: "Dimanche", time: "Fermé", slots: "0 créneau" }
                    ].map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{schedule.day}</p>
                          <p className="text-sm text-muted-foreground">{schedule.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{schedule.slots}</p>
                          <Button size="sm" variant="ghost">Modifier</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres généraux
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Indisponibilités
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Gestion clients
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Synchroniser agenda
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des disponibilités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Horaires de travail</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Jours de la semaine</h4>
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => (
                          <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{day}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">9h00 - 18h00</span>
                              <Badge variant="secondary">Actif</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Week-end</h4>
                        {['Samedi', 'Dimanche'].map((day) => (
                          <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{day}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {day === 'Samedi' ? '9h00 - 17h00' : 'Fermé'}
                              </span>
                              <Badge variant={day === 'Samedi' ? 'secondary' : 'outline'}>
                                {day === 'Samedi' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Paramètres des créneaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Durée par créneau</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>30 minutes</option>
                          <option>45 minutes</option>
                          <option>60 minutes</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Délai de réservation</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>2 heures</option>
                          <option>4 heures</option>
                          <option>24 heures</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Créneaux simultanés</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Taux d'occupation par jour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { day: 'Lundi', rate: 85, bookings: 15 },
                      { day: 'Mardi', rate: 78, bookings: 14 },
                      { day: 'Mercredi', rate: 92, bookings: 16 },
                      { day: 'Jeudi', rate: 68, bookings: 12 },
                      { day: 'Vendredi', rate: 88, bookings: 15 },
                      { day: 'Samedi', rate: 45, bookings: 7 }
                    ].map((stat) => (
                      <div key={stat.day} className="flex items-center justify-between">
                        <span className="font-medium">{stat.day}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${stat.rate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{stat.rate}%</span>
                          <span className="text-sm text-muted-foreground">({stat.bookings} RDV)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Créneaux les plus demandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: '14:00 - 14:30', demand: 95 },
                      { time: '10:00 - 10:30', demand: 88 },
                      { time: '16:00 - 16:30', demand: 82 },
                      { time: '11:00 - 11:30', demand: 75 },
                      { time: '15:00 - 15:30', demand: 68 },
                      { time: '09:00 - 09:30', demand: 45 }
                    ].map((slot) => (
                      <div key={slot.time} className="flex items-center justify-between">
                        <span className="font-medium">{slot.time}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${slot.demand}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{slot.demand}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de réservation */}
        {selectedSlot && (
          <AppointmentBookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            selectedSlot={selectedSlot}
            repairerName={demoRepairer.name}
            onBookingConfirmed={handleBookingConfirmed}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarDemo;