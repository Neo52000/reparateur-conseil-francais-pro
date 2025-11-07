import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Calendar, Clock, Tag, CalendarDays } from 'lucide-react';
import { WeekdayPicker } from './WeekdayPicker';
import { TimePicker } from './TimePicker';
import { BlogAutomationSchedule } from '@/types/blogAutomation';
import { BlogCategory } from '@/types/blog';

const getNextExecutionDates = (scheduleDay: number, scheduleTime: string, count: number = 3): Date[] => {
  const dates: Date[] = [];
  const now = new Date();
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  
  let currentDate = new Date(now);
  currentDate.setHours(hours, minutes, 0, 0);
  
  // Si l'heure est déjà passée aujourd'hui, commencer demain
  if (currentDate <= now) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Trouver les prochaines dates correspondant au jour de la semaine
  while (dates.length < count) {
    if (currentDate.getDay() === scheduleDay) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

interface BlogScheduleCardProps {
  schedule: BlogAutomationSchedule;
  categories: BlogCategory[];
  onUpdate: (schedule: BlogAutomationSchedule) => void;
  onDelete: () => void;
}

export const BlogScheduleCard = ({ schedule, categories, onUpdate, onDelete }: BlogScheduleCardProps) => {
  const selectedCategory = categories.find(c => c.id === schedule.category_id);
  const nextDates = getNextExecutionDates(schedule.schedule_day, schedule.schedule_time);

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Input
              value={schedule.name}
              onChange={(e) => onUpdate({ ...schedule, name: e.target.value })}
              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Nom de la planification"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={schedule.enabled}
              onCheckedChange={(checked) => onUpdate({ ...schedule, enabled: checked })}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégorie d'article
          </Label>
          <Select
            value={schedule.category_id || undefined}
            onValueChange={(value) => onUpdate({ ...schedule, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie">
                {selectedCategory && (
                  <span className="flex items-center gap-2">
                    {selectedCategory.icon && <span>{selectedCategory.icon}</span>}
                    {selectedCategory.name}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="z-50">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Day Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Jour de publication
          </Label>
          <WeekdayPicker
            value={schedule.schedule_day}
            onChange={(day) => onUpdate({ ...schedule, schedule_day: day })}
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Heure de publication
          </Label>
          <TimePicker
            value={schedule.schedule_time}
            onChange={(time) => onUpdate({ ...schedule, schedule_time: time })}
          />
        </div>

        {/* Auto-publish Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="space-y-0.5">
            <Label htmlFor={`auto-publish-${schedule.id}`} className="text-sm font-medium">
              Publication automatique
            </Label>
            <p className="text-xs text-muted-foreground">
              Publier directement ou créer en brouillon
            </p>
          </div>
          <Switch
            id={`auto-publish-${schedule.id}`}
            checked={schedule.auto_publish}
            onCheckedChange={(checked) => onUpdate({ ...schedule, auto_publish: checked })}
          />
        </div>

        {/* Next Execution Dates Preview */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="flex items-center gap-2 text-xs">
            <CalendarDays className="h-3.5 w-3.5" />
            Prochaines publications prévues
          </Label>
          <div className="space-y-1">
            {nextDates.map((date, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground flex items-center gap-2 py-1 px-2 rounded-md bg-secondary/50"
              >
                <Calendar className="h-3 w-3" />
                {date.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
                <Clock className="h-3 w-3 ml-auto" />
                {date.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Last Run Info */}
        {schedule.last_run_at && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Dernière exécution : {new Date(schedule.last_run_at).toLocaleString('fr-FR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
