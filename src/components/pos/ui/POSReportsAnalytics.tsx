import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const POSReportsAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [reportType, setReportType] = useState('overview');

  // Données simulées pour les graphiques
  const salesData = [
    { time: '09:00', sales: 120, transactions: 3 },
    { time: '10:00', sales: 350, transactions: 8 },
    { time: '11:00', sales: 280, transactions: 6 },
    { time: '12:00', sales: 560, transactions: 12 },
    { time: '13:00', sales: 420, transactions: 9 },
    { time: '14:00', sales: 680, transactions: 15 },
    { time: '15:00', sales: 520, transactions: 11 },
    { time: '16:00', sales: 390, transactions: 8 },
    { time: '17:00', sales: 450, transactions: 10 },
    { time: '18:00', sales: 320, transactions: 7 }
  ];

  const categoryData = [
    { name: 'Écrans', value: 2840, color: '#3b82f6' },
    { name: 'Batteries', value: 1650, color: '#10b981' },
    { name: 'Accessoires', value: 890, color: '#f59e0b' },
    { name: 'Réparations', value: 3200, color: '#8b5cf6' },
    { name: 'Autres', value: 420, color: '#ef4444' }
  ];

  const topProducts = [
    { name: 'Écran iPhone 13', sales: 25, revenue: 3747.50 },
    { name: 'Batterie Samsung S21', sales: 18, revenue: 1618.20 },
    { name: 'Réparation écran', sales: 32, revenue: 2880.00 },
    { name: 'Coque protection', sales: 45, revenue: 1350.00 },
    { name: 'Chargeur USB-C', sales: 28, revenue: 837.20 }
  ];

  const paymentMethods = [
    { method: 'Carte Bancaire', amount: 4250.80, percentage: 68.2 },
    { method: 'Espèces', amount: 1340.50, percentage: 21.5 },
    { method: 'Mobile Pay', amount: 485.20, percentage: 7.8 },
    { method: 'Chèque', amount: 156.50, percentage: 2.5 }
  ];

  const kpiData = {
    today: {
      revenue: 6232.50,
      transactions: 89,
      avgTicket: 70.03,
      customers: 76,
      items: 143,
      profit: 1247.80
    },
    week: {
      revenue: 28450.30,
      transactions: 456,
      avgTicket: 62.39,
      customers: 312,
      items: 789,
      profit: 6890.50
    },
    month: {
      revenue: 125680.75,
      transactions: 1847,
      avgTicket: 68.05,
      customers: 1203,
      items: 3456,
      profit: 28950.40
    }
  };

  const currentKPIs = kpiData[selectedPeriod as keyof typeof kpiData];

  const exportReport = () => {
    // Logique d'export du rapport
    console.log(`Exporting ${reportType} report for ${selectedPeriod}`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Rapports & Analytics</h2>
          <p className="text-muted-foreground">
            Analysez vos performances et tendances de vente
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Vue d'ensemble</SelectItem>
              <SelectItem value="sales">Ventes détaillées</SelectItem>
              <SelectItem value="inventory">Inventaire</SelectItem>
              <SelectItem value="customers">Clients</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-admin-green" />
              <div>
                <p className="text-xs text-muted-foreground">Chiffre d'Affaires</p>
                <p className="text-lg font-bold">{currentKPIs.revenue.toFixed(2)}€</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-admin-green" />
                  <span className="text-admin-green">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-admin-blue" />
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{currentKPIs.transactions}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-admin-green" />
                  <span className="text-admin-green">+8.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-admin-purple" />
              <div>
                <p className="text-xs text-muted-foreground">Panier Moyen</p>
                <p className="text-lg font-bold">{currentKPIs.avgTicket.toFixed(2)}€</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-admin-green" />
                  <span className="text-admin-green">+3.7%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-admin-yellow" />
              <div>
                <p className="text-xs text-muted-foreground">Clients</p>
                <p className="text-lg font-bold">{currentKPIs.customers}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-admin-green" />
                  <span className="text-admin-green">+15.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-admin-cyan" />
              <div>
                <p className="text-xs text-muted-foreground">Articles Vendus</p>
                <p className="text-lg font-bold">{currentKPIs.items}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-admin-green" />
                  <span className="text-admin-green">+9.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-admin-green" />
              <div>
                <p className="text-xs text-muted-foreground">Marge Brute</p>
                <p className="text-lg font-bold">{currentKPIs.profit.toFixed(2)}€</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-admin-green" />
                  <span className="text-admin-green">+18.4%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Évolution des Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--admin-green))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Ventes par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}€`, 'Ventes']} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}</span>
                  <span className="text-sm font-medium ml-auto">{category.value}€</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits */}
        <Card>
          <CardHeader>
            <CardTitle>Produits les Plus Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.sales} ventes
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.revenue.toFixed(2)}€</div>
                    <div className="text-sm text-muted-foreground">
                      {(product.revenue / product.sales).toFixed(2)}€/unité
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Méthodes de paiement */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{method.method}</span>
                    <span className="text-sm text-muted-foreground">
                      {method.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-muted rounded-full h-2 mr-3">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                    <span className="font-medium min-w-fit">
                      {method.amount.toFixed(2)}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSReportsAnalytics;