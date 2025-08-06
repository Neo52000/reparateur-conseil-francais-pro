import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface SystemNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  target_users: any[];
  is_active: boolean;
  auto_dismiss_at?: string;
  created_at: string;
  updated_at: string;
}

export const useSystemNotifications = () => {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Données mockées temporaires
      const mockNotifications: SystemNotification[] = [
        {
          id: '1',
          type: 'maintenance',
          title: 'Maintenance programmée',
          message: 'Une maintenance est prévue ce soir de 22h à 2h',
          severity: 'warning',
          target_users: [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'update',
          title: 'Nouvelle version disponible',
          message: 'La version 2.1.0 est maintenant disponible',
          severity: 'info',
          target_users: [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setNotifications(mockNotifications);

    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const createNotification = async (
    type: string,
    title: string,
    message: string,
    severity: string = 'info',
    targetUsers: string[] = [],
    autoDismissAt?: string
  ) => {
    if (!user || !isAdmin) return null;

    try {
      const newNotification: SystemNotification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        severity,
        target_users: targetUsers,
        is_active: true,
        auto_dismiss_at: autoDismissAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return null;
    }
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user || !isAdmin) return false;

    try {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_active: false }
          : notif
      ));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }
  };

  const updateNotification = async (
    notificationId: string,
    updates: Partial<SystemNotification>
  ) => {
    if (!user || !isAdmin) return false;

    try {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, ...updates, updated_at: new Date().toISOString() }
          : notif
      ));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      return false;
    }
  };

  // Auto-dismiss des notifications expirées
  const checkExpiredNotifications = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const now = new Date().toISOString();
      
      setNotifications(prev => prev.map(notif => 
        notif.auto_dismiss_at && notif.auto_dismiss_at < now
          ? { ...notif, is_active: false }
          : notif
      ));
      
    } catch (error) {
      console.error('Erreur lors de la vérification des notifications expirées:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Vérifier les notifications expirées toutes les minutes
      const interval = setInterval(checkExpiredNotifications, 60000);
      
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications, checkExpiredNotifications]);

  return {
    notifications,
    loading,
    loadNotifications,
    createNotification,
    dismissNotification,
    updateNotification
  };
};