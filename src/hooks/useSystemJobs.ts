import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface BackupJob {
  id: string;
  job_name: string;
  job_type: string;
  status: string;
  progress: number;
  total_items: number;
  processed_items: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncJob {
  id: string;
  repairer_id?: string;
  sync_type: string;
  source_system: string;
  target_system: string;
  status: string;
  progress: number;
  items_processed: number;
  items_total: number;
  error_message?: string;
  sync_data: any;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useSystemJobs = () => {
  const { user, isAdmin } = useAuth();
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Données mockées temporaires
      if (isAdmin) {
        const mockBackupJobs: BackupJob[] = [
          {
            id: '1',
            job_name: 'Sauvegarde complète système',
            job_type: 'full',
            status: 'completed',
            progress: 100,
            total_items: 100,
            processed_items: 100,
            started_at: new Date(Date.now() - 3600000).toISOString(),
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setBackupJobs(mockBackupJobs);
      }

      const mockSyncJobs: SyncJob[] = [
        {
          id: '1',
          repairer_id: user.id,
          sync_type: 'inventory',
          source_system: 'POS',
          target_system: 'E-commerce',
          status: 'completed',
          progress: 100,
          items_processed: 25,
          items_total: 25,
          sync_data: {},
          started_at: new Date(Date.now() - 1800000).toISOString(),
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setSyncJobs(mockSyncJobs);

    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const createBackupJob = async (jobName: string, jobType: string) => {
    if (!user || !isAdmin) return null;

    try {
      const newJob: BackupJob = {
        id: Date.now().toString(),
        job_name: jobName,
        job_type: jobType,
        status: 'pending',
        progress: 0,
        total_items: 100,
        processed_items: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setBackupJobs(prev => [newJob, ...prev]);
      
      // Simuler le processus de sauvegarde
      simulateJobProgress(newJob.id, 'backup');
      
      return newJob;
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      return null;
    }
  };

  const createSyncJob = async (syncType: string, sourceSystem: string, targetSystem: string, syncData?: any) => {
    if (!user) return null;

    try {
      const newJob: SyncJob = {
        id: Date.now().toString(),
        repairer_id: user.id,
        sync_type: syncType,
        source_system: sourceSystem,
        target_system: targetSystem,
        status: 'pending',
        progress: 0,
        items_processed: 0,
        items_total: 50,
        sync_data: syncData || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSyncJobs(prev => [newJob, ...prev]);
      
      // Simuler le processus de synchronisation
      simulateJobProgress(newJob.id, 'sync');
      
      return newJob;
    } catch (error) {
      console.error('Erreur lors de la création de la synchronisation:', error);
      return null;
    }
  };

  const simulateJobProgress = async (jobId: string, jobType: 'backup' | 'sync') => {
    // Démarrer la tâche
    if (jobType === 'backup') {
      setBackupJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'running', started_at: new Date().toISOString() }
          : job
      ));
    } else {
      setSyncJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'running', started_at: new Date().toISOString() }
          : job
      ));
    }

    // Simuler la progression
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (jobType === 'backup') {
        setBackupJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, progress, processed_items: Math.floor((progress / 100) * 100) }
            : job
        ));
      } else {
        setSyncJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, progress, items_processed: Math.floor((progress / 100) * 50) }
            : job
        ));
      }
    }

    // Terminer la tâche
    if (jobType === 'backup') {
      setBackupJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed', progress: 100, completed_at: new Date().toISOString() }
          : job
      ));
    } else {
      setSyncJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed', progress: 100, completed_at: new Date().toISOString() }
          : job
      ));
    }
  };

  const retryJob = async (jobId: string, jobType: 'backup' | 'sync') => {
    try {
      if (jobType === 'backup') {
        setBackupJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'pending', progress: 0, error_message: undefined }
            : job
        ));
      } else {
        setSyncJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'pending', progress: 0, error_message: undefined }
            : job
        ));
      }

      // Relancer la simulation
      simulateJobProgress(jobId, jobType);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la relance de la tâche:', error);
      return false;
    }
  };

  const deleteJob = async (jobId: string, jobType: 'backup' | 'sync') => {
    try {
      if (jobType === 'backup') {
        setBackupJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        setSyncJobs(prev => prev.filter(job => job.id !== jobId));
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user, loadJobs]);

  return {
    backupJobs,
    syncJobs,
    loading,
    loadJobs,
    createBackupJob,
    createSyncJob,
    retryJob,
    deleteJob
  };
};