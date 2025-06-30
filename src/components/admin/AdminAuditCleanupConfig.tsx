
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Settings, Clock, AlertTriangle } from 'lucide-react';

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getNextCleanupTime = () => {
    // Le cron s'exécute tous les jours à 2h00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    return tomorrow.toLocaleString('fr-FR');
  };

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
        {/* Statut du nettoyage automatique */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Nettoyage automatique</p>
              <p className="text-sm text-gray-600">
                {autoCleanupEnabled ? 'Activé - Tous les jours à 2h00' : 'Désactivé'}
              </p>
            </div>
          </div>
          <Badge variant={autoCleanupEnabled ? 'default' : 'secondary'}>
            {autoCleanupEnabled ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="days-to-keep">Jours à conserver</Label>
            <Input
              id="days-to-keep"
              type="number"
              min="1"
              max="365"
              value={daysToKeep}
              onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 90)}
            />
            <p className="text-sm text-gray-500">
              Les logs plus anciens seront supprimés
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-cleanup">Nettoyage automatique</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-cleanup"
                checked={autoCleanupEnabled}
                onCheckedChange={setAutoCleanupEnabled}
              />
              <span className="text-sm">
                {autoCleanupEnabled ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          </div>
        </div>

        {/* Informations sur le dernier nettoyage */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Informations de nettoyage</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Dernier nettoyage :</span>
              <br />
              <span className="text-gray-600">{formatDate(config?.last_cleanup || null)}</span>
            </div>
            {autoCleanupEnabled && (
              <div>
                <span className="font-medium">Prochain nettoyage :</span>
                <br />
                <span className="text-gray-600">{getNextCleanupTime()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
          </Button>

          <Button
            onClick={triggerManualCleanup}
            disabled={manualCleanup}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {manualCleanup ? 'Nettoyage...' : 'Nettoyage manuel'}
          </Button>
        </div>

        {/* Avertissement */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Attention</p>
            <p className="text-amber-700">
              La suppression des logs d'audit est irréversible. Assurez-vous d'avoir configuré 
              une période de rétention appropriée selon vos besoins de conformité.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuditCleanupConfig;
