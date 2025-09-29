import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NF203NotificationPreferencesProps {
  repairerId: string;
}

export function NF203NotificationPreferences({ repairerId }: NF203NotificationPreferencesProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    period_closure: true,
    chain_integrity: true,
    fec_export: true,
    archive_created: false,
    closure_reminder: true,
    archive_expiry: true,
    low_compliance: true,
    email_notifications: true,
    push_notifications: true
  });

  const handleSave = () => {
    // TODO: Sauvegarder les préférences
    toast({
      title: 'Préférences sauvegardées',
      description: 'Vos préférences de notification ont été mises à jour',
    });
  };

  const notificationTypes = [
    {
      key: 'period_closure' as const,
      label: 'Clôture de période',
      description: 'Notification lors d\'une clôture de période réussie'
    },
    {
      key: 'chain_integrity' as const,
      label: 'Intégrité de la chaîne',
      description: 'Alerte immédiate si la chaîne cryptographique est compromise'
    },
    {
      key: 'fec_export' as const,
      label: 'Export FEC',
      description: 'Notification quand un export FEC est prêt'
    },
    {
      key: 'archive_created' as const,
      label: 'Archives créées',
      description: 'Notification à chaque création d\'archive'
    },
    {
      key: 'closure_reminder' as const,
      label: 'Rappel de clôture',
      description: 'Rappel 7 jours avant la date de clôture recommandée'
    },
    {
      key: 'archive_expiry' as const,
      label: 'Expiration d\'archives',
      description: 'Alerte quand une archive approche de sa date d\'expiration'
    },
    {
      key: 'low_compliance' as const,
      label: 'Taux de conformité faible',
      description: 'Alerte si le taux de conformité descend sous 95%'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Préférences de notification
        </CardTitle>
        <CardDescription>
          Choisissez les événements pour lesquels vous souhaitez recevoir des notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Types de notifications</h4>
          {notificationTypes.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <Label htmlFor={key} className="text-sm font-medium">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                id={key}
                checked={preferences[key]}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-medium">Canaux de notification</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="push" className="text-sm font-medium">
                  Notifications push
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notifications dans l'application
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, push_notifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Notifications par email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Emails pour les événements critiques
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, email_notifications: checked }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>
            Sauvegarder les préférences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
