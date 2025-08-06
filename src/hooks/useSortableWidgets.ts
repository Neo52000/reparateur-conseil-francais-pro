import { useState, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';

export interface SortableWidget {
  id: string;
  type: string;
  name: string;
  category: string;
  config: any;
  isVisible: boolean;
  order: number;
}

interface UseSortableWidgetsOptions {
  onLayoutChange?: (widgets: SortableWidget[]) => void;
  onWidgetUpdate?: (widget: SortableWidget) => void;
}

export function useSortableWidgets(
  initialWidgets: SortableWidget[] = [],
  options: UseSortableWidgetsOptions = {}
) {
  const [widgets, setWidgets] = useState<SortableWidget[]>(initialWidgets);
  const [selectedWidget, setSelectedWidget] = useState<SortableWidget | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        options.onLayoutChange?.(newOrder);
        return newOrder;
      });
    }
  }, [options]);

  const addWidget = useCallback((type: string, name: string, category: string, config: any = {}) => {
    const newWidget: SortableWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      name,
      category,
      config,
      isVisible: true,
      order: widgets.length
    };

    setWidgets(prev => [...prev, newWidget]);
    setHasChanges(true);
    return newWidget.id;
  }, [widgets.length]);

  const updateWidget = useCallback((id: string, updates: Partial<SortableWidget>) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, ...updates } : widget
    ));
    
    if (selectedWidget?.id === id) {
      setSelectedWidget(prev => prev ? { ...prev, ...updates } : null);
    }

    const updatedWidget = widgets.find(w => w.id === id);
    if (updatedWidget) {
      options.onWidgetUpdate?.({ ...updatedWidget, ...updates });
    }
    
    setHasChanges(true);
  }, [widgets, selectedWidget, options]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    
    if (selectedWidget?.id === id) {
      setSelectedWidget(null);
    }
    
    setHasChanges(true);
    toast({
      title: "Widget supprimé",
      description: "Le widget a été retiré de la configuration",
    });
  }, [selectedWidget, toast]);

  const toggleWidgetVisibility = useCallback((id: string) => {
    updateWidget(id, { 
      isVisible: !widgets.find(w => w.id === id)?.isVisible 
    });
  }, [widgets, updateWidget]);

  const duplicateWidget = useCallback((id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      const duplicatedWidget: SortableWidget = {
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${widget.name} (copie)`,
        order: widgets.length
      };
      
      setWidgets(prev => [...prev, duplicatedWidget]);
      setHasChanges(true);
      return duplicatedWidget.id;
    }
  }, [widgets]);

  const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
    setWidgets(prev => {
      const newOrder = arrayMove(prev, startIndex, endIndex);
      setHasChanges(true);
      options.onLayoutChange?.(newOrder);
      return newOrder;
    });
  }, [options]);

  const getWidgetsByCategory = useCallback((category: string) => {
    return widgets.filter(widget => widget.category === category);
  }, [widgets]);

  const getVisibleWidgets = useCallback(() => {
    return widgets.filter(widget => widget.isVisible);
  }, [widgets]);

  const clearChanges = useCallback(() => {
    setHasChanges(false);
  }, []);

  const resetWidgets = useCallback(() => {
    setWidgets(initialWidgets);
    setSelectedWidget(null);
    setHasChanges(false);
  }, [initialWidgets]);

  return {
    widgets,
    selectedWidget,
    hasChanges,
    setSelectedWidget,
    handleDragEnd,
    addWidget,
    updateWidget,
    removeWidget,
    toggleWidgetVisibility,
    duplicateWidget,
    reorderWidgets,
    getWidgetsByCategory,
    getVisibleWidgets,
    clearChanges,
    resetWidgets
  };
}