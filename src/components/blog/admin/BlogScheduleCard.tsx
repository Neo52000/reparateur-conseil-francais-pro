import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Calendar, Clock, Tag, CalendarDays, ChevronDown, FileText, Copy, Sparkles } from 'lucide-react';
import { WeekdayPicker } from './WeekdayPicker';
import { TimePicker } from './TimePicker';
import { PromptVariablesHelper } from './PromptVariablesHelper';
import { BlogAutomationSchedule } from '@/types/blogAutomation';
import { BlogCategory } from '@/types/blog';
import { useBlogPrompts } from '@/hooks/blog/useBlogPrompts';

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
  const { fetchPrompts } = useBlogPrompts();
  
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [showVariablesHelp, setShowVariablesHelp] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
  }, [schedule.category_id]);

  const loadTemplates = async () => {
    const templates = await fetchPrompts();
    // Filtrer les templates pour la catégorie sélectionnée ou globaux
    const filtered = templates.filter(
      t => !t.category_id || t.category_id === schedule.category_id
    );
    setAvailableTemplates(filtered);
  };

  const handleCopyTemplate = (templatePrompt: string) => {
    onUpdate({ ...schedule, prompt_template: templatePrompt });
  };

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
            value={schedule.category_id || "none"}
            onValueChange={(value) => onUpdate({ ...schedule, category_id: value === "none" ? null : value })}
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
              <SelectItem value="none">Aucune catégorie (toutes)</SelectItem>
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

        {/* AI Model Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Modèle d'IA
          </Label>
          <Select
            value={schedule.ai_model}
            onValueChange={(value) => onUpdate({ ...schedule, ai_model: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recommandé)</SelectItem>
              <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Plus puissant)</SelectItem>
              <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
              <SelectItem value="openai/gpt-5">GPT-5 (Premium)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Template Editor */}
        <Collapsible open={showPromptEditor} onOpenChange={setShowPromptEditor} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showPromptEditor ? 'rotate-180' : ''}`} />
              <FileText className="mr-2 h-4 w-4" />
              Personnaliser le prompt de génération
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {/* Template Selection */}
            {availableTemplates.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Utiliser un template existant</Label>
                <div className="grid gap-2">
                  {availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.category_id ? 'Spécifique à la catégorie' : 'Template global'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyTemplate(template.prompt_template)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variables Help */}
            <Collapsible open={showVariablesHelp} onOpenChange={setShowVariablesHelp}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showVariablesHelp ? 'rotate-180' : ''}`} />
                  Variables disponibles
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <PromptVariablesHelper />
              </CollapsibleContent>
            </Collapsible>

            {/* Prompt Editor */}
            <div className="space-y-2">
              <Label htmlFor={`prompt-${schedule.id}`}>Template du prompt</Label>
              <Textarea
                id={`prompt-${schedule.id}`}
                value={schedule.prompt_template || ''}
                onChange={(e) => onUpdate({ ...schedule, prompt_template: e.target.value })}
                placeholder="Laissez vide pour utiliser le prompt par défaut ou celui de la catégorie..."
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Personnalisez le prompt pour cette planification. Utilisez les variables comme {'{categorie}'}, {'{saison}'}, etc.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

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
