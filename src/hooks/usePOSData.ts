import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface POSSession {
  id: string;
  repairer_id: string;
  staff_user_id?: string;
  session_start: string;
  session_end?: string;
  status: string;
  terminal_id?: string;
  cash_drawer_start: number;
  cash_drawer_end?: number;
  created_at: string;
  updated_at: string;
}

export interface POSTransaction {
  id: string;
  session_id?: string;
  repairer_id: string;
  customer_id?: string;
  transaction_number: string;
  total_amount: number;
  tax_amount: number;
  payment_method: string;
  payment_status: string;
  items: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface POSHardwareStatus {
  id: string;
  repairer_id: string;
  device_type: string;
  device_name: string;
  status: string;
  last_ping?: string;
  error_message?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface POSReceipt {
  id: string;
  transaction_id?: string;
  repairer_id: string;
  receipt_number: string;
  receipt_data: any;
  print_status: string;
  printed_at?: string;
  created_at: string;
}

export const usePOSData = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<POSSession[]>([]);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [hardwareStatus, setHardwareStatus] = useState<POSHardwareStatus[]>([]);
  const [receipts, setReceipts] = useState<POSReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<POSSession | null>(null);

  const loadPOSData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Utiliser des données mockées temporairement jusqu'à ce que les vraies tables soient disponibles
      const mockSessions: POSSession[] = [
        {
          id: '1',
          repairer_id: user.id,
          session_start: new Date().toISOString(),
          status: 'active',
          cash_drawer_start: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockTransactions: POSTransaction[] = [];
      const mockHardware: POSHardwareStatus[] = [
        {
          id: '1',
          repairer_id: user.id,
          device_type: 'printer',
          device_name: 'Zebra GK420t',
          status: 'online',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      const mockReceipts: POSReceipt[] = [];

      setSessions(mockSessions);
      setTransactions(mockTransactions);
      setHardwareStatus(mockHardware);
      setReceipts(mockReceipts);
      setCurrentSession(mockSessions[0] || null);

    } catch (error) {
      console.error('Erreur lors du chargement des données POS:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const startSession = async (terminalId?: string, cashDrawerStart: number = 0) => {
    if (!user) return null;

    try {
      // Simuler la création d'une session
      const newSession: POSSession = {
        id: Date.now().toString(),
        repairer_id: user.id,
        terminal_id: terminalId,
        cash_drawer_start: cashDrawerStart,
        status: 'active',
        session_start: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCurrentSession(newSession);
      await loadPOSData();
      return newSession;
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
      return null;
    }
  };

  const endSession = async (sessionId: string, cashDrawerEnd: number) => {
    try {
      // Simuler la fermeture de session
      setCurrentSession(null);
      await loadPOSData();
      return true;
    } catch (error) {
      console.error('Erreur lors de la fermeture de la session:', error);
      return false;
    }
  };

  const createTransaction = async (transactionData: Partial<POSTransaction>) => {
    if (!user) return null;

    try {
      const transactionNumber = `TXN-${Date.now()}`;
      
      const newTransaction: POSTransaction = {
        id: Date.now().toString(),
        session_id: currentSession?.id,
        repairer_id: user.id,
        transaction_number: transactionNumber,
        total_amount: transactionData.total_amount || 0,
        tax_amount: transactionData.tax_amount || 0,
        payment_method: transactionData.payment_method || 'cash',
        payment_status: 'completed',
        items: transactionData.items || [],
        metadata: transactionData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...transactionData
      };

      await loadPOSData();
      return newTransaction;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      return null;
    }
  };

  const updateHardwareStatus = async (deviceType: string, status: string, errorMessage?: string) => {
    if (!user) return false;

    try {
      // Simuler la mise à jour du statut matériel
      await loadPOSData();
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du matériel:', error);
      return false;
    }
  };

  const printReceipt = async (transactionId: string, receiptData: any) => {
    if (!user) return null;

    try {
      const receiptNumber = `REC-${Date.now()}`;
      
      const newReceipt: POSReceipt = {
        id: Date.now().toString(),
        transaction_id: transactionId,
        repairer_id: user.id,
        receipt_number: receiptNumber,
        receipt_data: receiptData,
        print_status: 'completed',
        printed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await loadPOSData();
      return newReceipt;
    } catch (error) {
      console.error('Erreur lors de l\'impression du reçu:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadPOSData();
    }
  }, [user, loadPOSData]);

  return {
    sessions,
    transactions,
    hardwareStatus,
    receipts,
    currentSession,
    loading,
    loadPOSData,
    startSession,
    endSession,
    createTransaction,
    updateHardwareStatus,
    printReceipt
  };
};