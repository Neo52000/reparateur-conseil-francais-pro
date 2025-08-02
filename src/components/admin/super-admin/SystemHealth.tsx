import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Server,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useSystemManagement } from '@/hooks/useSystemManagement';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  icon: React.ElementType;
  color: string;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  last_check: string;
  response_time: number;
  error_count: number;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  service: string;
}

const SystemHealth: React.FC = () => {
  const { toast } = useToast();
  const { 
    services: systemServices, 
    updateServiceStatus 
  } = useSystemManagement();
  
  const { 
    createNotification 
  } = useSystemNotifications();
  
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 78 },
    { time: '04:00', cpu: 32, memory: 58, disk: 79 },
    { time: '08:00', cpu: 67, memory: 74, disk: 81 },
    { time: '12:00', cpu: 89, memory: 82, disk: 83 },
    { time: '16:00', cpu: 76, memory: 79, disk: 85 },
    { time: '20:00', cpu: 54, memory: 71, disk: 86 },
  ];

  const diskUsageData = [
    { name: 'Système', value: 35, color: 'hsl(var(--admin-blue))' },
    { name: 'Données', value: 45, color: 'hsl(var(--admin-green))' },
    { name: 'Logs', value: 15, color: 'hsl(var(--admin-yellow))' },
    { name: 'Libre', value: 5, color: 'hsl(var(--admin-gray))' },
  ];

  useEffect(() => {
    fetchSystemHealth();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true);
      
      // Données de démonstration
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU',
          value: 67,
          unit: '%',
          status: 'warning',
          threshold: 80,
          icon: Cpu,
          color: 'hsl(var(--admin-yellow))'
        },
        {
          name: 'Mémoire',
          value: 74,
          unit: '%',
          status: 'healthy',
          threshold: 85,
          icon: HardDrive,
          color: 'hsl(var(--admin-green))'
        },
        {
          name: 'Disque',
          value: 86,
          unit: '%',
          status: 'critical',
          threshold: 85,
          icon: Database,
          color: 'hsl(var(--admin-red))'
        },
        {
          name: 'Réseau',
          value: 23,
          unit: 'Mbps',
          status: 'healthy',
          threshold: 100,
          icon: Wifi,
          color: 'hsl(var(--admin-blue))'
        }
      ];

      const mockServices: ServiceStatus[] = [
        {
          name: 'API Principal',
          status: 'running',
          uptime: '15j 4h 23m',
          last_check: new Date().toISOString(),
          response_time: 145,
          error_count: 0
        },
        {
          name: 'Base de données',
          status: 'running',
          uptime: '23j 12h 45m',
          last_check: new Date().toISOString(),
          response_time: 23,
          error_count: 2
        },
        {
          name: 'Service POS',
          status: 'error',
          uptime: '0j 0h 0m',
          last_check: new Date(Date.now() - 300000).toISOString(),
          response_time: 0,
          error_count: 15
        },
        {
          name: 'Service E-commerce',
          status: 'running',
          uptime: '7j 8h 12m',
          last_check: new Date().toISOString(),
          response_time: 289,
          error_count: 1
        }
      ];

      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'error',
          title: 'Service POS indisponible',
          message: 'Le service POS ne répond plus depuis 5 minutes',
          timestamp: new Date().toISOString(),
          resolved: false,
          service: 'pos'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Utilisation disque élevée',
          message: 'L\'utilisation du disque dépasse 85%',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: false,
          service: 'system'
        },
        {
          id: '3',
          type: 'info',
          title: 'Maintenance programmée',
          message: 'Maintenance système prévue demain à 02:00',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: true,
          service: 'system'
        }
      ];

      setMetrics(mockMetrics);
      setServices(mockServices);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Erreur lors du chargement de la santé système:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les métriques système",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running': return 'text-admin-green';
      case 'warning': return 'text-admin-yellow';
      case 'critical':
      case 'error': return 'text-admin-red';
      case 'stopped': return 'text-admin-gray';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running': return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-admin-yellow" />;
      case 'critical':
      case 'error': return <XCircle className="h-4 w-4 text-admin-red" />;
      case 'stopped': return <Clock className="h-4 w-4 text-admin-gray" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-admin-red" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-admin-yellow" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-admin-blue" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleRestartService = async (serviceName: string) => {
    try {
      // Mettre le service en état de redémarrage
      await updateServiceStatus(serviceName, 'restarting');
      
      await createNotification(
        'maintenance',
        'Service en cours de redémarrage',
        `Le service ${serviceName} est en cours de redémarrage`,
        'warning'
      );

      toast({
        title: "Redémarrage en cours",
        description: `Redémarrage du service ${serviceName}...`,
      });

      // Restart service immediately
      try {
        await updateServiceStatus(serviceName, 'running');
        
        toast({
          title: "Service redémarré",
          description: `${serviceName} a été redémarré avec succès`,
        });
      } catch (error) {
        console.error('Service restart failed:', error);
        toast({
          title: "Erreur",
          description: "Échec du redémarrage du service",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Erreur lors du redémarrage:', error);
      toast({
        title: "Erreur",
        description: `Impossible de redémarrer ${serviceName}`,
        variant: "destructive"
      });
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true }
        : alert
    ));
    
    toast({
      title: "Alerte résolue",
      description: "L'alerte a été marquée comme résolue",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Santé du Système</h2>
          <p className="text-muted-foreground">Monitoring temps réel</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Arrêter' : 'Démarrer'} Auto-refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Métriques système principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-6 w-6" style={{ color: metric.color }} />
                  {getStatusIcon(metric.status)}
                </div>
                <h3 className="font-medium text-sm text-muted-foreground">{metric.name}</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seuil: {metric.threshold}{metric.unit}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>État des Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Uptime: {service.uptime}</span>
                          <span>Réponse: {service.response_time}ms</span>
                          <span>Erreurs: {service.error_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        service.status === 'running' ? 'default' :
                        service.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {service.status}
                      </Badge>
                      
                      {service.status !== 'running' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRestartService(service.name)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Redémarrer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertes Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${alert.resolved ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Service: {alert.service}</span>
                            <span>{new Date(alert.timestamp).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.type === 'error' ? 'destructive' :
                          alert.type === 'warning' ? 'secondary' : 'outline'
                        }>
                          {alert.type}
                        </Badge>
                        
                        {!alert.resolved && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Résoudre
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Système (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="hsl(var(--admin-red))" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="hsl(var(--admin-blue))" name="Mémoire %" />
                    <Line type="monotone" dataKey="disk" stroke="hsl(var(--admin-green))" name="Disque %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation du Disque</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={diskUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {diskUsageData.map((entry, index) => (
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

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processeur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Utilisation moyenne</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cœurs actifs</span>
                      <span>8/8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fréquence</span>
                      <span>2.4 GHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Température</span>
                      <span>45°C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mémoire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Utilisation</span>
                    <span>11.8 GB / 16 GB</span>
                  </div>
                  <Progress value={74} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cache</span>
                      <span>2.1 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buffers</span>
                      <span>512 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disponible</span>
                      <span>4.2 GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réseau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Bande passante</span>
                    <span>23 Mbps / 100 Mbps</span>
                  </div>
                  <Progress value={23} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Entrant</span>
                      <span>12.4 Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sortant</span>
                      <span>10.6 Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latence</span>
                      <span>15ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealth;