import { useState, useCallback } from 'react';
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';

export interface WidgetData {
  id: string;
  type: string;
  category: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  responsiveStyles: {
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
  };
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface DropZone {
  id: string;
  type: 'canvas' | 'container';
  accepts: string[];
  widgets: WidgetData[];
}

export interface UseDragDropAdvancedOptions {
  onWidgetDrop?: (widget: WidgetData, dropZoneId: string) => void;
  onWidgetUpdate?: (widget: WidgetData) => void;
  onLayoutChange?: (dropZones: DropZone[]) => void;
}

export function useDragDropAdvanced(options: UseDragDropAdvancedOptions = {}) {
  const [dropZones, setDropZones] = useState<DropZone[]>([
    {
      id: 'main-canvas',
      type: 'canvas',
      accepts: ['dashboard', 'pos', 'plan', 'layout'],
      widgets: []
    }
  ]);
  
  const [activeWidget, setActiveWidget] = useState<WidgetData | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<WidgetData | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    // Find the widget being dragged
    const widget = findWidgetById(active.id as string);
    setActiveWidget(widget);
    setDraggedWidget(widget);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over logic for visual feedback
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeWidget) {
      setActiveWidget(null);
      setDraggedWidget(null);
      return;
    }

    const dropZoneId = over.id as string;
    const dropZone = dropZones.find(zone => zone.id === dropZoneId);
    
    if (!dropZone || !dropZone.accepts.includes(activeWidget.category)) {
      setActiveWidget(null);
      setDraggedWidget(null);
      return;
    }

    // Handle different drop scenarios
    if (active.data.current?.source === 'library') {
      // Dropping from widget library - create new widget
      const newWidget: WidgetData = {
        ...activeWidget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      
      addWidgetToDropZone(dropZoneId, newWidget);
      options.onWidgetDrop?.(newWidget, dropZoneId);
    } else {
      // Moving existing widget
      moveWidget(activeWidget.id, dropZoneId);
    }

    setActiveWidget(null);
    setDraggedWidget(null);
  }, [activeWidget, dropZones, options]);

  const addWidgetToDropZone = useCallback((dropZoneId: string, widget: WidgetData) => {
    setDropZones(prev => prev.map(zone =>
      zone.id === dropZoneId
        ? { ...zone, widgets: [...zone.widgets, widget] }
        : zone
    ));
    options.onLayoutChange?.(dropZones);
  }, [dropZones, options]);

  const moveWidget = useCallback((widgetId: string, targetDropZoneId: string) => {
    setDropZones(prev => {
      let movedWidget: WidgetData | null = null;
      
      // Remove widget from current location
      const updated = prev.map(zone => ({
        ...zone,
        widgets: zone.widgets.filter(widget => {
          if (widget.id === widgetId) {
            movedWidget = widget;
            return false;
          }
          return true;
        })
      }));
      
      // Add widget to new location
      if (movedWidget) {
        return updated.map(zone =>
          zone.id === targetDropZoneId
            ? { ...zone, widgets: [...zone.widgets, movedWidget!] }
            : zone
        );
      }
      
      return updated;
    });
    options.onLayoutChange?.(dropZones);
  }, [dropZones, options]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetData>) => {
    setDropZones(prev => prev.map(zone => ({
      ...zone,
      widgets: zone.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    })));
    
    const updatedWidget = findWidgetById(widgetId);
    if (updatedWidget) {
      options.onWidgetUpdate?.({ ...updatedWidget, ...updates } as WidgetData);
    }
  }, [options]);

  const removeWidget = useCallback((widgetId: string) => {
    setDropZones(prev => prev.map(zone => ({
      ...zone,
      widgets: zone.widgets.filter(widget => widget.id !== widgetId)
    })));
    options.onLayoutChange?.(dropZones);
  }, [dropZones, options]);

  const duplicateWidget = useCallback((widgetId: string) => {
    const widget = findWidgetById(widgetId);
    if (widget) {
      const duplicatedWidget: WidgetData = {
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: widget.position ? 
          { x: widget.position.x + 20, y: widget.position.y + 20 } : 
          undefined
      };
      
      // Find the drop zone containing the original widget
      const dropZone = dropZones.find(zone => 
        zone.widgets.some(w => w.id === widgetId)
      );
      
      if (dropZone) {
        addWidgetToDropZone(dropZone.id, duplicatedWidget);
      }
    }
  }, [dropZones, addWidgetToDropZone]);

  const findWidgetById = useCallback((id: string): WidgetData | null => {
    for (const zone of dropZones) {
      const widget = zone.widgets.find(w => w.id === id);
      if (widget) return widget;
    }
    return null;
  }, [dropZones]);

  const addDropZone = useCallback((dropZone: Omit<DropZone, 'id'>) => {
    const newDropZone: DropZone = {
      ...dropZone,
      id: `dropzone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setDropZones(prev => [...prev, newDropZone]);
    return newDropZone.id;
  }, []);

  const removeDropZone = useCallback((dropZoneId: string) => {
    setDropZones(prev => prev.filter(zone => zone.id !== dropZoneId));
  }, []);

  const clearCanvas = useCallback(() => {
    setDropZones(prev => prev.map(zone => ({ ...zone, widgets: [] })));
    setActiveWidget(null);
    setDraggedWidget(null);
  }, []);

  return {
    dropZones,
    activeWidget,
    draggedWidget,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addWidgetToDropZone,
    moveWidget,
    updateWidget,
    removeWidget,
    duplicateWidget,
    findWidgetById,
    addDropZone,
    removeDropZone,
    clearCanvas,
  };
}