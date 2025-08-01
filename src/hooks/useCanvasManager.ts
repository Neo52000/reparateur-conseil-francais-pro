import { useState, useCallback, useRef } from 'react';
import { WidgetData } from './useDragDropAdvanced';

export interface CanvasHistory {
  id: string;
  timestamp: number;
  action: string;
  state: WidgetData[];
}

export interface CanvasSettings {
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGuides: boolean;
  backgroundColor: string;
  padding: number;
}

export interface UseCanvasManagerOptions {
  maxHistorySize?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export function useCanvasManager(options: UseCanvasManagerOptions = {}) {
  const {
    maxHistorySize = 50,
    autoSave = true,
    autoSaveInterval = 5000
  } = options;

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    gridEnabled: true,
    gridSize: 20,
    snapToGrid: true,
    showGuides: true,
    backgroundColor: 'hsl(var(--background))',
    padding: 20
  });

  const [history, setHistory] = useState<CanvasHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Selection management
  const selectWidget = useCallback((widgetId: string | null) => {
    setSelectedWidgetId(widgetId);
  }, []);

  const isWidgetSelected = useCallback((widgetId: string) => {
    return selectedWidgetId === widgetId;
  }, [selectedWidgetId]);

  // Hover management
  const setHoveredWidget = useCallback((widgetId: string | null) => {
    setHoveredWidgetId(widgetId);
  }, []);

  const isWidgetHovered = useCallback((widgetId: string) => {
    return hoveredWidgetId === widgetId;
  }, [hoveredWidgetId]);

  // Canvas settings
  const updateCanvasSettings = useCallback((updates: Partial<CanvasSettings>) => {
    setCanvasSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleGrid = useCallback(() => {
    setCanvasSettings(prev => ({ ...prev, gridEnabled: !prev.gridEnabled }));
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setCanvasSettings(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const toggleGuides = useCallback(() => {
    setCanvasSettings(prev => ({ ...prev, showGuides: !prev.showGuides }));
  }, []);

  // Grid utilities
  const snapToGrid = useCallback((x: number, y: number) => {
    if (!canvasSettings.snapToGrid) return { x, y };
    
    const { gridSize } = canvasSettings;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [canvasSettings]);

  const getGridBackgroundStyle = useCallback((): React.CSSProperties => {
    if (!canvasSettings.gridEnabled) return {};

    const { gridSize } = canvasSettings;
    return {
      backgroundImage: `
        linear-gradient(hsl(var(--border)) 1px, transparent 1px),
        linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundPosition: '0 0, 0 0'
    };
  }, [canvasSettings]);

  // History management
  const addToHistory = useCallback((action: string, widgets: WidgetData[]) => {
    const historyEntry: CanvasHistory = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      state: JSON.parse(JSON.stringify(widgets)) // Deep clone
    };

    setHistory(prev => {
      // Remove any history after current index (when undoing then making new changes)
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(historyEntry);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      return newHistory;
    });

    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
    setIsDirty(true);

    // Setup auto-save
    if (autoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      autoSaveTimer.current = setTimeout(() => {
        setLastSaved(new Date());
        setIsDirty(false);
      }, autoSaveInterval);
    }
  }, [historyIndex, maxHistorySize, autoSave, autoSaveInterval]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1].state;
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1].state;
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setIsDirty(false);
  }, []);

  // Manual save
  const forceSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    setLastSaved(new Date());
    setIsDirty(false);
  }, []);

  // Canvas utilities
  const getCanvasStyle = useCallback((): React.CSSProperties => {
    return {
      backgroundColor: canvasSettings.backgroundColor,
      padding: `${canvasSettings.padding}px`,
      position: 'relative',
      minHeight: '100%',
      ...getGridBackgroundStyle()
    };
  }, [canvasSettings, getGridBackgroundStyle]);

  // Widget positioning utilities
  const getWidgetBounds = useCallback((widget: WidgetData) => {
    const position = widget.position || { x: 0, y: 0 };
    const size = widget.size || { width: 100, height: 100 };
    
    return {
      left: position.x,
      top: position.y,
      right: position.x + size.width,
      bottom: position.y + size.height,
      width: size.width,
      height: size.height
    };
  }, []);

  const getWidgetAtPosition = useCallback((x: number, y: number, widgets: WidgetData[]) => {
    // Find the topmost widget at the given position
    for (let i = widgets.length - 1; i >= 0; i--) {
      const widget = widgets[i];
      const bounds = getWidgetBounds(widget);
      
      if (x >= bounds.left && x <= bounds.right && 
          y >= bounds.top && y <= bounds.bottom) {
        return widget;
      }
    }
    return null;
  }, [getWidgetBounds]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
  }, []);

  return {
    // Selection state
    selectedWidgetId,
    hoveredWidgetId,
    selectWidget,
    isWidgetSelected,
    setHoveredWidget,
    isWidgetHovered,

    // Canvas settings
    canvasSettings,
    updateCanvasSettings,
    toggleGrid,
    toggleSnapToGrid,
    toggleGuides,
    snapToGrid,
    getGridBackgroundStyle,
    getCanvasStyle,

    // History
    history,
    historyIndex,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    clearHistory,

    // Save state
    isDirty,
    lastSaved,
    forceSave,

    // Utilities
    getWidgetBounds,
    getWidgetAtPosition,
    cleanup
  };
}