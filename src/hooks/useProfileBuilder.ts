import { useState, useCallback, useMemo } from 'react';
import { ProfileWidget, ProfileTheme, createDefaultWidget, PROFILE_WIDGETS, ProfileWidgetType } from '@/types/profileBuilder';
import { arrayMove } from '@dnd-kit/sortable';

interface BuilderState {
  widgets: ProfileWidget[];
  theme: ProfileTheme;
  selectedWidgetId: string | null;
  isDirty: boolean;
}

interface HistoryState {
  past: BuilderState[];
  future: BuilderState[];
}

/**
 * Hook pour gérer l'état du builder de profils
 */
export const useProfileBuilder = (
  initialWidgets: ProfileWidget[] = [],
  initialTheme: ProfileTheme = {
    primaryColor: '217 91% 60%',
    accentColor: '142 76% 36%',
    fontFamily: 'Inter',
    spacing: 'normal',
  }
) => {
  const [state, setState] = useState<BuilderState>({
    widgets: initialWidgets,
    theme: initialTheme,
    selectedWidgetId: null,
    isDirty: false,
  });

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
  });

  /**
   * Sauvegarde l'état actuel dans l'historique
   */
  const saveToHistory = useCallback(() => {
    setHistory(prev => ({
      past: [...prev.past.slice(-19), state], // Garder les 20 derniers états
      future: [],
    }));
  }, [state]);

  /**
   * Met à jour l'état avec sauvegarde dans l'historique
   */
  const updateState = useCallback((updates: Partial<BuilderState>) => {
    saveToHistory();
    setState(prev => ({ ...prev, ...updates, isDirty: true }));
  }, [saveToHistory]);

  /**
   * Annule la dernière action (Undo)
   */
  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [state, ...prev.future],
    }));
    setState(previous);
  }, [history.past, state]);

  /**
   * Refait la dernière action annulée (Redo)
   */
  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    setHistory(prev => ({
      past: [...prev.past, state],
      future: prev.future.slice(1),
    }));
    setState(next);
  }, [history.future, state]);

  /**
   * Sélectionne un widget
   */
  const selectWidget = useCallback((widgetId: string | null) => {
    setState(prev => ({ ...prev, selectedWidgetId: widgetId }));
  }, []);

  /**
   * Ajoute un widget depuis la bibliothèque
   */
  const addWidget = useCallback((type: ProfileWidgetType) => {
    const newWidget = createDefaultWidget(type, state.widgets.length);
    updateState({ widgets: [...state.widgets, newWidget] });
    return newWidget;
  }, [state.widgets, updateState]);

  /**
   * Supprime un widget
   */
  const removeWidget = useCallback((widgetId: string) => {
    const filtered = state.widgets.filter(w => w.id !== widgetId);
    // Réordonne les widgets restants
    const reordered = filtered.map((w, index) => ({ ...w, order: index }));
    
    updateState({ 
      widgets: reordered,
      selectedWidgetId: state.selectedWidgetId === widgetId ? null : state.selectedWidgetId,
    });
  }, [state.widgets, state.selectedWidgetId, updateState]);

  /**
   * Met à jour un widget
   */
  const updateWidget = useCallback((widgetId: string, updates: Partial<ProfileWidget>) => {
    const updatedWidgets = state.widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    updateState({ widgets: updatedWidgets });
  }, [state.widgets, updateState]);

  /**
   * Réordonne les widgets après un drag & drop
   */
  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    const oldIndex = state.widgets.findIndex(w => w.id === activeId);
    const newIndex = state.widgets.findIndex(w => w.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(state.widgets, oldIndex, newIndex).map((w, index) => ({
      ...w,
      order: index,
    }));

    updateState({ widgets: reordered });
  }, [state.widgets, updateState]);

  /**
   * Met à jour le thème
   */
  const updateTheme = useCallback((updates: Partial<ProfileTheme>) => {
    updateState({ theme: { ...state.theme, ...updates } });
  }, [state.theme, updateState]);

  /**
   * Toggle la visibilité d'un widget
   */
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const widget = state.widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isVisible: !widget.isVisible });
    }
  }, [state.widgets, updateWidget]);

  /**
   * Réinitialise le builder avec de nouvelles données
   */
  const resetBuilder = useCallback((widgets: ProfileWidget[], theme: ProfileTheme) => {
    setState({
      widgets,
      theme,
      selectedWidgetId: null,
      isDirty: false,
    });
    setHistory({ past: [], future: [] });
  }, []);

  /**
   * Marque les changements comme sauvegardés
   */
  const markAsSaved = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false }));
  }, []);

  /**
   * Widget actuellement sélectionné
   */
  const selectedWidget = useMemo(() => {
    return state.widgets.find(w => w.id === state.selectedWidgetId) || null;
  }, [state.widgets, state.selectedWidgetId]);

  /**
   * Widgets triés par ordre
   */
  const sortedWidgets = useMemo(() => {
    return [...state.widgets].sort((a, b) => a.order - b.order);
  }, [state.widgets]);

  /**
   * Types de widgets non encore utilisés
   */
  const availableWidgetTypes = useMemo(() => {
    const usedTypes = new Set(state.widgets.map(w => w.type));
    return PROFILE_WIDGETS.filter(w => !usedTypes.has(w.type));
  }, [state.widgets]);

  return {
    // État
    widgets: sortedWidgets,
    theme: state.theme,
    selectedWidgetId: state.selectedWidgetId,
    selectedWidget,
    isDirty: state.isDirty,
    availableWidgetTypes,
    
    // Actions sur les widgets
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    selectWidget,
    toggleWidgetVisibility,
    
    // Actions sur le thème
    updateTheme,
    
    // Historique
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    
    // Utilitaires
    resetBuilder,
    markAsSaved,
  };
};
