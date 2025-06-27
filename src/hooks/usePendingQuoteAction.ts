
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

interface PendingQuoteAction {
  type: 'quote_request';
  data: QuoteFormData;
}

export const usePendingQuoteAction = () => {
  const [pendingAction, setPendingAction] = useState<PendingQuoteAction | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pendingQuoteAction');
    if (stored) {
      try {
        setPendingAction(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing pending quote action:', error);
        localStorage.removeItem('pendingQuoteAction');
      }
    }
  }, []);

  const storePendingQuoteAction = (data: QuoteFormData) => {
    const action: PendingQuoteAction = { type: 'quote_request', data };
    setPendingAction(action);
    localStorage.setItem('pendingQuoteAction', JSON.stringify(action));
  };

  const clearPendingAction = () => {
    setPendingAction(null);
    localStorage.removeItem('pendingQuoteAction');
  };

  const executePendingAction = () => {
    if (pendingAction?.type === 'quote_request') {
      return pendingAction.data;
    }
    return null;
  };

  return {
    pendingAction,
    storePendingQuoteAction,
    clearPendingAction,
    executePendingAction
  };
};
