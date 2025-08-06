import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  FileText,
  Printer
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';

interface SalesData {
  date: string;
  amount: number;
  transactions: number;
  avgTicket: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface StaffPerformance {
  name: string;
  sales: number;
  transactions: number;
  avgTicket: number;
}

const ReportsAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTicket: 0,
    growth: 0
  });

  // Données de démonstration
  const mockSalesData: SalesData[] = [
    { date: '2024-01-01', amount: 1250, transactions: 15, avgTicket: 83.33 },
    { date: '2024-01-02', amount: 1890, transactions: 22, avgTicket: 85.91 },
    { date: '2024-01-03', amount: 2100, transactions: 28, avgTicket: 75.00 },
    { date: '2024-01-04', amount: 1650, transactions: 19, avgTicket: 86.84 },
    { date: '2024-01-05', amount: 2350, transactions: 31, avgTicket: 75.81 },
    { date: '2024-01-06', amount: 2800, transactions: 35, avgTicket: 80.00 },
    { date: '2024-01-07', amount: 1950, transactions: 24, avgTicket: 81.25 }
  ];

  const mockTopProducts: TopProduct[] = [
    { name: 'Écran iPhone 13', quantity: 45, revenue: 6750 },
    { name: 'Batterie Samsung S21', quantity: 38, revenue: 3420 },
    { name: 'Vitre iPad Air', quantity: 22, revenue: 3300 },
    { name: 'Connecteur charge iPhone', quantity: 67, revenue: 2010 },
    { name: 'Écran Samsung A54', quantity: 31, revenue: 2790 }
  ];

  const mockStaffPerformance: StaffPerformance[] = [
    { name: 'Marie Dupont', sales: 15650, transactions: 89, avgTicket: 175.84 },
    { name: 'Pierre Martin', sales: 12300, transactions: 76, avgTicket: 161.84 },
    { name: 'Sophie Dubois', sales: 18900, transactions: 102, avgTicket: 185.29 },
    { name: 'Lucas Bernard', sales: 9800, transactions: 58, avgTicket: 169.00 }
  ];

  const categoryData = [
    { name: 'Réparations', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Accessoires', value: 20, color: 'hsl(var(--secondary))' },
    { name: 'Rachats', value: 10, color: 'hsl(var(--accent))' },
    { name: 'Services', value: 5, color: 'hsl(var(--muted))' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simuler un chargement des données depuis Supabase
      // En réalité, cela interrogerait les tables pos_transactions, pos_inventory_items, etc.
      
      setSalesData(mockSalesData);
      setTopProducts(mockTopProducts);
      setStaffPerformance(mockStaffPerformance);
      
      // Calculer les statistiques de résumé
      const totalRevenue = mockSalesData.reduce((sum, day) => sum + day.amount, 0);
      const totalTransactions = mockSalesData.reduce((sum, day) => sum + day.transactions, 0);
      const avgTicket = totalRevenue / totalTransactions;
      
      setSummaryStats({
        totalRevenue,
        totalTransactions,
        avgTicket,
        growth: 12.5 // Calculé par rapport à la période précédente
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'analyse",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const reportData = {
        title: `Rapport de Ventes - ${period}`,
        period,
        summary: summaryStats,
        salesData,
        topProducts,
        staffPerformance,
        generatedAt: new Date().toISOString()
      };
      
      await exportToPDF(reportData, `rapport-ventes-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export réussi",
        description: "Le rapport PDF a été généré avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le rapport PDF",
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = salesData.map(item => ({
        Date: item.date,
        'Chiffre d\'affaires': item.amount,
        'Transactions': item.transactions,
        'Ticket moyen': item.avgTicket.toFixed(2)
      }));
      
      await exportToCSV(csvData, `donnees-ventes-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export réussi",
        description: "Les données ont été exportées en CSV"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données en CSV",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Rapports & Analyses
          </h2>
          <p className="text-muted-foreground">
            Analysez vos performances de vente et générez des rapports détaillés
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportCSV} size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{summaryStats.totalRevenue.toLocaleString()}€</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{summaryStats.growth}%
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{summaryStats.totalTransactions}</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2%
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket moyen</p>
                <p className="text-2xl font-bold">{summaryStats.avgTicket.toFixed(2)}€</p>
                <div className="flex items-center text-sm text-orange-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +3.1%
                </div>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients uniques</p>
                <p className="text-2xl font-bold">127</p>
                <div className="flex items-center text-sm text-purple-600 mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15.3%
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="staff">Personnel</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                      formatter={(value: number) => [`${value}€`, 'Chiffre d\'affaires']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transactions par jour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                      formatter={(value: number) => [value, 'Transactions']}
                    />
                    <Bar dataKey="transactions" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produits les plus vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} unités vendues</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.revenue.toLocaleString()}€</p>
                      <p className="text-sm text-muted-foreground">CA total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Performance du personnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffPerformance.map((staff, index) => (
                  <div key={staff.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{staff.sales.toLocaleString()}€</p>
                      <p className="text-sm text-muted-foreground">Ticket moyen: {staff.avgTicket.toFixed(2)}€</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;