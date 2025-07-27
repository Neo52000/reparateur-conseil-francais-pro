import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  ShoppingCart, 
  Users, 
  Wrench,
  Target,
  Calendar,
  Clock,
  Star,
  Award,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalesData {
  date: string;
  sales: number;
  repairs: number;
  revenue: number;
  customers: number;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  margin: number;
  category: string;
}

interface EmployeeStats {
  id: string;
  name: string;
  role: string;
  salesCount: number;
  repairsCount: number;
  revenue: number;
  target: number;
  rating: number;
  efficiency: number;
}

interface CustomerMetrics {
  newCustomers: number;
  returningCustomers: number;
  satisfactionScore: number;
  averageOrderValue: number;
  retentionRate: number;
}

const InteractiveDashboard: React.FC = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('7d');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulation de données pour la démo
      const mockSalesData: SalesData[] = [
        { date: '2024-01-15', sales: 12, repairs: 8, revenue: 850, customers: 15 },
        { date: '2024-01-16', sales: 15, repairs: 12, revenue: 1200, customers: 20 },
        { date: '2024-01-17', sales: 18, repairs: 6, revenue: 950, customers: 18 },
        { date: '2024-01-18', sales: 22, repairs: 14, revenue: 1450, customers: 25 },
        { date: '2024-01-19', sales: 16, repairs: 9, revenue: 1100, customers: 19 },
        { date: '2024-01-20', sales: 25, repairs: 18, revenue: 1800, customers: 30 },
        { date: '2024-01-21', sales: 20, repairs: 11, revenue: 1350, customers: 22 }
      ];

      const mockProductData: ProductPerformance[] = [
        { name: 'Écran iPhone 14', sales: 25, revenue: 2250, margin: 45, category: 'Réparation' },
        { name: 'Batterie Samsung', sales: 18, revenue: 900, margin: 60, category: 'Réparation' },
        { name: 'Coque Protection', sales: 45, revenue: 675, margin: 80, category: 'Accessoire' },
        { name: 'Chargeur USB-C', sales: 32, revenue: 480, margin: 70, category: 'Accessoire' },
        { name: 'Vitre Arrière iPhone', sales: 12, revenue: 600, margin: 40, category: 'Réparation' }
      ];

      const mockEmployeeStats: EmployeeStats[] = [
        {
          id: '1',
          name: 'Pierre Technicien',
          role: 'Technicien Senior',
          salesCount: 45,
          repairsCount: 38,
          revenue: 3200,
          target: 3000,
          rating: 4.8,
          efficiency: 92
        },
        {
          id: '2',
          name: 'Marie Vendeuse',
          role: 'Conseillère Vente',
          salesCount: 52,
          repairsCount: 8,
          revenue: 2800,
          target: 2500,
          rating: 4.6,
          efficiency: 88
        },
        {
          id: '3',
          name: 'Jean Apprenti',
          role: 'Apprenti Technicien',
          salesCount: 28,
          repairsCount: 25,
          revenue: 1800,
          target: 2000,
          rating: 4.2,
          efficiency: 75
        }
      ];

      const mockCustomerMetrics: CustomerMetrics = {
        newCustomers: 45,
        returningCustomers: 78,
        satisfactionScore: 4.7,
        averageOrderValue: 85.50,
        retentionRate: 68
      };

      setSalesData(mockSalesData);
      setProductData(mockProductData);
      setEmployeeStats(mockEmployeeStats);
      setCustomerMetrics(mockCustomerMetrics);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "Données actualisées",
      description: "Le dashboard a été mis à jour avec les dernières données",
    });
  };

  const exportData = () => {
    toast({
      title: "Export en cours",
      description: "Les données sont en cours d'export au format Excel",
    });
  };

  const calculateTotalRevenue = () => {
    return salesData.reduce((sum, day) => sum + day.revenue, 0);
  };

  const calculateTotalSales = () => {
    return salesData.reduce((sum, day) => sum + day.sales + day.repairs, 0);
  };

  const getPerformanceColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  const categoryPieData = productData.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.revenue;
    } else {
      acc.push({ name: product.category, value: product.revenue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Interactif</h2>
          <p className="text-muted-foreground">
            Analytics avancées et suivi des performances en temps réel
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">3 mois</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'Affaires
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{calculateTotalRevenue().toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ventes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalSales()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +8% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clients Uniques
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerMetrics ? customerMetrics.newCustomers + customerMetrics.returningCustomers : 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +5% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Panier Moyen
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{customerMetrics?.averageOrderValue.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              -2% vs période précédente
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">
            <Activity className="mr-2 h-4 w-4" />
            Ventes
          </TabsTrigger>
          <TabsTrigger value="products">
            <Award className="mr-2 h-4 w-4" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="mr-2 h-4 w-4" />
            Équipe
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Star className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
                <CardDescription>
                  Revenue quotidien sur les {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventes vs Réparations</CardTitle>
                <CardDescription>
                  Comparaison des volumes d'activité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Ventes" />
                    <Bar dataKey="repairs" fill="#82ca9d" name="Réparations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendances Clients</CardTitle>
              <CardDescription>
                Évolution du nombre de clients par jour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="customers" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Produits par Revenus</CardTitle>
                <CardDescription>
                  Classement des produits les plus rentables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>
                  Distribution des revenus par type de produit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Détaillée des Produits</CardTitle>
              <CardDescription>
                Analyse complète des ventes et marges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.category}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{product.sales}</div>
                        <div className="text-muted-foreground">Ventes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">€{product.revenue}</div>
                        <div className="text-muted-foreground">CA</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{product.margin}%</div>
                        <div className="text-muted-foreground">Marge</div>
                      </div>
                    </div>
                    <Badge variant={product.margin > 50 ? 'default' : 'secondary'}>
                      {product.margin > 50 ? 'Rentable' : 'Moyen'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {employeeStats.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {employee.name}
                    <Badge variant="outline">{employee.role}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Performance sur les {timeRange}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Ventes</div>
                      <div className="text-lg font-bold">{employee.salesCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Réparations</div>
                      <div className="text-lg font-bold">{employee.repairsCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Revenue</div>
                      <div className="text-lg font-bold">€{employee.revenue}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Objectif</div>
                      <div className={`text-lg font-bold ${getPerformanceColor(employee.revenue, employee.target)}`}>
                        €{employee.target}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression objectif</span>
                      <span>{Math.round((employee.revenue / employee.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((employee.revenue / employee.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{employee.rating}/5</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm">{employee.efficiency}% efficacité</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {customerMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Nouveaux Clients
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customerMetrics.newCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                      +15% vs période précédente
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Clients Fidèles
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customerMetrics.returningCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((customerMetrics.returningCustomers / (customerMetrics.newCustomers + customerMetrics.returningCustomers)) * 100)}% du total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Score Satisfaction
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customerMetrics.satisfactionScore}/5</div>
                    <p className="text-xs text-muted-foreground">
                      Excellent niveau de satisfaction
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rétention Client</CardTitle>
                    <CardDescription>
                      Taux de fidélisation sur 12 mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600">
                          {customerMetrics.retentionRate}%
                        </div>
                        <div className="text-muted-foreground">Taux de rétention</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ width: `${customerMetrics.retentionRate}%` }}
                        >
                          {customerMetrics.retentionRate}%
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Objectif: 75% - Performance excellente
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Valeur Client Moyenne</CardTitle>
                    <CardDescription>
                      Évolution du panier moyen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">
                          €{customerMetrics.averageOrderValue}
                        </div>
                        <div className="text-muted-foreground">Panier moyen</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Minimum</div>
                          <div className="text-lg">€25</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">Maximum</div>
                          <div className="text-lg">€450</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveDashboard;