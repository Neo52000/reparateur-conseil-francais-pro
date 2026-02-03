import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROFILE_WIDGETS, WidgetLibraryItem, ProfileWidgetType } from '@/types/profileBuilder';
import { 
  User, FileText, Phone, Image, Clock, Wrench, 
  Euro, Award, MapPin, Star, GripVertical, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileWidgetLibraryProps {
  availableWidgetTypes: WidgetLibraryItem[];
  onAddWidget: (type: ProfileWidgetType) => void;
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
 * Item draggable de la bibliothèque de widgets
 */
const DraggableWidgetItem: React.FC<{
  widget: WidgetLibraryItem;
  onAdd: () => void;
}> = ({ widget, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${widget.type}`,
    data: { type: widget.type, fromLibrary: true },
  });

  const Icon = ICON_MAP[widget.icon] || Wrench;
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const planColors: Record<string, string> = {
    'Gratuit': 'bg-gray-100 text-gray-700',
    'Visibilité': 'bg-blue-100 text-blue-700',
    'Pro': 'bg-purple-100 text-purple-700',
    'Premium': 'bg-amber-100 text-amber-700',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 rounded-lg border border-border bg-card
        hover:border-primary/50 hover:shadow-sm transition-all cursor-grab
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-2 flex-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{widget.name}</p>
          <p className="text-xs text-muted-foreground truncate">{widget.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`text-xs ${planColors[widget.defaultMinPlan]}`}>
          {widget.defaultMinPlan}
        </Badge>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Bibliothèque de widgets pour le builder de profils
 */
const ProfileWidgetLibrary: React.FC<ProfileWidgetLibraryProps> = ({
  availableWidgetTypes,
  onAddWidget,
}) => {
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Widgets disponibles
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Glissez-déposez pour ajouter au canvas
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-2 pb-4">
        {availableWidgetTypes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tous les widgets sont utilisés</p>
          </div>
        ) : (
          availableWidgetTypes.map(widget => (
            <DraggableWidgetItem
              key={widget.type}
              widget={widget}
              onAdd={() => onAddWidget(widget.type)}
            />
          ))
        )}
        
        {/* Section des widgets utilisés */}
        {PROFILE_WIDGETS.length - availableWidgetTypes.length > 0 && (
          <div className="pt-4 mt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Widgets dans le canvas ({PROFILE_WIDGETS.length - availableWidgetTypes.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {PROFILE_WIDGETS.filter(
                w => !availableWidgetTypes.find(a => a.type === w.type)
              ).map(widget => {
                const Icon = ICON_MAP[widget.icon] || Wrench;
                return (
                  <Badge 
                    key={widget.type} 
                    variant="secondary" 
                    className="text-xs gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    {widget.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileWidgetLibrary;
