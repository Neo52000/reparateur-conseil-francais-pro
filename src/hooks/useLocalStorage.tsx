import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur avec fallback de sécurité
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Fallback de sécurité pour éviter les erreurs React
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Obtenir de localStorage par clé
      const item = window.localStorage.getItem(key);
      // Parser JSON ou retourner initialValue si non trouvé
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si erreur, retourner la valeur initiale
      console.warn('LocalStorage error:', error);
      return initialValue;
    }
  });

  // Fonction pour définir la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Une erreur plus avancée pourrait être d'alerter l'utilisateur
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}