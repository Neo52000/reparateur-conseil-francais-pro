import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Euro,
  ShoppingCart,
  Users,
  Package,
  Download,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock
} from 'lucide-react';

interface SalesData {
  period: string;
  revenue: number;
  transactions: number;
  averageTicket: number;
  growth: number;
}

interface ProductPerformance {
  name: string;
  category: string;
  sold: number;
  revenue: number;
  margin: number;
}

interface AdvancedReportingProps {
  sessionId?: string;
  repairerId?: string;
}

const AdvancedReporting: React.FC<AdvancedReportingProps> = ({ sessionId, repairerId }) => {
  const [reportPeriod, setReportPeriod] = useState('today');
  const [reportType, setReportType] = useState('sales');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(false);

  // Données simulées
  useEffect(() => {
    const mockSalesData: SalesData[] = [
      {
        period: "Aujourd'hui",
        revenue: 890.50,
        transactions: 12,
        averageTicket: 74.21,
        growth: 15.3
      },
      {
        period: "Cette semaine",
        revenue: 4250.80,
        transactions: 67,
        averageTicket: 63.44,
        growth: 8.7
      },
      {
        period: "Ce mois",
        revenue: 18950.20,
        transactions: 287,
        averageTicket: 66.03,
        growth: 12.1
      },
      {
        period: "Cette année",
        revenue: 156780.40,
        transactions: 2340,
        averageTicket: 67.01,
        growth: 22.5
      }
    ];

    const mockProductPerformance: ProductPerformance[] = [
      {
        name: "Écran iPhone 13",
        category: "Écrans",
        sold: 45,
        revenue: 6745.50,
        margin: 35.2
      },
      {
        name: "Batterie Samsung S21",
        category: "Batteries",
        sold: 32,
        revenue: 2876.80,
        margin: 42.1
      },
      {
        name: "Diagnostic Complet",
        category: "Services",
        sold: 89,
        revenue: 3115.00,
        margin: 85.7
      },
      {
        name: "Vitre Protection",
        category: "Accessoires",
        sold: 156,
        revenue: 3900.00,
        margin: 28.5
      }
    ];

    setSalesData(mockSalesData);
    setProductPerformance(mockProductPerformance);
  }, [reportPeriod]);

  const getCurrentPeriodData = () => {
    return salesData.find(data => 
      reportPeriod === 'today' && data.period === "Aujourd'hui" ||
      reportPeriod === 'week' && data.period === "Cette semaine" ||
      reportPeriod === 'month' && data.period === "Ce mois" ||
      reportPeriod === 'year' && data.period === "Cette année"
    ) || salesData[0];
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Simulation d'export
    const filename = `rapport_${reportType}_${reportPeriod}_${new Date().toISOString().split('T')[0]}`;
    console.log(`Export ${format.toUpperCase()}: ${filename}`);
    
    // En réalité, ici on générerait le fichier
    alert(`Rapport ${format.toUpperCase()} généré : ${filename}`);
  };

  const currentData = getCurrentPeriodData();

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Reporting Avancé</h2>
            <p className="text-sm text-muted-foreground">
              Analytics et statistiques détaillées
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportReport('pdf')}
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportReport('excel')}
            >
              <Download className="w-4 h-4 mr-1" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {currentData.revenue.toFixed(2)}€
                </div>
                <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Euro className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                +{currentData.growth}%
              </span>
              <span className="text-sm text-muted-foreground">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentData.transactions}
                </div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                {Math.round(currentData.transactions / 7)} par jour (moyenne)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentData.averageTicket.toFixed(2)}€
                </div>
                <div className="text-sm text-muted-foreground">Panier moyen</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">
                Objectif: 75€
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {productPerformance.reduce((sum, p) => sum + p.sold, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Articles vendus</div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">
                {Math.round(productPerformance.reduce((sum, p) => sum + p.sold, 0) / currentData.transactions)} par transaction
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de reporting */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Évolution des ventes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{data.period}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.transactions} transactions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{data.revenue.toFixed(2)}€</div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span className="text-sm text-emerald-600">+{data.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Répartition par mode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Carte bancaire</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">65%</div>
                      <div className="text-sm text-muted-foreground">578.33€</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      <span>Espèces</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">35%</div>
                      <div className="text-sm text-muted-foreground">312.17€</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <div className="font-bold text-lg">{product.sold}</div>
                        <div className="text-sm text-muted-foreground">vendus</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{product.revenue.toFixed(2)}€</div>
                        <div className="text-sm text-muted-foreground">CA</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-emerald-600">{product.margin}%</div>
                        <div className="text-sm text-muted-foreground">marge</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium mb-2">Analyse des tendances</p>
            <p>Graphiques et tendances détaillées disponibles prochainement</p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs vs Réalisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CA mensuel</span>
                    <span>18,950€ / 20,000€</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{width: '94.75%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">94.75% de l'objectif</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Transactions</span>
                    <span>287 / 300</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '95.67%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">95.67% de l'objectif</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heures de pointe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">14h-16h</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-muted rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-sm font-medium">32 ventes</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">10h-12h</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-muted rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                      </div>
                      <span className="text-sm font-medium">26 ventes</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">16h-18h</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-muted rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-medium">22 ventes</span>
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

export default AdvancedReporting;