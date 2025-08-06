import { useState, useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';

export interface DragDropItem {
  id: string;
  type: string;
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: any;
}

export interface DragDropContainer {
  id: string;
  name: string;
  items: DragDropItem[];
  layout: 'grid' | 'flex' | 'absolute';
  columns?: number;
  gap?: number;
}

interface UseDragAndDropBuilderOptions {
  onLayoutChange?: (containers: DragDropContainer[]) => void;
  onItemChange?: (item: DragDropItem) => void;
}

export function useDragAndDropBuilder(options: UseDragAndDropBuilderOptions = {}) {
  const [containers, setContainers] = useState<DragDropContainer[]>([]);
  const [selectedItem, setSelectedItem] = useState<DragDropItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);

  const addContainer = useCallback((container: Omit<DragDropContainer, 'id'>) => {
    const newContainer = {
      ...container,
      id: `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setContainers(prev => [...prev, newContainer]);
    return newContainer.id;
  }, []);

  const updateContainer = useCallback((containerId: string, updates: Partial<DragDropContainer>) => {
    setContainers(prev => prev.map(container =>
      container.id === containerId ? { ...container, ...updates } : container
    ));
  }, []);

  const removeContainer = useCallback((containerId: string) => {
    setContainers(prev => prev.filter(container => container.id !== containerId));
  }, []);

  const addItem = useCallback((containerId: string, item: Omit<DragDropItem, 'id'>) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setContainers(prev => prev.map(container =>
      container.id === containerId
        ? { ...container, items: [...container.items, newItem] }
        : container
    ));
    return newItem.id;
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<DragDropItem>) => {
    setContainers(prev => prev.map(container => ({
      ...container,
      items: container.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    })));

    if (selectedItem?.id === itemId) {
      setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
    }

    options.onItemChange?.({ ...selectedItem!, ...updates } as DragDropItem);
  }, [selectedItem, options]);

  const removeItem = useCallback((itemId: string) => {
    setContainers(prev => prev.map(container => ({
      ...container,
      items: container.items.filter(item => item.id !== itemId)
    })));
    
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  }, [selectedItem]);

  const moveItem = useCallback((
    sourceContainerId: string,
    destinationContainerId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    setContainers(prev => {
      const newContainers = [...prev];
      
      const sourceContainer = newContainers.find(c => c.id === sourceContainerId);
      const destinationContainer = newContainers.find(c => c.id === destinationContainerId);
      
      if (!sourceContainer || !destinationContainer) return prev;
      
      const [movedItem] = sourceContainer.items.splice(sourceIndex, 1);
      destinationContainer.items.splice(destinationIndex, 0, movedItem);
      
      options.onLayoutChange?.(newContainers);
      return newContainers;
    });
  }, [options]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveItem(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  }, [moveItem]);

  const duplicateItem = useCallback((itemId: string) => {
    const container = containers.find(c => c.items.some(item => item.id === itemId));
    const item = container?.items.find(item => item.id === itemId);
    
    if (container && item) {
      const duplicatedItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: { ...item.position, x: item.position.x + 20, y: item.position.y + 20 }
      };
      
      setContainers(prev => prev.map(c =>
        c.id === container.id
          ? { ...c, items: [...c.items, duplicatedItem] }
          : c
      ));
      
      return duplicatedItem.id;
    }
  }, [containers]);

  const getContainerById = useCallback((id: string) => {
    return containers.find(container => container.id === id);
  }, [containers]);

  const getItemById = useCallback((id: string) => {
    for (const container of containers) {
      const item = container.items.find(item => item.id === id);
      if (item) return item;
    }
    return null;
  }, [containers]);

  const clearAll = useCallback(() => {
    setContainers([]);
    setSelectedItem(null);
    setDraggedItem(null);
  }, []);

  const exportLayout = useCallback(() => {
    return {
      containers,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }, [containers]);

  const importLayout = useCallback((layout: any) => {
    if (layout.containers) {
      setContainers(layout.containers);
      setSelectedItem(null);
      setDraggedItem(null);
      options.onLayoutChange?.(layout.containers);
    }
  }, [options]);

  return {
    containers,
    selectedItem,
    draggedItem,
    setSelectedItem,
    setDraggedItem,
    addContainer,
    updateContainer,
    removeContainer,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    handleDragEnd,
    duplicateItem,
    getContainerById,
    getItemById,
    clearAll,
    exportLayout,
    importLayout
  };
}