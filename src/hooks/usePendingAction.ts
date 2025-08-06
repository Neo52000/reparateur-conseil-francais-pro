
import { useState, useEffect } from 'react';

interface QuoteFormData {
  device_type: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  client_email: string;
  client_name: string;
  repairerId: string;
}

interface AppointmentData {
  repairerId: string;
  quoteId?: string;
}

interface PendingAction {
  type: 'quote_request' | 'appointment_request';
  data: QuoteFormData | AppointmentData;
}

export const usePendingAction = () => {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pendingAction');
    if (stored) {
      try {
        setPendingAction(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing pending action:', error);
        localStorage.removeItem('pendingAction');
      }
    }
  }, []);

  const storePendingQuoteAction = (data: QuoteFormData) => {
    const action: PendingAction = { type: 'quote_request', data };
    setPendingAction(action);
    localStorage.setItem('pendingAction', JSON.stringify(action));
  };

  const storePendingAppointmentAction = (data: AppointmentData) => {
    const action: PendingAction = { type: 'appointment_request', data };
    setPendingAction(action);
    localStorage.setItem('pendingAction', JSON.stringify(action));
  };

  const clearPendingAction = () => {
    setPendingAction(null);
    localStorage.removeItem('pendingAction');
  };

  const executePendingAction = () => {
    return pendingAction;
  };

  return {
    pendingAction,
    storePendingQuoteAction,
    storePendingAppointmentAction,
    clearPendingAction,
    executePendingAction
  };
};
