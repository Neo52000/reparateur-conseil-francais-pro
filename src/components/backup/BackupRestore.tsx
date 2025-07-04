import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  Archive
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BackupData {
  metadata: {
    version: string;
    created_at: string;
    user_id: string;
    backup_type: 'full' | 'partial';
    tables_included: string[];
  };
  data: {
    pos_transactions?: any[];
    pos_inventory?: any[];
    ecommerce_orders?: any[];
    ecommerce_products?: any[];
    ecommerce_customers?: any[];
    repairer_profiles?: any[];
    notification_settings?: any[];
  };
}

interface BackupSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  next_backup: string;
  auto_backup: boolean;
  keep_backups: number;
}

export const BackupRestore: React.FC = () => {
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const tables = [
    { key: 'pos_transactions', label: 'Transactions POS', icon: Database },
    { key: 'pos_inventory', label: 'Inventaire POS', icon: Archive },
    { key: 'ecommerce_orders', label: 'Commandes E-commerce', icon: Database },
    { key: 'ecommerce_products', label: 'Produits E-commerce', icon: Archive },
    { key: 'ecommerce_customers', label: 'Clients E-commerce', icon: Database },
    { key: 'repairer_profiles', label: 'Profil réparateur', icon: Settings },
    { key: 'notification_settings', label: 'Paramètres notifications', icon: Settings }
  ];

  const createBackup = async (backupType: 'full' | 'partial' = 'full') => {
    if (!user) return;

    setLoading(true);
    setBackupProgress(0);

    try {
      const backupData: BackupData = {
        metadata: {
          version: '1.0',
          created_at: new Date().toISOString(),
          user_id: user.id,
          backup_type: backupType,
          tables_included: []
        },
        data: {}
      };

      let completedTables = 0;
      const totalTables = tables.length;

      for (const table of tables) {
        try {
          console.log(`📦 Sauvegarde de ${table.key}...`);
          
          // Utiliser une approche plus simple avec type assertion
          let data: any[] = [];
          let error: any = null;
          
          try {
            const result = await (supabase as any).from(table.key).select('*');
            data = result.data || [];
            error = result.error;
            
            // Filtrer par utilisateur pour les tables qui le supportent
            if (data && data.length > 0) {
              const userFilteredTables = ['pos_transactions', 'pos_inventory', 'ecommerce_orders', 'ecommerce_products', 'ecommerce_customers'];
              if (userFilteredTables.includes(table.key)) {
                data = data.filter((item: any) => item.repairer_id === user.id);
              } else if (table.key === 'repairer_profiles' || table.key === 'notification_settings') {
                data = data.filter((item: any) => item.user_id === user.id);
              }
            }
          } catch (queryError) {
            console.warn(`Table ${table.key} non accessible:`, queryError);
            data = [];
            error = null; // On ignore les erreurs de tables inexistantes
          }
          
          if (error) {
            console.warn(`Erreur récupération ${table.key}:`, error);
            backupData.data[table.key as keyof typeof backupData.data] = [];
          } else {
            backupData.data[table.key as keyof typeof backupData.data] = data || [];
            backupData.metadata.tables_included.push(table.key);
          }
        } catch (error) {
          console.warn(`Erreur table ${table.key}:`, error);
          backupData.data[table.key as keyof typeof backupData.data] = [];
        }
        
        completedTables++;
        setBackupProgress((completedTables / totalTables) * 100);
        
        // Petit délai pour montrer le progrès
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Télécharger le fichier de sauvegarde
      const fileName = `backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Enregistrer la sauvegarde en base pour l'historique (si la table existe)
      try {
        await (supabase as any).from('backup_logs').insert({
          user_id: user.id,
          backup_type: backupType,
          file_name: fileName,
          tables_count: backupData.metadata.tables_included.length,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        console.warn('Impossible de logger la sauvegarde:', logError);
      }

      toast({
        title: "Sauvegarde créée",
        description: `Fichier ${fileName} téléchargé avec succès`
      });

    } catch (error) {
      console.error('Erreur création backup:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setBackupProgress(0);
    }
  };

  const restoreBackup = async (file: File) => {
    if (!user) return;

    setLoading(true);
    setRestoreProgress(0);

    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);

      // Vérifications de sécurité
      if (!backupData.metadata || backupData.metadata.user_id !== user.id) {
        throw new Error("Fichier de sauvegarde invalide ou appartenant à un autre utilisateur");
      }

      const tablesToRestore = Object.keys(backupData.data);
      let restoredTables = 0;

      for (const tableName of tablesToRestore) {
        const tableData = backupData.data[tableName as keyof typeof backupData.data];
        
        if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
          console.log(`Ignorer table vide: ${tableName}`);
          continue;
        }

        try {
          console.log(`🔄 Restauration de ${tableName}...`);
          
          // Supprimer les données existantes (optionnel - à confirmer avec l'utilisateur)
          // const { error: deleteError } = await supabase
          //   .from(tableName)
          //   .delete()
          //   .eq('user_id', user.id);

          // Insérer les nouvelles données
          const { error: insertError } = await (supabase as any)
            .from(tableName)
            .upsert(tableData, { onConflict: 'id' });

          if (insertError) {
            console.error(`Erreur restauration ${tableName}:`, insertError);
          } else {
            console.log(`✅ ${tableName} restauré: ${tableData.length} enregistrements`);
          }
        } catch (error) {
          console.error(`Erreur table ${tableName}:`, error);
        }

        restoredTables++;
        setRestoreProgress((restoredTables / tablesToRestore.length) * 100);
        
        // Délai pour montrer le progrès
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Enregistrer la restauration en log (si la table existe)
      try {
        await (supabase as any).from('backup_logs').insert({
          user_id: user.id,
          backup_type: 'restore',
          file_name: file.name,
          tables_count: restoredTables,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        console.warn('Impossible de logger la restauration:', logError);
      }

      toast({
        title: "Restauration terminée",
        description: `${restoredTables} tables ont été restaurées`
      });

    } catch (error) {
      console.error('Erreur restauration:', error);
      toast({
        title: "Erreur de restauration",
        description: error instanceof Error ? error.message : "Impossible de restaurer la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRestoreProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      restoreBackup(file);
    } else {
      toast({
        title: "Fichier invalide",
        description: "Veuillez sélectionner un fichier JSON de sauvegarde",
        variant: "destructive"
      });
    }
  };

  const scheduleAutoBackup = async (frequency: 'daily' | 'weekly' | 'monthly') => {
    try {
      const { error } = await supabase.functions.invoke('schedule-backup', {
        body: {
          userId: user?.id,
          frequency,
          enabled: true
        }
      });

      if (error) throw error;

      toast({
        title: "Sauvegarde automatique activée",
        description: `Sauvegarde ${frequency === 'daily' ? 'quotidienne' : frequency === 'weekly' ? 'hebdomadaire' : 'mensuelle'} programmée`
      });
    } catch (error) {
      console.error('Erreur programmation backup:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer la sauvegarde automatique",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sauvegarde et restauration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Les sauvegardes contiennent toutes vos données sensibles. Stockez-les en sécurité et ne les partagez jamais.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => createBackup('full')}
              disabled={loading}
              className="h-20 flex-col gap-2"
            >
              <Download className="w-6 h-6" />
              <span>Créer une sauvegarde complète</span>
            </Button>

            <div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                variant="outline"
                className="h-20 flex-col gap-2 w-full"
              >
                <Upload className="w-6 h-6" />
                <span>Restaurer une sauvegarde</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Progrès de sauvegarde */}
          {backupProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sauvegarde en cours...</span>
                <span>{Math.round(backupProgress)}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          )}

          {/* Progrès de restauration */}
          {restoreProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Restauration en cours...</span>
                <span>{Math.round(restoreProgress)}%</span>
              </div>
              <Progress value={restoreProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sauvegarde automatique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sauvegarde automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Programmez des sauvegardes automatiques pour protéger vos données en continu.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={() => scheduleAutoBackup('daily')}
              variant="outline"
              size="sm"
            >
              Quotidienne
            </Button>
            <Button
              onClick={() => scheduleAutoBackup('weekly')}
              variant="outline"
              size="sm"
            >
              Hebdomadaire
            </Button>
            <Button
              onClick={() => scheduleAutoBackup('monthly')}
              variant="outline"
              size="sm"
            >
              Mensuelle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tables */}
      <Card>
        <CardHeader>
          <CardTitle>Données incluses dans la sauvegarde</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tables.map(table => {
              const Icon = table.icon;
              return (
                <div key={table.key} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{table.label}</span>
                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;