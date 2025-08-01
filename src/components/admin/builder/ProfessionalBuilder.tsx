import React, { useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useDragDropAdvanced } from '@/hooks/useDragDropAdvanced';
import { useResponsiveBuilder } from '@/hooks/useResponsiveBuilder';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useWidgetLibrary } from '@/hooks/useWidgetLibrary';

import { WidgetLibrary } from './WidgetLibrary';
import { ResponsiveCanvas } from './ResponsiveCanvas';
import { PropertyPanel } from './PropertyPanel';
import { ToolbarActions } from './ToolbarActions';
import { WidgetRenderer } from './widgets/WidgetRenderer';

export interface ProfessionalBuilderProps {
  type: 'dashboard' | 'pos' | 'plan';
  initialData?: any;
  onSave?: (data: any) => void;
  onPreview?: (data: any) => void;
  className?: string;
}

export function ProfessionalBuilder({
  type,
  initialData,
  onSave,
  onPreview,
  className = ''
}: ProfessionalBuilderProps) {
  // Initialize hooks
  const dragDrop = useDragDropAdvanced({
    onWidgetDrop: handleWidgetDrop,
    onWidgetUpdate: handleWidgetUpdate,
    onLayoutChange: handleLayoutChange
  });

  const responsive = useResponsiveBuilder({
    onBreakpointChange: handleBreakpointChange,
    enableDevicePreview: true
  });

  const canvas = useCanvasManager({
    maxHistorySize: 50,
    autoSave: true,
    autoSaveInterval: 3000
  });

  const widgetLibrary = useWidgetLibrary();

  // Setup drag and drop sensors
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

  // Event handlers
  function handleWidgetDrop(widget: any, dropZoneId: string) {
    canvas.addToHistory('Widget Added', getCurrentWidgets());
    console.log('Widget dropped:', widget, 'in zone:', dropZoneId);
  }

  function handleWidgetUpdate(widget: any) {
    canvas.addToHistory('Widget Updated', getCurrentWidgets());
    console.log('Widget updated:', widget);
  }

  function handleLayoutChange(dropZones: any) {
    console.log('Layout changed:', dropZones);
  }

  function handleBreakpointChange(breakpoint: any) {
    console.log('Breakpoint changed:', breakpoint);
  }

  function getCurrentWidgets() {
    return dragDrop.dropZones.find(zone => zone.id === 'main-canvas')?.widgets || [];
  }

  // Save and preview handlers
  const handleSave = useCallback(() => {
    const data = {
      type,
      widgets: getCurrentWidgets(),
      canvasSettings: canvas.canvasSettings,
      responsiveSettings: responsive.viewportState,
      timestamp: new Date().toISOString()
    };
    
    canvas.forceSave();
    onSave?.(data);
  }, [type, canvas, responsive, onSave]);

  const handlePreview = useCallback(() => {
    const data = {
      type,
      widgets: getCurrentWidgets(),
      canvasSettings: canvas.canvasSettings,
      responsiveSettings: responsive.viewportState
    };
    
    onPreview?.(data);
  }, [type, canvas, responsive, onPreview]);

  const handleUndo = useCallback(() => {
    const previousState = canvas.undo();
    if (previousState) {
      // Apply previous state to canvas
      console.log('Undo to state:', previousState);
    }
  }, [canvas]);

  const handleRedo = useCallback(() => {
    const nextState = canvas.redo();
    if (nextState) {
      // Apply next state to canvas
      console.log('Redo to state:', nextState);
    }
  }, [canvas]);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      // Load widgets and settings from initial data
      console.log('Loading initial data:', initialData);
    }
  }, [initialData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      canvas.cleanup();
    };
  }, [canvas]);

  return (
    <div className={`h-screen flex flex-col bg-background ${className}`}>
      {/* Toolbar */}
      <ToolbarActions
        type={type}
        canUndo={canvas.canUndo}
        canRedo={canvas.canRedo}
        isDirty={canvas.isDirty}
        lastSaved={canvas.lastSaved}
        onSave={handleSave}
        onPreview={handlePreview}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={() => console.log('Export')}
        onImport={() => console.log('Import')}
        responsive={responsive}
        canvas={canvas}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={dragDrop.handleDragStart}
          onDragOver={dragDrop.handleDragOver}
          onDragEnd={dragDrop.handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          {/* Left Panel - Widget Library */}
          <div className="w-80 border-r border-border bg-card overflow-hidden flex flex-col">
            <WidgetLibrary
              widgetLibrary={widgetLibrary}
              categoryFilter={type}
            />
          </div>

          {/* Center Panel - Canvas */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ResponsiveCanvas
              responsive={responsive}
              canvas={canvas}
              dragDrop={dragDrop}
            />
          </div>

          {/* Right Panel - Properties */}
          <div className="w-80 border-l border-border bg-card overflow-hidden flex flex-col">
            <PropertyPanel
              selectedWidget={
                canvas.selectedWidgetId 
                  ? dragDrop.findWidgetById(canvas.selectedWidgetId)
                  : null
              }
              widgetDefinition={
                canvas.selectedWidgetId
                  ? widgetLibrary.getWidgetDefinition(
                      dragDrop.findWidgetById(canvas.selectedWidgetId)?.type || ''
                    )
                  : null
              }
              onUpdateWidget={(updates) => {
                if (canvas.selectedWidgetId) {
                  dragDrop.updateWidget(canvas.selectedWidgetId, updates);
                }
              }}
              responsiveState={responsive.viewportState}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {dragDrop.draggedWidget ? (
              <div className="bg-primary/10 border-2 border-primary border-dashed rounded-lg p-4">
                <WidgetRenderer
                  widget={dragDrop.draggedWidget}
                  isPreview={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}