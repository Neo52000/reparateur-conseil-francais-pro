import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';
import { SortableWidget as SortableWidgetType, useSortableWidgets } from '@/hooks/useSortableWidgets';

interface SortableContainerProps {
  widgets: SortableWidgetType[];
  onDragEnd: (event: any) => void;
  onWidgetSelect?: (widget: SortableWidgetType) => void;
  onWidgetToggleVisibility?: (id: string) => void;
  onWidgetDuplicate?: (id: string) => void;
  onWidgetRemove?: (id: string) => void;
  onWidgetSettings?: (widget: SortableWidgetType) => void;
  selectedWidget?: SortableWidgetType | null;
  draggedWidget?: SortableWidgetType | null;
  renderWidget?: (widget: SortableWidgetType) => React.ReactNode;
  showControls?: boolean;
  compact?: boolean;
  className?: string;
}

export function SortableContainer({
  widgets,
  onDragEnd,
  onWidgetSelect,
  onWidgetToggleVisibility,
  onWidgetDuplicate,
  onWidgetRemove,
  onWidgetSettings,
  selectedWidget,
  draggedWidget,
  renderWidget,
  showControls = true,
  compact = false,
  className = ""
}: SortableContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
        <div className={`space-y-2 ${className}`}>
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              isSelected={selectedWidget?.id === widget.id}
              onSelect={onWidgetSelect}
              onToggleVisibility={onWidgetToggleVisibility}
              onDuplicate={onWidgetDuplicate}
              onRemove={onWidgetRemove}
              onSettings={onWidgetSettings}
              showControls={showControls}
              compact={compact}
            >
              {renderWidget?.(widget)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {draggedWidget && (
          <div className="opacity-95 rotate-3 scale-105">
            <SortableWidget
              widget={draggedWidget}
              showControls={false}
              compact={compact}
            >
              {renderWidget?.(draggedWidget)}
            </SortableWidget>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}