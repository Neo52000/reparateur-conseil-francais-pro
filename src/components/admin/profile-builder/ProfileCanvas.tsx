import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileWidget, ProfileTheme, WidgetVisibilityState, evaluateWidgetVisibility } from '@/types/profileBuilder';
import { PlanName } from '@/types/featureFlags';
import { 
  User, FileText, Phone, Image, Clock, Wrench, 
  Euro, Award, MapPin, Star, GripVertical, Eye, EyeOff, Lock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCanvasProps {
  widgets: ProfileWidget[];
  theme: ProfileTheme;
  selectedWidgetId: string | null;
  previewPlan: PlanName;
  onSelectWidget: (widgetId: string | null) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  User,
  FileText,
  Phone,
  Image,
  Clock,
  Wrench,
  Euro,
  Award,
  MapPin,
  Star,
};

/**
 * Widget sortable dans le canvas
 */
const SortableWidget: React.FC<{
  widget: ProfileWidget;
  isSelected: boolean;
  visibilityState: WidgetVisibilityState;
  onClick: () => void;
}> = ({ widget, isSelected, visibilityState, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = ICON_MAP[widget.icon] || Wrench;

  const getVisibilityBadge = () => {
    switch (visibilityState) {
      case 'blurred':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <EyeOff className="h-3 w-3 mr-1" />
            Flouté
          </Badge>
        );
      case 'hidden':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Lock className="h-3 w-3 mr-1" />
            Masqué
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Eye className="h-3 w-3 mr-1" />
            Visible
          </Badge>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50'
      )}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all',
          isSelected 
            ? 'ring-2 ring-primary border-primary shadow-md' 
            : 'hover:border-primary/50 hover:shadow-sm',
          isDragging && 'opacity-50 shadow-xl',
          !widget.isVisible && 'opacity-50',
          visibilityState === 'blurred' && 'bg-muted/50',
          visibilityState === 'hidden' && 'bg-destructive/5 border-destructive/20'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Handle de drag */}
            <button
              className="touch-none p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Icône du widget */}
            <div className={cn(
              'p-2 rounded-lg',
              visibilityState === 'visible' 
                ? 'bg-primary/10' 
                : visibilityState === 'blurred' 
                  ? 'bg-amber-100' 
                  : 'bg-red-100'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                visibilityState === 'visible' 
                  ? 'text-primary' 
                  : visibilityState === 'blurred' 
                    ? 'text-amber-600' 
                    : 'text-red-600'
              )} />
            </div>

            {/* Nom et plan */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{widget.name}</p>
              <p className="text-xs text-muted-foreground">
                Plan min: {widget.visibilityRules.minPlan}
              </p>
            </div>

            {/* Badge de visibilité */}
            {getVisibilityBadge()}
          </div>

          {/* Message personnalisé si flouté */}
          {visibilityState === 'blurred' && widget.visibilityRules.customMessage && (
            <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700 border border-amber-200">
              💡 {widget.visibilityRules.customMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Canvas principal du builder avec prévisualisation par plan
 */
const ProfileCanvas: React.FC<ProfileCanvasProps> = ({
  widgets,
  theme,
  selectedWidgetId,
  previewPlan,
  onSelectWidget,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
  const widgetIds = sortedWidgets.map(w => w.id);

  const spacingClasses = {
    compact: 'space-y-2',
    normal: 'space-y-4',
    spacious: 'space-y-6',
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        'min-h-[400px] p-4 rounded-lg border-2 border-dashed transition-colors',
        isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20',
        spacingClasses[theme.spacing]
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectWidget(null);
        }
      }}
    >
      {sortedWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Wrench className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">Canvas vide</p>
          <p className="text-sm">Glissez des widgets depuis la bibliothèque</p>
        </div>
      ) : (
        <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
          <div className={spacingClasses[theme.spacing]}>
            {sortedWidgets.map(widget => {
              const visibilityState = widget.isVisible 
                ? evaluateWidgetVisibility(widget, previewPlan)
                : 'hidden';
              
              return (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  isSelected={widget.id === selectedWidgetId}
                  visibilityState={visibilityState}
                  onClick={() => onSelectWidget(widget.id)}
                />
              );
            })}
          </div>
        </SortableContext>
      )}
    </div>
  );
};

export default ProfileCanvas;
