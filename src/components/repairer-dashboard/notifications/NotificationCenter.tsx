
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, MessageSquare, Smartphone, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface NotificationCenterProps {
  demoModeEnabled: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ demoModeEnabled }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'new_quote',
      title: 'Nouvelle demande de devis',
      message: 'Marie Dupont demande un devis pour iPhone 14 - Écran cassé',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      priority: 'high',
      source: 'demo'
    },
    {
      id: '2',
      type: 'appointment_reminder',
      title: 'Rappel de rendez-vous',
      message: 'RDV avec Pierre Martin dans 1 heure (15:00)',
      timestamp: '2024-01-15T14:00:00Z',
      read: false,
      priority: 'medium',
      source: 'demo'
    },
    {
      id: '3',
      type: 'stock_alert',
      title: 'Stock faible',
      message: 'Écran iPhone 13 - Stock restant: 2 unités',
      timestamp: '2024-01-15T09:15:00Z',
      read: true,
      priority: 'low',
      source: 'demo'
    },
    {
      id: '4',
      type: 'review_received',
      title: 'Nouvel avis client',
      message: 'Sophie Legrand a laissé un avis 5 étoiles',
      timestamp: '2024-01-14T18:45:00Z',
      read: true,
      priority: 'low',
      source: 'demo'
    }
  ]);

  const [settings, setSettings] = useState({
    email: { quotes: true, appointments: true, reviews: true, stock: false },
    sms: { quotes: false, appointments: true, reviews: false, stock: false },
    push: { quotes: true, appointments: true, reviews: true, stock: true }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_quote': return <Mail className="h-5 w-5 text-blue-500" />;
      case 'appointment_reminder': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'stock_alert': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'review_received': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      return date.toLocaleDateString('fr-FR');
    } else if (diffHours > 0) {
      return `Il y a ${diffHours}h`;
    } else {
      return `Il y a ${diffMinutes}min`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {demoModeEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Mode Démonstration
            </Badge>
            <span className="text-sm text-blue-700">
              Centre de notifications avec données d'exemple
            </span>
          </div>
        </div>
      )}

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications récentes
                </span>
                <Button variant="outline" size="sm">
                  Tout marquer comme lu
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    } hover:bg-gray-50 cursor-pointer`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                          {notification.source === 'demo' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Démo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notifications par email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nouvelles demandes de devis</p>
                    <p className="text-sm text-gray-600">Recevoir un email pour chaque nouvelle demande</p>
                  </div>
                  <Switch 
                    checked={settings.email.quotes}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, quotes: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rappels de rendez-vous</p>
                    <p className="text-sm text-gray-600">Notifications 1h avant chaque rendez-vous</p>
                  </div>
                  <Switch 
                    checked={settings.email.appointments}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, appointments: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nouveaux avis clients</p>
                    <p className="text-sm text-gray-600">Notifications pour les avis et commentaires</p>
                  </div>
                  <Switch 
                    checked={settings.email.reviews}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, reviews: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertes de stock</p>
                    <p className="text-sm text-gray-600">Notifications pour les stocks faibles</p>
                  </div>
                  <Switch 
                    checked={settings.email.stock}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, stock: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Notifications SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rappels de rendez-vous</p>
                    <p className="text-sm text-gray-600">SMS 30 minutes avant chaque rendez-vous</p>
                  </div>
                  <Switch 
                    checked={settings.sms.appointments}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, appointments: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Demandes urgentes</p>
                    <p className="text-sm text-gray-600">SMS pour les demandes prioritaires</p>
                  </div>
                  <Switch 
                    checked={settings.sms.quotes}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, quotes: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications push
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Toutes les notifications</p>
                    <p className="text-sm text-gray-600">Recevoir des notifications push en temps réel</p>
                  </div>
                  <Switch 
                    checked={settings.push.quotes}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        push: { ...prev.push, quotes: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
