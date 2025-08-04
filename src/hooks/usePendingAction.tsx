import React, { useState, useEffect } from 'react';

interface PendingActionData {
  repairerId: string;
  quoteId?: string;
}

interface PendingAction {
  type: 'quote_request' | 'appointment_request';
  data: PendingActionData;
}

export const usePendingAction = () => {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    // Charger l'action en attente depuis localStorage
    const stored = localStorage.getItem('pendingAction');
    if (stored) {
      try {
        const action = JSON.parse(stored);
        setPendingAction(action);
      } catch (error) {
        console.error('Error parsing pending action:', error);
        localStorage.removeItem('pendingAction');
      }
    }
  }, []);

  const storePendingAction = (action: PendingAction) => {
    setPendingAction(action);
    localStorage.setItem('pendingAction', JSON.stringify(action));
  };

  const storePendingAppointmentAction = (data: PendingActionData) => {
    const action: PendingAction = {
      type: 'appointment_request',
      data
    };
    storePendingAction(action);
  };

  const clearPendingAction = () => {
    setPendingAction(null);
    localStorage.removeItem('pendingAction');
  };

  return {
    pendingAction,
    storePendingAction,
    storePendingAppointmentAction,
    clearPendingAction
  };
};