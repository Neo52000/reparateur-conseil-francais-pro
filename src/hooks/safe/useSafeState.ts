import { useState as reactUseState, useCallback } from 'react';

export function useSafeState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  try {
    const [state, setState] = reactUseState<T>(initialValue);
    
    const safeSetState = useCallback((value: T | ((prev: T) => T)) => {
      try {
        setState(value);
      } catch (error) {
        console.error('State update failed:', error);
      }
    }, [setState]);
    
    return [state, safeSetState];
  } catch (error) {
    console.error('useState hook failed, using fallback:', error);
    return [initialValue, () => {}];
  }
}