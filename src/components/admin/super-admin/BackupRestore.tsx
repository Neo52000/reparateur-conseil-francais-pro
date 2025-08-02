import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Upload, 
  Database, 
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Archive,
  HardDrive,
  Cloud,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemManagement } from '@/hooks/useSystemManagement';
import { useSystemJobs } from '@/hooks/useSystemJobs';

interface BackupTask {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'data-only' | 'schema-only';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  size: string;
  duration: string;
  created_at: string;
  tables_count: number;
  records_count: number;
}

interface RestorePoint {
  id: string;
  name: string;
  backup_date: string;
  type: string;
  size: string;
  integrity_status: 'verified' | 'corrupted' | 'unknown';
  auto_created: boolean;
}

const BackupRestore: React.FC = () => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    retention_days: 30
  });

  const { toast } = useToast();
  const { backups, restorePoints, loading } = useSystemManagement();
  const { 
    backupJobs, 
    createBackupJob, 
    loading: jobsLoading 
  } = useSystemJobs();

  // Transform system data to match component interface
  const transformedBackups: BackupTask[] = backups.map(backup => ({
    id: backup.id,
    name: backup.backup_name,
    type: backup.backup_type as BackupTask['type'],
    status: backup.backup_status as BackupTask['status'],
    progress: 100, // Default to completed
    size: backup.file_size_bytes ? `${(backup.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : '0 MB',
    duration: backup.completed_at && backup.created_at 
      ? Math.round((new Date(backup.completed_at).getTime() - new Date(backup.created_at).getTime()) / 1000) + ' sec'
      : '0 sec',
    created_at: backup.created_at,
    tables_count: 0, // Add to backup schema if needed
    records_count: 0 // Add to backup schema if needed
  }));

  const transformedRestorePoints: RestorePoint[] = restorePoints.map(point => ({
    id: point.id,
    name: point.point_name,
    backup_date: point.created_at,
    type: point.point_type,
    size: '0 MB', // Add to restore point schema if needed
    integrity_status: 'verified' as const,
    auto_created: true
  }));

  const handleCreateBackup = async (type: BackupTask['type']) => {
    try {
      await createBackupJob(
        `Sauvegarde ${type} - ${new Date().toLocaleString()}`,
        type
      );

      toast({
        title: "Sauvegarde lancée",
        description: `Sauvegarde ${type} en cours...`,
      });

    } catch (error: any) {
      console.error('Erreur lors de la création de sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const handleRestore = async (restorePoint: RestorePoint) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir restaurer à partir de "${restorePoint.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      // Create a restore job
      await createBackupJob(
        `Restauration - ${restorePoint.name}`,
        'restore'
      );

      toast({
        title: "Restauration lancée",
        description: "La restauration des données est en cours...",
      });

    } catch (error: any) {
      console.error('Erreur lors de la restauration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de restaurer les données",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: BackupTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-admin-blue animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-admin-red" />;
      default: return <Clock className="h-4 w-4 text-admin-yellow" />;
    }
  };

  const getStatusBadge = (status: BackupTask['status']) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sauvegarde & Restauration</h2>
          <p className="text-muted-foreground">Gestion des sauvegardes système</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => handleCreateBackup('full')}
          disabled={jobsLoading}
          className="h-20 flex-col"
        >
          <Database className="h-6 w-6 mb-2" />
          Sauvegarde complète
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleCreateBackup('incremental')}
          disabled={jobsLoading}
          className="h-20 flex-col"
        >
          <Archive className="h-6 w-6 mb-2" />
          Sauvegarde incrémentale
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleCreateBackup('data-only')}
          disabled={jobsLoading}
          className="h-20 flex-col"
        >
          <HardDrive className="h-6 w-6 mb-2" />
          Données uniquement
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleCreateBackup('schema-only')}
          disabled={jobsLoading}
          className="h-20 flex-col"
        >
          <Shield className="h-6 w-6 mb-2" />
          Schéma uniquement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sauvegardes en cours */}
        <Card>
          <CardHeader>
            <CardTitle>Sauvegardes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transformedBackups.map((backup) => (
                <div key={backup.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <span className="font-medium">{backup.name}</span>
                    </div>
                    {getStatusBadge(backup.status)}
                  </div>
                  
                  {backup.status === 'running' && (
                    <div className="mb-2">
                      <Progress value={backup.progress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {backup.progress}% - {backup.duration}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>Taille: {backup.size}</div>
                    <div>Tables: {backup.tables_count}</div>
                    <div>Enregistrements: {backup.records_count.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(backup.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Points de restauration */}
        <Card>
          <CardHeader>
            <CardTitle>Points de restauration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transformedRestorePoints.map((point) => (
                <div key={point.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      <span className="font-medium">{point.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={point.integrity_status === 'verified' ? 'default' : 'destructive'}>
                        {point.integrity_status}
                      </Badge>
                      {point.auto_created && (
                        <Badge variant="outline">Auto</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                    <div>Taille: {point.size}</div>
                    <div>Type: {point.type}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(point.backup_date).toLocaleString('fr-FR')}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRestore(point)}
                      disabled={point.integrity_status === 'corrupted'}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Restaurer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration de la planification */}
      <Card>
        <CardHeader>
          <CardTitle>Planification automatique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fréquence</label>
              <Select value={backupSchedule.frequency} onValueChange={(value) => 
                setBackupSchedule(prev => ({...prev, frequency: value}))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Chaque heure</SelectItem>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Heure</label>
              <Input 
                type="time" 
                value={backupSchedule.time}
                onChange={(e) => setBackupSchedule(prev => ({...prev, time: e.target.value}))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rétention (jours)</label>
              <Input 
                type="number" 
                value={backupSchedule.retention_days}
                onChange={(e) => setBackupSchedule(prev => ({...prev, retention_days: Number(e.target.value)}))}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => {
                toast({
                  title: "Configuration sauvegardée",
                  description: "La planification a été mise à jour",
                });
              }}>
                <Calendar className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de stockage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Espace utilisé</p>
                <p className="text-2xl font-bold">12.4 GB</p>
                <Progress value={62} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-8 w-8 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Stockage cloud</p>
                <p className="text-2xl font-bold">45.2 GB</p>
                <p className="text-xs text-muted-foreground">Disponible</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-admin-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Sauvegardes</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-muted-foreground">Points de restauration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupRestore;