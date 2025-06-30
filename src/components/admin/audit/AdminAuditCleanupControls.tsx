
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';

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
    <>
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
            onChange={(e) => onDaysToKeepChange(parseInt(e.target.value) || 90)}
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
              onCheckedChange={onAutoCleanupChange}
            />
            <span className="text-sm">
              {autoCleanupEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={saving}
          className="flex-1"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </Button>

        <Button
          onClick={onManualCleanup}
          disabled={manualCleanup}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {manualCleanup ? 'Nettoyage...' : 'Nettoyage manuel'}
        </Button>
      </div>
    </>
  );
};

export default AdminAuditCleanupControls;
