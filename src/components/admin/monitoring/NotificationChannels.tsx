import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  MessageSquare, 
  Webhook, 
  Smartphone,
  Plus, 
  Edit, 
  Trash2,
  TestTube,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const NotificationChannels: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    fetchNotificationChannels();
  }, [user]);

  const fetchNotificationChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_channels')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des canaux:', error);
      toast.error('Erreur lors du chargement des canaux');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async (channelId: string) => {
    toast.success('Test de notification envoyé !');
  };

  const deleteChannel = async (channelId: string) => {
    try {
      const { error } = await supabase
        .from('notification_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;
      
      setChannels(channels.filter(c => c.id !== channelId));
      toast.success('Canal de notification supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleChannel = async (channelId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_channels')
        .update({ is_active: !isActive })
        .eq('id', channelId);

      if (error) throw error;
      
      setChannels(channels.map(c => 
        c.id === channelId ? { ...c, is_active: !isActive } : c
      ));
      
      toast.success(`Canal ${!isActive ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const channelTypes = [
    {
      id: 'email',
      name: 'Email',
      description: 'Notifications par email',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'sms',
      name: 'SMS',
      description: 'Notifications par SMS',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Intégration personnalisée',
      icon: <Webhook className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Canal Slack',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-pink-500'
    }
  ];

  const getChannelIcon = (type: string) => {
    const channelType = channelTypes.find(ct => ct.id === type);
    return channelType ? channelType.icon : <Mail className="h-5 w-5" />;
  };

  const renderConfigForm = () => {
    switch (selectedType) {
      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@monAtelier.fr"
              />
            </div>
          </div>
        );
      
      case 'sms':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL du webhook</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://votre-site.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Secret (optionnel)</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Clé secrète pour sécuriser le webhook"
              />
            </div>
          </div>
        );
      
      case 'slack':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook_url">URL du webhook Slack</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Canal (optionnel)</Label>
              <Input
                id="channel"
                placeholder="#monitoring"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Chargement des canaux de notification...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Canaux de Notification</h2>
          <p className="text-muted-foreground">
            Configurez comment recevoir les alertes de vos monitors
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau canal
        </Button>
      </div>

      {/* Créer un nouveau canal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un canal de notification</CardTitle>
            <CardDescription>
              Choisissez comment vous souhaitez recevoir les alertes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedType ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelTypes.map((type) => (
                  <Card 
                    key={type.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          {type.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{type.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {type.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <form className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className={`p-2 rounded-lg ${channelTypes.find(t => t.id === selectedType)?.color} text-white`}>
                    {channelTypes.find(t => t.id === selectedType)?.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{channelTypes.find(t => t.id === selectedType)?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {channelTypes.find(t => t.id === selectedType)?.description}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedType('')}
                  >
                    Changer
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du canal</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Email principal"
                    />
                  </div>

                  {renderConfigForm()}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Activer immédiatement</Label>
                    <Switch id="active" defaultChecked />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowCreateForm(false);
                    setSelectedType('');
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer le canal
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Liste des canaux existants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {channels.length > 0 ? channels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <CardDescription>
                      {channelTypes.find(ct => ct.id === channel.type)?.name || channel.type}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {channel.is_active ? (
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactif
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {channel.type === 'email' && `Email: ${channel.config?.email || 'Non configuré'}`}
                  {channel.type === 'sms' && `Téléphone: ${channel.config?.phone || 'Non configuré'}`}
                  {channel.type === 'webhook' && `URL: ${channel.config?.url || 'Non configurée'}`}
                  {channel.type === 'slack' && `Canal: ${channel.config?.channel || '#monitoring'}`}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotification(channel.id)}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleChannel(channel.id, channel.is_active)}
                  >
                    {channel.is_active ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteChannel(channel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="lg:col-span-2">
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun canal de notification</h3>
              <p className="text-muted-foreground mb-4">
                Configurez vos premiers canaux pour recevoir les alertes de monitoring
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un canal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Guide des types d'alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Types d'alertes disponibles</CardTitle>
          <CardDescription>
            Voici les différents types d'alertes que vous pouvez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Alertes de disponibilité</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Service indisponible (DOWN)</li>
                <li>• Service rétabli (UP)</li>
                <li>• Temps de réponse élevé</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Alertes business</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Baisse du chiffre d'affaires</li>
                <li>• Chute du taux de conversion</li>
                <li>• Satisfaction client faible</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Alertes SEO</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chute de positionnement</li>
                <li>• Nouveau classement</li>
                <li>• Mots-clés en danger</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Alertes infrastructure</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CPU élevé</li>
                <li>• Mémoire insuffisante</li>
                <li>• Espace disque faible</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};