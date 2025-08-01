import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Trash2, Move, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetData } from '@/hooks/useDragDropAdvanced';
import { CanvasSettings } from '@/hooks/useCanvasManager';
import { ViewportState } from '@/hooks/useResponsiveBuilder';
import { WidgetRenderer } from './widgets/WidgetRenderer';

interface CanvasWidgetProps {
  widget: WidgetData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
  onUpdate: (updates: Partial<WidgetData>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canvasSettings: CanvasSettings;
  responsiveState: ViewportState;
}

export function CanvasWidget({
  widget,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onUpdate,
  onRemove,
  onDuplicate,
  canvasSettings,
  responsiveState
}: CanvasWidgetProps) {
  const [showActions, setShowActions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    data: {
      type: 'canvas-widget',
      widget: widget
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get responsive styles for current breakpoint
  const getResponsiveStyles = () => {
    const baseStyles = widget.styles || {};
    const responsiveStyles = widget.responsiveStyles?.[responsiveState.breakpoint] || {};
    
    return {
      ...baseStyles,
      ...responsiveStyles,
      position: widget.position ? 'absolute' : 'relative',
      left: widget.position?.x || 'auto',
      top: widget.position?.y || 'auto',
      width: widget.size?.width || 'auto',
      height: widget.size?.height || 'auto',
      zIndex: isSelected ? 1000 : 'auto',
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseEnter = () => {
    onHover();
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    onHoverEnd();
    setShowActions(false);
  };

  const widgetStyle = {
    ...style,
    ...getResponsiveStyles()
  };

  return (
    <div
      ref={setNodeRef}
      style={widgetStyle}
      className={`
        relative group cursor-pointer
        ${isDragging ? 'opacity-50' : ''}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isHovered && !isSelected ? 'ring-1 ring-primary/50' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Widget Content */}
      <div className="relative">
        <WidgetRenderer
          widget={widget}
          isSelected={isSelected}
          isHovered={isHovered}
          responsiveState={responsiveState}
        />
      </div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner Handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
        </div>
      )}

      {/* Action Toolbar */}
      {(isSelected || showActions) && !isDragging && (
        <div className="absolute -top-10 left-0 flex items-center gap-1 bg-background border border-border rounded-md shadow-lg p-1 z-50">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            {...listeners}
            {...attributes}
          >
            <Move className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Open settings panel - handled by parent
            }}
          >
            <Settings className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Widget Label */}
      {isSelected && (
        <div className="absolute -bottom-6 left-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          {widget.type}
        </div>
      )}
    </div>
  );
}