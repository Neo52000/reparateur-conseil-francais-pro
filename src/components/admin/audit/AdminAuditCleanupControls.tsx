import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Trash, RefreshCw } from 'lucide-react';

interface AdminAuditCleanupControlsProps {
  daysToKeep: number;
  autoCleanupEnabled: boolean;
  saving: boolean;
  manualCleanup: boolean;
  onDaysToKeepChange: (days: number) => void;
  onAutoCleanupChange: (enabled: boolean) => void;
  onSave: () => void;
  onManualCleanup: () => void;
}

const AdminAuditCleanupControls: React.FC<AdminAuditCleanupControlsProps> = ({
  daysToKeep,
  autoCleanupEnabled,
  saving,
  manualCleanup,
  onDaysToKeepChange,
  onAutoCleanupChange,
  onSave,
  onManualCleanup
}) => {
  return (
    <div className="space-y-6">
      {/* Configuration automatique */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Nettoyage automatique
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="days-to-keep">Jours de rétention</Label>
            <Input
              id="days-to-keep"
              type="number"
              value={daysToKeep}
              onChange={(e) => onDaysToKeepChange(parseInt(e.target.value) || 90)}
              min={1}
              max={365}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Les logs plus anciens que {daysToKeep} jours seront supprimés
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-cleanup"
                checked={autoCleanupEnabled}
                onCheckedChange={onAutoCleanupChange}
              />
              <Label htmlFor="auto-cleanup">Activer le nettoyage automatique</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Le nettoyage s'effectuera automatiquement chaque semaine
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">Actions</h4>
          <p className="text-sm text-muted-foreground">
            Sauvegardez la configuration ou déclenchez un nettoyage manuel
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onManualCleanup}
            disabled={manualCleanup}
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            {manualCleanup ? 'Nettoyage...' : 'Nettoyage manuel'}
          </Button>
          
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditCleanupControls;