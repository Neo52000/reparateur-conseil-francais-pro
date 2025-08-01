import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Package, 
  Activity,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Interfaces pour les widgets
export interface WidgetProps {
  config: any;
  className?: string;
}

// Widget de métriques rapides
export const MetricsWidget: React.FC<WidgetProps> = ({ config, className }) => {
  const metrics = config.metrics || [
    { label: 'Commandes', value: '24', trend: '+12%', color: 'text-blue-600' },
    { label: 'Revenus', value: '1,247€', trend: '+8%', color: 'text-green-600' },
    { label: 'Clients', value: '156', trend: '+15%', color: 'text-purple-600' },
    { label: 'Stock', value: '98%', trend: '-2%', color: 'text-orange-600' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {config.title || 'Métriques'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
              <div className="text-xs text-green-600">
                {metric.trend}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Widget graphique
export const ChartWidget: React.FC<WidgetProps> = ({ config, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {config.title || 'Graphique de tendances'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Graphique {config.chartType || 'ligne'}</p>
            <p className="text-xs">Données de simulation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Widget commandes récentes
export const RecentOrdersWidget: React.FC<WidgetProps> = ({ config, className }) => {
  const orders = config.orders || [
    { id: '#1234', client: 'Marie Dubois', device: 'iPhone 13', status: 'En cours', amount: '149€' },
    { id: '#1235', client: 'Pierre Martin', device: 'Samsung S21', status: 'Terminé', amount: '89€' },
    { id: '#1236', client: 'Julie Moreau', device: 'iPad Air', status: 'Diagnostic', amount: '45€' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'terminé': return 'bg-green-500';
      case 'en cours': return 'bg-blue-500';
      case 'diagnostic': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {config.title || 'Commandes récentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">{order.id}</div>
                <div className="text-xs text-muted-foreground">{order.client}</div>
                <div className="text-xs text-muted-foreground">{order.device}</div>
              </div>
              <div className="text-right">
                <Badge className={`text-white text-xs ${getStatusColor(order.status)}`}>
                  {order.status}
                </Badge>
                <div className="text-sm font-medium mt-1">{order.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Widget calendrier
export const CalendarWidget: React.FC<WidgetProps> = ({ config, className }) => {
  const appointments = config.appointments || [
    { time: '09:00', client: 'Jean Dupont', service: 'Réparation écran' },
    { time: '10:30', client: 'Marie Claire', service: 'Changement batterie' },
    { time: '14:00', client: 'Paul Durand', service: 'Diagnostic complet' },
    { time: '16:30', client: 'Sophie Martin', service: 'Réparation connecteur' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {config.title || 'Rendez-vous du jour'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {appointments.map((appointment, index) => (
            <div key={index} className="flex items-center gap-3 p-2 border rounded">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{appointment.time}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{appointment.client}</div>
                <div className="text-xs text-muted-foreground">{appointment.service}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Widget alertes stock
export const StockAlertsWidget: React.FC<WidgetProps> = ({ config, className }) => {
  const alerts = config.alerts || [
    { item: 'Écran iPhone 13', current: 2, minimum: 5, severity: 'high' },
    { item: 'Batterie Samsung S21', current: 8, minimum: 10, severity: 'medium' },
    { item: 'Outils réparation', current: 15, minimum: 20, severity: 'low' }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {config.title || 'Alertes stock'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {getSeverityIcon(alert.severity)}
                <div>
                  <div className="text-sm font-medium">{alert.item}</div>
                  <div className="text-xs text-muted-foreground">
                    Stock: {alert.current} / Min: {alert.minimum}
                  </div>
                </div>
              </div>
              <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                Faible
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Widget performances
export const PerformanceWidget: React.FC<WidgetProps> = ({ config, className }) => {
  const stats = config.stats || [
    { label: 'Temps moyen réparation', value: '2.5h', status: 'good' },
    { label: 'Taux de satisfaction', value: '98%', status: 'excellent' },
    { label: 'Commandes complétées', value: '47/50', status: 'good' },
    { label: 'Objectif mensuel', value: '78%', status: 'warning' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {config.title || 'Performances'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(stat.status)}
                <span className="text-sm">{stat.label}</span>
              </div>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Widget clients
export const CustomersWidget: React.FC<WidgetProps> = ({ config, className }) => {
  const customers = config.customers || [
    { name: 'Marie Dubois', lastVisit: '2024-01-15', totalOrders: 8, status: 'premium' },
    { name: 'Jean Martin', lastVisit: '2024-01-14', totalOrders: 3, status: 'regular' },
    { name: 'Sophie Durand', lastVisit: '2024-01-13', totalOrders: 12, status: 'premium' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {config.title || 'Clients récents'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {customers.map((customer, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="text-sm font-medium">{customer.name}</div>
                <div className="text-xs text-muted-foreground">
                  Dernière visite: {new Date(customer.lastVisit).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={customer.status === 'premium' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {customer.totalOrders} commandes
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Définition des types de widgets disponibles
export const dashboardWidgetTypes = [
  {
    id: 'metrics',
    name: 'Métriques',
    icon: BarChart3,
    category: 'Analytics',
    defaultConfig: {
      title: 'Métriques principales',
      metrics: [
        { label: 'Commandes', value: '24', trend: '+12%', color: 'text-blue-600' },
        { label: 'Revenus', value: '1,247€', trend: '+8%', color: 'text-green-600' }
      ]
    },
    component: MetricsWidget
  },
  {
    id: 'chart',
    name: 'Graphique',
    icon: TrendingUp,
    category: 'Analytics',
    defaultConfig: {
      title: 'Évolution des ventes',
      chartType: 'line',
      period: '7d'
    },
    component: ChartWidget
  },
  {
    id: 'recent-orders',
    name: 'Commandes récentes',
    icon: Package,
    category: 'Business',
    defaultConfig: {
      title: 'Dernières commandes',
      limit: 5
    },
    component: RecentOrdersWidget
  },
  {
    id: 'calendar',
    name: 'Rendez-vous',
    icon: Calendar,
    category: 'Business',
    defaultConfig: {
      title: 'Planning du jour',
      view: 'day'
    },
    component: CalendarWidget
  },
  {
    id: 'stock-alerts',
    name: 'Alertes stock',
    icon: AlertCircle,
    category: 'Inventory',
    defaultConfig: {
      title: 'Stock faible',
      threshold: 10
    },
    component: StockAlertsWidget
  },
  {
    id: 'performance',
    name: 'Performances',
    icon: Activity,
    category: 'Analytics',
    defaultConfig: {
      title: 'Indicateurs de performance',
      period: '30d'
    },
    component: PerformanceWidget
  },
  {
    id: 'customers',
    name: 'Clients',
    icon: Users,
    category: 'Business',
    defaultConfig: {
      title: 'Clients récents',
      limit: 5
    },
    component: CustomersWidget
  }
];