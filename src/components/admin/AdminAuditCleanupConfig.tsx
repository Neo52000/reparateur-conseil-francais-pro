
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings } from 'lucide-react';
import AdminAuditCleanupStats from './audit/AdminAuditCleanupStats';
import AdminAuditCleanupControls from './audit/AdminAuditCleanupControls';

interface CleanupConfig {
  id: string;
  days_to_keep: number;
  auto_cleanup_enabled: boolean;
  last_cleanup: string | null;
  created_at: string;
  updated_at: string;
}

const AdminAuditCleanupConfig: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<CleanupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manualCleanup, setManualCleanup] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(90);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_cleanup_config')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching cleanup config:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la configuration",
          variant: "destructive"
        });
        return;
      }

      setConfig(data);
      setDaysToKeep(data.days_to_keep);
      setAutoCleanupEnabled(data.auto_cleanup_enabled);
    } catch (error) {
      console.error('Error fetching cleanup config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('audit_cleanup_config')
        .update({
          days_to_keep: daysToKeep,
          auto_cleanup_enabled: autoCleanupEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) {
        console.error('Error saving config:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder la configuration",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres de nettoyage ont été mis à jour",
      });

      await fetchConfig();
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const triggerManualCleanup = async () => {
    setManualCleanup(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-audit-logs', {
        body: { daysToKeep, manual: true }
      });

      if (error) {
        console.error('Error triggering manual cleanup:', error);
        toast({
          title: "Erreur",
          description: "Impossible de déclencher le nettoyage manuel",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Nettoyage effectué",
        description: `${data.deletedCount || 0} logs ont été supprimés`,
      });

      await fetchConfig();
    } catch (error) {
      console.error('Error triggering manual cleanup:', error);
    } finally {
      setManualCleanup(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration du nettoyage automatique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AdminAuditCleanupStats config={config} />
        
        <AdminAuditCleanupControls
          daysToKeep={daysToKeep}
          autoCleanupEnabled={autoCleanupEnabled}
          saving={saving}
          manualCleanup={manualCleanup}
          onDaysToKeepChange={setDaysToKeep}
          onAutoCleanupChange={setAutoCleanupEnabled}
          onSave={saveConfig}
          onManualCleanup={triggerManualCleanup}
        />
      </CardContent>
    </Card>
  );
};

export default AdminAuditCleanupConfig;
