import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings, Bell, Mail, Clock, Save } from 'lucide-react';

interface AutoInvoiceSettingsProps {
  onSave: (settings: AutoInvoiceSettings) => Promise<void>;
}

export interface AutoInvoiceSettings {
  auto_generate_on_quote_accepted: boolean;
  auto_send_email: boolean;
  auto_submit_chorus_pro_b2b: boolean;
  reminder_days_before_due: number;
  late_payment_reminder_days: number;
  enable_late_payment_reminders: boolean;
}

export const AutoInvoiceSettings: React.FC<AutoInvoiceSettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<AutoInvoiceSettings>({
    auto_generate_on_quote_accepted: true,
    auto_send_email: true,
    auto_submit_chorus_pro_b2b: false,
    reminder_days_before_due: 3,
    late_payment_reminder_days: 7,
    enable_late_payment_reminders: true
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      toast.success('Paramètres sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Automatisation de la facturation
        </CardTitle>
        <CardDescription>
          Configurez les automatisations pour gagner du temps sur votre facturation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Génération automatique</Label>
              <p className="text-sm text-muted-foreground">
                Créer automatiquement une facture quand un devis est accepté
              </p>
            </div>
            <Switch
              checked={settings.auto_generate_on_quote_accepted}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_generate_on_quote_accepted: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Envoi automatique par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Envoyer automatiquement la facture au client par email
              </p>
            </div>
            <Switch
              checked={settings.auto_send_email}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_send_email: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Soumission automatique Chorus Pro (B2B)</Label>
              <p className="text-sm text-muted-foreground">
                Soumettre automatiquement les factures B2B à Chorus Pro
              </p>
            </div>
            <Switch
              checked={settings.auto_submit_chorus_pro_b2b}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_submit_chorus_pro_b2b: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Rappels de paiement automatiques
              </Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des rappels automatiques pour les factures en retard
              </p>
            </div>
            <Switch
              checked={settings.enable_late_payment_reminders}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_late_payment_reminders: checked })
              }
            />
          </div>

          {settings.enable_late_payment_reminders && (
            <>
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="reminder_before">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Rappel avant échéance (jours)
                  </Label>
                  <Input
                    id="reminder_before"
                    type="number"
                    min="0"
                    max="30"
                    value={settings.reminder_days_before_due}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminder_days_before_due: parseInt(e.target.value) || 0
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder_after">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Rappel après échéance (jours)
                  </Label>
                  <Input
                    id="reminder_after"
                    type="number"
                    min="1"
                    max="90"
                    value={settings.late_payment_reminder_days}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        late_payment_reminder_days: parseInt(e.target.value) || 7
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
