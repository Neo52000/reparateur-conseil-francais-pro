import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Plus, 
  Send, 
  Edit3, 
  Trash2, 
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Clock,
  Target,
  Settings,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_type: 'all' | 'role' | 'user' | 'repairer';
  target_value: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  read_count: number;
  total_recipients: number;
  created_at: string;
  created_by: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  is_active: boolean;
}

const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    target_type: 'all',
    target_value: '',
    scheduled_at: ''
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: '',
    variables: '' // JSON string
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data as unknown as Notification[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      // Données de démonstration
      setNotifications([
        {
          id: '1',
          title: 'Mise à jour système planifiée',
          message: 'Une maintenance système aura lieu demain de 02h00 à 04h00',
          type: 'warning',
          priority: 'high',
          target_type: 'all',
          target_value: null,
          status: 'sent',
          scheduled_at: null,
          sent_at: new Date().toISOString(),
          read_count: 45,
          total_recipients: 67,
          created_at: new Date().toISOString(),
          created_by: 'admin'
        },
        {
          id: '2',
          title: 'Nouvelles fonctionnalités disponibles',
          message: 'Découvrez les nouvelles fonctionnalités POS dans votre dashboard',
          type: 'info',
          priority: 'normal',
          target_type: 'role',
          target_value: 'repairer',
          status: 'scheduled',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          sent_at: null,
          read_count: 0,
          total_recipients: 23,
          created_at: new Date().toISOString(),
          created_by: 'admin'
        }
      ] as Notification[]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates' as any)
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates((data as unknown as NotificationTemplate[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      // Données de démonstration
      setTemplates([
        {
          id: '1',
          name: 'Bienvenue nouveau réparateur',
          subject: 'Bienvenue sur RepairHub',
          content: 'Bonjour {{name}}, bienvenue sur notre plateforme...',
          variables: ['name', 'email'],
          category: 'onboarding',
          is_active: true
        }
      ] as NotificationTemplate[]);
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: { notificationId }
      });

      if (error) throw error;

      toast({
        title: "Notification envoyée",
        description: "La notification a été envoyée avec succès",
      });

      await fetchNotifications();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la notification",
        variant: "destructive"
      });
    }
  };

  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        target_type: formData.target_type,
        target_value: formData.target_value || null,
        scheduled_at: formData.scheduled_at || null,
        status: formData.scheduled_at ? 'scheduled' : 'draft',
        read_count: 0,
        total_recipients: 0
      };

      if (editingNotification) {
        const { error } = await supabase
          .from('system_notifications' as any)
          .update(notificationData)
          .eq('id', editingNotification.id);

        if (error) throw error;
        
        toast({
          title: "Notification mise à jour",
          description: "La notification a été mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('system_notifications' as any)
          .insert([notificationData]);

        if (error) throw error;
        
        toast({
          title: "Notification créée",
          description: "La notification a été créée avec succès",
        });
      }

      setIsCreateModalOpen(false);
      setEditingNotification(null);
      resetForm();
      await fetchNotifications();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la notification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'normal',
      target_type: 'all',
      target_value: '',
      scheduled_at: ''
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-admin-yellow" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-admin-red" />;
      default: return <Info className="h-4 w-4 text-admin-blue" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      normal: 'secondary',
      high: 'default',
      urgent: 'destructive'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'outline',
      scheduled: 'secondary',
      sent: 'default',
      failed: 'destructive'
    } as const;
    
    return <Badge variant={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionnaire de Notifications</h2>
          <p className="text-muted-foreground">Notifications système et communications</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingNotification(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Notification
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNotification ? 'Modifier la notification' : 'Créer une notification'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitNotification} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Titre de la notification"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Contenu de la notification"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="success">Succès</SelectItem>
                        <SelectItem value="warning">Avertissement</SelectItem>
                        <SelectItem value="error">Erreur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priorité</label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cible</label>
                    <Select value={formData.target_type} onValueChange={(value) => setFormData({...formData, target_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                        <SelectItem value="role">Par rôle</SelectItem>
                        <SelectItem value="user">Utilisateur spécifique</SelectItem>
                        <SelectItem value="repairer">Réparateurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.target_type !== 'all' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valeur cible</label>
                      <Input
                        value={formData.target_value}
                        onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                        placeholder="admin, user, email..."
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Programmation (optionnel)</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {editingNotification ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Total envoyées</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-admin-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">Programmées</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Taux d'ouverture</p>
                <p className="text-2xl font-bold">73%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-admin-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Destinataires actifs</p>
                <p className="text-2xl font-bold">456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium truncate">{notification.title}</h4>
                          {getPriorityBadge(notification.priority)}
                          {getStatusBadge(notification.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Cible: {notification.target_type}</span>
                          <span>Destinataires: {notification.total_recipients}</span>
                          {notification.read_count > 0 && (
                            <span>Lu: {notification.read_count}/{notification.total_recipients}</span>
                          )}
                          <span>{new Date(notification.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status === 'draft' && (
                        <Button size="sm" onClick={() => handleSendNotification(notification.id)}>
                          <Send className="h-3 w-3 mr-1" />
                          Envoyer
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Templates de notification</CardTitle>
              <Button onClick={() => setIsTemplateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.subject}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <Badge variant={template.is_active ? 'default' : 'outline'}>
                            {template.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance des notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Email', 'Push', 'In-app', 'SMS'].map((channel, index) => (
                    <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{channel}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 1000)} envoyées
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-admin-green">
                          {(60 + Math.random() * 30).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taux d'ouverture</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '14:32', action: 'Notification système envoyée', count: 67 },
                    { time: '14:15', action: 'Template créé', count: 1 },
                    { time: '13:58', action: 'Notification planifiée', count: 23 },
                    { time: '13:45', action: 'Campagne terminée', count: 156 },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-admin-blue rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{activity.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManager;