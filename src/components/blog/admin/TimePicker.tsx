import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const OPTIMAL_HOURS = [6, 8, 10, 14, 18];

const getTimeOfDay = (hour: number) => {
  if (hour >= 0 && hour < 6) return { label: 'Nuit', color: 'text-blue-400', emoji: '🌙' };
  if (hour >= 6 && hour < 12) return { label: 'Matin', color: 'text-yellow-500', emoji: '☀️' };
  if (hour >= 12 && hour < 18) return { label: 'Après-midi', color: 'text-orange-500', emoji: '🌤️' };
  return { label: 'Soir', color: 'text-purple-500', emoji: '🌆' };
};

export const TimePicker = ({ value, onChange }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(() => {
    const [h] = value.split(':');
    return parseInt(h);
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    const [, m] = value.split(':');
    return parseInt(m);
  });

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    const formattedTime = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  };

  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
    const formattedTime = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(formattedTime);
  };

  const handleQuickSelect = (hour: number) => {
    setSelectedHour(hour);
    setSelectedMinute(0);
    const formattedTime = `${hour.toString().padStart(2, '0')}:00`;
    onChange(formattedTime);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4" />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Quick suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Suggestions optimales</p>
            <div className="flex flex-wrap gap-2">
              {OPTIMAL_HOURS.map((hour) => {
                const timeOfDay = getTimeOfDay(hour);
                return (
                  <Button
                    key={hour}
                    type="button"
                    size="sm"
                    variant={selectedHour === hour && selectedMinute === 0 ? 'default' : 'outline'}
                    onClick={() => handleQuickSelect(hour)}
                    className="text-xs"
                  >
                    <span className="mr-1">{timeOfDay.emoji}</span>
                    {hour.toString().padStart(2, '0')}h00
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Heures</p>
            <ScrollArea className="h-48 rounded-md border p-2">
              <div className="grid grid-cols-6 gap-2">
                {HOURS.map((hour) => {
                  const timeOfDay = getTimeOfDay(hour);
                  return (
                    <Button
                      key={hour}
                      type="button"
                      size="sm"
                      variant={selectedHour === hour ? 'default' : 'ghost'}
                      onClick={() => handleHourSelect(hour)}
                      className="h-8 text-xs"
                    >
                      {hour.toString().padStart(2, '0')}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Minutes */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Minutes</p>
            <div className="grid grid-cols-4 gap-2">
              {MINUTES.map((minute) => (
                <Button
                  key={minute}
                  type="button"
                  size="sm"
                  variant={selectedMinute === minute ? 'default' : 'outline'}
                  onClick={() => handleMinuteSelect(minute)}
                  className="text-xs"
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
