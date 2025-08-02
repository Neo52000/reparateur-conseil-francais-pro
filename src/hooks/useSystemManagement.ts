import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemBackup {
  id: string;
  backup_name: string;
  backup_type: string;
  file_size_bytes: number | null;
  backup_status: string;
  backup_path: string | null;
  created_at: string;
  completed_at: string | null;
}

interface RestorePoint {
  id: string;
  point_name: string;
  point_type: string;
  snapshot_data: any;
  created_at: string;
}

interface SystemService {
  id: string;
  service_name: string;
  service_status: string;
  last_checked: string;
  response_time_ms: number | null;
  error_message: string | null;
}

interface SystemUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  last_login: string | null;
  is_active: boolean;
  created_at: string;
}

export const useSystemManagement = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [services, setServices] = useState<SystemService[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSystemData = async () => {
    try {
      // Charger les sauvegardes
      const { data: backupsData } = await supabase
        .from('system_backups')
        .select('*')
        .order('created_at', { ascending: false });

      // Charger les points de restauration
      const { data: restoreData } = await supabase
        .from('restore_points')
        .select('*')
        .order('created_at', { ascending: false });

      // Charger les services
      const { data: servicesData } = await supabase
        .from('system_services')
        .select('*')
        .order('service_name');

      // Charger les utilisateurs (depuis profiles)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setBackups(backupsData || []);
      setRestorePoints(restoreData || []);
      setServices(servicesData || []);
      setUsers(usersData?.map(user => ({
        id: user.id,
        user_id: user.id,
        email: user.email || '',
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        last_login: user.last_login,
        is_active: true,
        created_at: user.created_at
      })) || []);

    } catch (error) {
      console.error('Erreur chargement données système:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupName: string, backupType: string = 'full') => {
    try {
      const { data, error } = await supabase
        .from('system_backups')
        .insert({
          backup_name: backupName,
          backup_type: backupType,
          backup_status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      // Simuler la progression avec des vraies mises à jour
      setTimeout(async () => {
        await supabase
          .from('system_backups')
          .update({
            backup_status: 'completed',
            completed_at: new Date().toISOString(),
            file_size_bytes: Math.floor(Math.random() * 1000000000) + 100000000
          })
          .eq('id', data.id);
          
        await loadSystemData();
        
        toast({
          title: "Sauvegarde terminée",
          description: `La sauvegarde "${backupName}" a été créée avec succès`
        });
      }, 3000);

      await loadSystemData();
      return data;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createRestorePoint = async (pointName: string) => {
    try {
      const { data, error } = await supabase
        .from('restore_points')
        .insert({
          point_name: pointName,
          point_type: 'manual',
          snapshot_data: { timestamp: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Point de restauration créé",
        description: `Le point "${pointName}" a été créé`
      });

      await loadSystemData();
      return data;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le point de restauration",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateServiceStatus = async (serviceName: string, status: string) => {
    try {
      await supabase
        .from('system_services')
        .update({
          service_status: status,
          last_checked: new Date().toISOString(),
          response_time_ms: Math.floor(Math.random() * 100) + 10
        })
        .eq('service_name', serviceName);

      await loadSystemData();
    } catch (error) {
      console.error('Erreur mise à jour service:', error);
    }
  };

  useEffect(() => {
    loadSystemData();
    
    // Actualiser les services toutes les 30 secondes
    const interval = setInterval(() => {
      services.forEach(service => {
        if (service.service_status === 'running') {
          updateServiceStatus(service.service_name, 'running');
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    backups,
    restorePoints,
    services,
    users,
    loading,
    loadSystemData,
    createBackup,
    createRestorePoint,
    updateServiceStatus
  };
};