import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Settings, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPermissions {
  browser: boolean;
  email: boolean;
  sms: boolean;
}

interface NotificationSettings {
  newOrders: boolean;
  lowStock: boolean;
  paymentReceived: boolean;
  customerMessages: boolean;
  dailyReports: boolean;
}

export const NotificationManager: React.FC = () => {
  const [permissions, setPermissions] = useState<NotificationPermissions>({
    browser: false,
    email: false,
    sms: false
  });
  const [settings, setSettings] = useState<NotificationSettings>({
    newOrders: true,
    lowStock: true,
    paymentReceived: true,
    customerMessages: true,
    dailyReports: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkNotificationPermissions();
    loadNotificationSettings();
  }, [user]);

  const checkNotificationPermissions = async () => {
    // Vérifier les permissions de notification du navigateur
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({
        ...prev,
        browser: permission === 'granted'
      }));
    }
  };

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        // La structure des données peut varier selon la base
        const dataSettings = (data as any).settings || {};
        setSettings(typeof dataSettings === 'object' ? dataSettings : settings);
        setPermissions(prev => ({
          ...prev,
          email: data.email_enabled || false,
          sms: data.sms_enabled || false
        }));
      }
    } catch (error) {
      console.error('Erreur chargement paramètres notifications:', error);
    }
  };

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées par ce navigateur",
        variant: "destructive"
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissions(prev => ({
      ...prev,
      browser: permission === 'granted'
    }));

    if (permission === 'granted') {
      // Tester la notification
      new Notification('Notifications activées!', {
        body: 'Vous recevrez maintenant les notifications importantes.',
        icon: '/logo-icon.svg'
      });

      toast({
        title: "Notifications activées",
        description: "Vous recevrez les notifications dans votre navigateur"
      });
    } else {
      toast({
        title: "Permission refusée",
        description: "Vous devez autoriser les notifications dans les paramètres du navigateur",
        variant: "destructive"
      });
    }
  };

  const updateNotificationSettings = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          settings: newSettings,
          email_enabled: permissions.email,
          sms_enabled: permissions.sms,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences de notification ont été sauvegardées"
      });
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
      // Rollback
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          type: 'test',
          title: 'Notification de test',
          message: 'Ceci est une notification de test pour vérifier que tout fonctionne correctement.',
          channels: {
            browser: permissions.browser,
            email: permissions.email,
            sms: permissions.sms
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Notification de test envoyée",
        description: "Vérifiez vos différents canaux de notification"
      });
    } catch (error) {
      console.error('Erreur envoi notification test:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification de test",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Permissions de notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Notifications navigateur</p>
                <p className="text-sm text-muted-foreground">
                  Notifications push dans votre navigateur
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={permissions.browser ? "default" : "secondary"}>
                {permissions.browser ? "Activées" : "Désactivées"}
              </Badge>
              {!permissions.browser && (
                <Button
                  onClick={requestBrowserPermission}
                  size="sm"
                  variant="outline"
                >
                  Activer
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Notifications email</p>
                <p className="text-sm text-muted-foreground">
                  Notifications par email
                </p>
              </div>
            </div>
            <Switch
              checked={permissions.email}
              onCheckedChange={(checked) =>
                setPermissions(prev => ({ ...prev, email: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Notifications SMS</p>
                <p className="text-sm text-muted-foreground">
                  Notifications par SMS (fonctionnalité premium)
                </p>
              </div>
            </div>
            <Switch
              checked={permissions.sms}
              onCheckedChange={(checked) =>
                setPermissions(prev => ({ ...prev, sms: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres de notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries({
            newOrders: "Nouvelles commandes",
            lowStock: "Stock faible",
            paymentReceived: "Paiement reçu",
            customerMessages: "Messages clients",
            dailyReports: "Rapports quotidiens"
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <p className="font-medium">{label}</p>
              <Switch
                checked={settings[key as keyof NotificationSettings]}
                onCheckedChange={(checked) =>
                  updateNotificationSettings(key as keyof NotificationSettings, checked)
                }
                disabled={loading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test des notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={sendTestNotification} className="w-full">
            Envoyer une notification de test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;