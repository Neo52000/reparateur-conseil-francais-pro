import { useEffect, useRef, useCallback, useState } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

/**
 * Hook pour la sauvegarde automatique
 * Sauvegarde les données après un délai d'inactivité
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true
}: UseAutoSaveOptions<T>) {
  const debouncedData = useDebounce(data, delay);
  const previousDataRef = useRef<T>(data);
  const isFirstRender = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveData = useCallback(async (dataToSave: T) => {
    if (!enabled) return;
    
    try {
      setIsSaving(true);
      await onSave(dataToSave);
      setLastSaved(new Date());
      previousDataRef.current = dataToSave;
    } catch (error) {
      console.error('Erreur sauvegarde automatique:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, enabled]);

  useEffect(() => {
    // Ignorer le premier rendu
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = data;
      return;
    }

    // Vérifier si les données ont changé
    const hasChanged = JSON.stringify(debouncedData) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged && enabled) {
      saveData(debouncedData);
    }
  }, [debouncedData, enabled, saveData]);

  return {
    isSaving,
    lastSaved,
    forceSave: () => saveData(data)
  };
}