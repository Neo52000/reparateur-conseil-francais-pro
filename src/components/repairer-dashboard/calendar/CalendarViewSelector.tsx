
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

type CalendarView = 'day' | 'week' | 'month';

interface CalendarViewSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  currentView,
  onViewChange,
}) => {
  const views = [
    { key: 'day' as CalendarView, label: 'Jour', icon: Calendar },
    { key: 'week' as CalendarView, label: 'Semaine', icon: CalendarDays },
    { key: 'month' as CalendarView, label: 'Mois', icon: CalendarRange },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      {views.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant={currentView === key ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(key)}
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};

export default CalendarViewSelector;
