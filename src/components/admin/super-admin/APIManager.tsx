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
  Key, 
  Plus, 
  Edit3, 
  Trash2, 
  Activity,
  Lock,
  Unlock,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  Code,
  Database,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'disabled' | 'expired';
  scope: string[];
  rate_limit: number;
  usage_count: number;
  created_at: string;
  expires_at: string | null;
  last_used: string | null;
  created_by: string;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  status: 'active' | 'deprecated' | 'maintenance';
  response_time: number;
  success_rate: number;
  requests_today: number;
  auth_required: boolean;
  rate_limit: number;
}

interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'oauth';
  status: 'connected' | 'disconnected' | 'error';
  url: string;
  description: string;
  last_sync: string | null;
  error_count: number;
}

const APIManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [isCreateIntegrationModalOpen, setIsCreateIntegrationModalOpen] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<{[key: string]: boolean}>({});
  
  const [keyFormData, setKeyFormData] = useState({
    name: '',
    scope: [] as string[],
    rate_limit: 1000,
    expires_at: ''
  });

  const [integrationFormData, setIntegrationFormData] = useState({
    name: '',
    type: 'api',
    url: '',
    description: ''
  });

  const { toast } = useToast();

  const usageData = [
    { time: '00:00', requests: 145, errors: 2 },
    { time: '04:00', requests: 89, errors: 0 },
    { time: '08:00', requests: 267, errors: 5 },
    { time: '12:00', requests: 423, errors: 8 },
    { time: '16:00', requests: 389, errors: 3 },
    { time: '20:00', requests: 234, errors: 1 },
  ];

  const endpointUsageData = [
    { name: '/api/pos/transactions', value: 35, color: 'hsl(var(--admin-blue))' },
    { name: '/api/ecommerce/orders', value: 28, color: 'hsl(var(--admin-green))' },
    { name: '/api/auth/login', value: 20, color: 'hsl(var(--admin-purple))' },
    { name: '/api/repairers/search', value: 17, color: 'hsl(var(--admin-yellow))' },
  ];

  useEffect(() => {
    fetchAPIData();
  }, []);

  const fetchAPIData = async () => {
    try {
      setIsLoading(true);
      
      // Données de démonstration
      const mockApiKeys: APIKey[] = [
        {
          id: '1',
          name: 'POS Integration Key',
          key: 'pk_live_51HvJ...xZr9',
          status: 'active',
          scope: ['pos:read', 'pos:write', 'transactions:read'],
          rate_limit: 1000,
          usage_count: 8432,
          created_at: new Date().toISOString(),
          expires_at: null,
          last_used: new Date().toISOString(),
          created_by: 'admin'
        },
        {
          id: '2',
          name: 'Mobile App API',
          key: 'pk_test_4eC...d8',
          status: 'active',
          scope: ['read:profile', 'write:bookings'],
          rate_limit: 5000,
          usage_count: 2341,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          expires_at: new Date(Date.now() + 2592000000).toISOString(),
          last_used: new Date(Date.now() - 3600000).toISOString(),
          created_by: 'admin'
        },
        {
          id: '3',
          name: 'Legacy System',
          key: 'pk_live_legacy_123',
          status: 'disabled',
          scope: ['legacy:read'],
          rate_limit: 100,
          usage_count: 45,
          created_at: new Date(Date.now() - 2592000000).toISOString(),
          expires_at: new Date(Date.now() - 86400000).toISOString(),
          last_used: new Date(Date.now() - 604800000).toISOString(),
          created_by: 'admin'
        }
      ];

      const mockEndpoints: APIEndpoint[] = [
        {
          id: '1',
          path: '/api/pos/transactions',
          method: 'POST',
          description: 'Créer une nouvelle transaction POS',
          status: 'active',
          response_time: 145,
          success_rate: 99.8,
          requests_today: 1234,
          auth_required: true,
          rate_limit: 100
        },
        {
          id: '2',
          path: '/api/ecommerce/orders',
          method: 'GET',
          description: 'Récupérer les commandes e-commerce',
          status: 'active',
          response_time: 89,
          success_rate: 99.9,
          requests_today: 876,
          auth_required: true,
          rate_limit: 200
        },
        {
          id: '3',
          path: '/api/auth/legacy',
          method: 'POST',
          description: 'Ancienne API d\'authentification',
          status: 'deprecated',
          response_time: 567,
          success_rate: 95.2,
          requests_today: 23,
          auth_required: false,
          rate_limit: 10
        }
      ];

      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'Stripe Payment',
          type: 'api',
          status: 'connected',
          url: 'https://api.stripe.com',
          description: 'Traitement des paiements',
          last_sync: new Date().toISOString(),
          error_count: 0
        },
        {
          id: '2',
          name: 'SendGrid Email',
          type: 'api',
          status: 'connected',
          url: 'https://api.sendgrid.com',
          description: 'Service d\'envoi d\'emails',
          last_sync: new Date(Date.now() - 3600000).toISOString(),
          error_count: 2
        },
        {
          id: '3',
          name: 'Legacy ERP Webhook',
          type: 'webhook',
          status: 'error',
          url: 'https://legacy.example.com/webhook',
          description: 'Synchronisation ERP legacy',
          last_sync: new Date(Date.now() - 86400000).toISOString(),
          error_count: 15
        }
      ];

      setApiKeys(mockApiKeys);
      setEndpoints(mockEndpoints);
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Erreur lors du chargement des APIs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newKey: APIKey = {
        id: Date.now().toString(),
        name: keyFormData.name,
        key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
        status: 'active',
        scope: keyFormData.scope,
        rate_limit: keyFormData.rate_limit,
        usage_count: 0,
        created_at: new Date().toISOString(),
        expires_at: keyFormData.expires_at || null,
        last_used: null,
        created_by: 'admin'
      };

      setApiKeys(prev => [newKey, ...prev]);
      setIsCreateKeyModalOpen(false);
      setKeyFormData({
        name: '',
        scope: [],
        rate_limit: 1000,
        expires_at: ''
      });

      toast({
        title: "Clé API créée",
        description: "La nouvelle clé API a été générée avec succès",
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de la clé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la clé API",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAPIKey = async (keyId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) {
      return;
    }

    try {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast({
        title: "Clé supprimée",
        description: "La clé API a été supprimée avec succès",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la clé API",
        variant: "destructive"
      });
    }
  };

  const handleToggleKeyStatus = async (keyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, status: newStatus as any } : key
      ));

      toast({
        title: `Clé ${newStatus === 'active' ? 'activée' : 'désactivée'}`,
        description: "Le statut de la clé a été mis à jour",
      });
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut de la clé",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "La clé a été copiée dans le presse-papiers",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      connected: 'default',
      disabled: 'secondary',
      expired: 'destructive',
      deprecated: 'secondary',
      maintenance: 'secondary',
      disconnected: 'outline',
      error: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected': return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-admin-red" />;
      case 'disabled':
      case 'disconnected': return <Lock className="h-4 w-4 text-admin-gray" />;
      default: return <Clock className="h-4 w-4 text-admin-yellow" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionnaire d'APIs</h2>
          <p className="text-muted-foreground">Gestion des clés API, endpoints et intégrations</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Key className="h-8 w-8 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Clés API actives</p>
                <p className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Endpoints</p>
                <p className="text-2xl font-bold">{endpoints.filter(e => e.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-admin-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Requêtes/jour</p>
                <p className="text-2xl font-bold">3,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-admin-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">Intégrations</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">Clés API</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clés API</CardTitle>
              <Dialog open={isCreateKeyModalOpen} onOpenChange={setIsCreateKeyModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle clé
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle clé API</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateAPIKey} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom de la clé</label>
                      <Input
                        value={keyFormData.name}
                        onChange={(e) => setKeyFormData({...keyFormData, name: e.target.value})}
                        placeholder="ex: Mobile App API"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Permissions (scope)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['pos:read', 'pos:write', 'ecommerce:read', 'ecommerce:write', 'users:read', 'analytics:read'].map((scope) => (
                          <label key={scope} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={keyFormData.scope.includes(scope)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setKeyFormData({...keyFormData, scope: [...keyFormData.scope, scope]});
                                } else {
                                  setKeyFormData({...keyFormData, scope: keyFormData.scope.filter(s => s !== scope)});
                                }
                              }}
                            />
                            <span className="text-sm">{scope}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Limite de taux (req/min)</label>
                        <Input
                          type="number"
                          value={keyFormData.rate_limit}
                          onChange={(e) => setKeyFormData({...keyFormData, rate_limit: Number(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expiration (optionnelle)</label>
                        <Input
                          type="datetime-local"
                          value={keyFormData.expires_at}
                          onChange={(e) => setKeyFormData({...keyFormData, expires_at: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateKeyModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        Créer la clé
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{key.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showKeyValue[key.id] ? key.key : key.key.substring(0, 12) + '...'}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowKeyValue(prev => ({...prev, [key.id]: !prev[key.id]}))}
                            >
                              {showKeyValue[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(key.key)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(key.status)}
                        {getStatusBadge(key.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                      <div>Utilisations: {key.usage_count.toLocaleString()}</div>
                      <div>Limite: {key.rate_limit}/min</div>
                      <div>Créée: {new Date(key.created_at).toLocaleDateString('fr-FR')}</div>
                      <div>Dernière utilisation: {key.last_used ? new Date(key.last_used).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {key.scope.map((scope, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleKeyStatus(key.id, key.status)}
                      >
                        {key.status === 'active' ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                        {key.status === 'active' ? 'Désactiver' : 'Activer'}
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAPIKey(key.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      {getStatusBadge(endpoint.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Temps de réponse:</span>
                        <span className="ml-2 font-medium">{endpoint.response_time}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taux de succès:</span>
                        <span className="ml-2 font-medium text-admin-green">{endpoint.success_rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requêtes/jour:</span>
                        <span className="ml-2 font-medium">{endpoint.requests_today.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auth requise:</span>
                        <span className="ml-2">{endpoint.auth_required ? '✓' : '✗'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Intégrations</CardTitle>
              <Dialog open={isCreateIntegrationModalOpen} onOpenChange={setIsCreateIntegrationModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle intégration
                  </Button>
                </DialogTrigger>
                
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une intégration</DialogTitle>
                  </DialogHeader>
                  
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input
                        value={integrationFormData.name}
                        onChange={(e) => setIntegrationFormData({...integrationFormData, name: e.target.value})}
                        placeholder="ex: Payment Gateway"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select value={integrationFormData.type} onValueChange={(value) => 
                        setIntegrationFormData({...integrationFormData, type: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API REST</SelectItem>
                          <SelectItem value="webhook">Webhook</SelectItem>
                          <SelectItem value="oauth">OAuth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL</label>
                      <Input
                        value={integrationFormData.url}
                        onChange={(e) => setIntegrationFormData({...integrationFormData, url: e.target.value})}
                        placeholder="https://api.example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={integrationFormData.description}
                        onChange={(e) => setIntegrationFormData({...integrationFormData, description: e.target.value})}
                        placeholder="Description de l'intégration"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateIntegrationModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        Ajouter
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(integration.status)}
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{integration.type}</Badge>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                      <div>URL: {integration.url}</div>
                      <div>Dernière sync: {integration.last_sync ? new Date(integration.last_sync).toLocaleString('fr-FR') : 'Jamais'}</div>
                      <div>Erreurs: {integration.error_count}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configurer
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        Tester
                      </Button>
                      
                      {integration.status === 'error' && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reconnecter
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utilisation API (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="requests" stackId="1" stroke="hsl(var(--admin-blue))" fill="hsl(var(--admin-blue-light))" />
                    <Area type="monotone" dataKey="errors" stackId="1" stroke="hsl(var(--admin-red))" fill="hsl(var(--admin-red-light))" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={endpointUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {endpointUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIManager;