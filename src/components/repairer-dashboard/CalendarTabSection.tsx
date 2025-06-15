
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const CalendarTabSection: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Calendar className="h-5 w-5 mr-2" />
        Planning des rendez-vous
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Calendrier interactif pour la gestion des rendez-vous</p>
        <Button className="mt-4">Configurer les créneaux</Button>
      </div>
    </CardContent>
  </Card>
);

export default CalendarTabSection;
