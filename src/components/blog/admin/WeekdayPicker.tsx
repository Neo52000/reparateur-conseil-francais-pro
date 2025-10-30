import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeekdayPickerProps {
  value: number;
  onChange: (day: number) => void;
}

const WEEKDAYS = [
  { value: 1, short: 'L', full: 'Lundi' },
  { value: 2, short: 'M', full: 'Mardi' },
  { value: 3, short: 'M', full: 'Mercredi' },
  { value: 4, short: 'J', full: 'Jeudi' },
  { value: 5, short: 'V', full: 'Vendredi' },
  { value: 6, short: 'S', full: 'Samedi' },
  { value: 0, short: 'D', full: 'Dimanche' },
];

export const WeekdayPicker = ({ value, onChange }: WeekdayPickerProps) => {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => (
          <Tooltip key={day.value}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={value === day.value ? 'default' : 'secondary'}
                size="icon"
                className="h-12 w-12 transition-all"
                onClick={() => onChange(day.value)}
                aria-label={day.full}
              >
                {day.short}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{day.full}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
