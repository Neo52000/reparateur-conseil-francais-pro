import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  Copy, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SortableWidget as SortableWidgetType } from '@/hooks/useSortableWidgets';

interface SortableWidgetProps {
  widget: SortableWidgetType;
  isSelected?: boolean;
  onSelect?: (widget: SortableWidgetType) => void;
  onToggleVisibility?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRemove?: (id: string) => void;
  onSettings?: (widget: SortableWidgetType) => void;
  children?: React.ReactNode;
  showControls?: boolean;
  compact?: boolean;
}

export function SortableWidget({
  widget,
  isSelected = false,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onRemove,
  onSettings,
  children,
  showControls = true,
  compact = false
}: SortableWidgetProps) {
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

  const handleClick = () => {
    onSelect?.(widget);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        relative transition-all duration-200 ease-in-out
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${!widget.isVisible ? 'opacity-60' : ''}
        ${compact ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={compact ? handleClick : undefined}
    >
      <CardHeader className={`${compact ? 'p-3' : 'p-4'} pb-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:text-primary transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <CardTitle className={`${compact ? 'text-sm' : 'text-base'} truncate`}>
                {widget.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {widget.category}
              </Badge>
              {!widget.isVisible && (
                <Badge variant="secondary" className="text-xs">
                  Masqué
                </Badge>
              )}
            </div>
          </div>

          {showControls && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility?.(widget.id);
                }}
                className="h-6 w-6 p-0"
              >
                {widget.isVisible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>

              {!compact && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettings?.(widget);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate?.(widget.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.(widget.id);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="p-4 pt-0">
          {children || (
            <div className="text-sm text-muted-foreground">
              Widget de type {widget.type}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}