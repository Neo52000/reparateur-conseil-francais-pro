
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import RepairerAppointmentsCalendar from "./RepairerAppointmentsCalendar";

const CalendarTabSection: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5" />
        Planning des rendez-vous
      </CardTitle>
    </CardHeader>
    <CardContent>
      <RepairerAppointmentsCalendar />
    </CardContent>
  </Card>
);

export default CalendarTabSection;
