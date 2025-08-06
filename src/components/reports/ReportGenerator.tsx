import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportData {
  sales: {
    total: number;
    transactions: number;
    avgTransaction: number;
    growth: number;
  };
  products: {
    topSelling: Array<{ name: string; quantity: number; revenue: number }>;
    lowStock: Array<{ name: string; stock: number; minStock: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
  analytics: {
    dailySales: Array<{ date: string; amount: number }>;
    categoryBreakdown: Array<{ category: string; percentage: number; amount: number }>;
  };
}

export const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState<string>('sales');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const reportTypes = [
    { value: 'sales', label: 'Rapport de ventes', icon: DollarSign },
    { value: 'inventory', label: 'Rapport inventaire', icon: Package },
    { value: 'customers', label: 'Rapport clients', icon: Users },
    { value: 'analytics', label: 'Analyse complète', icon: BarChart3 }
  ];

  const generateReport = async () => {
    if (!user || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Paramètres manquants",
        description: "Veuillez sélectionner une période et un type de rapport",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Génération du rapport:', { reportType, dateRange });

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          reportType,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
          userId: user.id
        }
      });

      if (error) throw error;

      setReportData(data);
      toast({
        title: "Rapport généré",
        description: "Le rapport a été généré avec succès"
      });
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current || !reportData) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5, // Réduit pour tenir sur une page
        useCORS: true,
        allowTaint: true,
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width
      const imgHeight = 297; // A4 height
      const canvasRatio = canvas.height / canvas.width;
      const scaledHeight = imgWidth * canvasRatio;
      
      // Forcer le contenu à tenir sur une seule page
      if (scaledHeight > imgHeight) {
        // Réduire la hauteur pour tenir sur une page
        const finalHeight = imgHeight - 20; // Marge de 20mm
        pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, finalHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, scaledHeight);
      }
      
      const fileName = `rapport-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Export réussi",
        description: `Le rapport a été exporté en PDF: ${fileName}`
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport en PDF",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // En fonction du type de rapport, générer le CSV approprié
    switch (reportType) {
      case 'sales':
        csvContent += "Date,Montant,Transactions\n";
        reportData.analytics.dailySales.forEach(day => {
          csvContent += `${day.date},${day.amount},\n`;
        });
        break;
      
      case 'inventory':
        csvContent += "Produit,Stock,Stock Minimum,Quantité Vendue,Chiffre d'Affaires\n";
        reportData.products.topSelling.forEach(product => {
          csvContent += `${product.name},${product.quantity},${product.revenue}\n`;
        });
        break;
      
      case 'customers':
        csvContent += "Métrique,Valeur\n";
        csvContent += `Clients Total,${reportData.customers.total}\n`;
        csvContent += `Nouveaux Clients,${reportData.customers.new}\n`;
        csvContent += `Clients Récurrents,${reportData.customers.returning}\n`;
        break;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export CSV réussi",
      description: "Les données ont été exportées en CSV"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Générateur de rapports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type de rapport</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Période</label>
              <DateRangePicker
                value={{ from: dateRange?.from, to: dateRange?.to }}
                onChange={(range) => setDateRange({ 
                  from: range.from || new Date(), 
                  to: range.to || new Date() 
                })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Génération..." : "Générer le rapport"}
            </Button>
            
            {reportData && (
              <>
                <Button 
                  onClick={exportToPDF}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button 
                  onClick={exportToCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-lg">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {reportTypes.find(t => t.value === reportType)?.label}
            </h1>
            <p className="text-gray-600">
              Période: {format(dateRange!.from, 'dd MMMM yyyy', { locale: fr })} - {format(dateRange!.to, 'dd MMMM yyyy', { locale: fr })}
            </p>
            <p className="text-sm text-gray-500">
              Généré le {format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{reportData.sales.total.toLocaleString('fr-FR')} €</p>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{reportData.sales.growth}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{reportData.sales.transactions}</p>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xs text-gray-500 mt-2">
                  Moyenne: {reportData.sales.avgTransaction.toFixed(2)} €
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{reportData.products.topSelling.length}</p>
                <p className="text-sm text-gray-600">Produits vendus</p>
                <p className="text-xs text-gray-500 mt-2">
                  Stock faible: {reportData.products.lowStock.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{reportData.customers.total}</p>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-xs text-gray-500 mt-2">
                  Nouveaux: {reportData.customers.new}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Produits les plus vendus */}
          {reportData.products.topSelling.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Produits les plus vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.products.topSelling.slice(0, 10).map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{product.name}</span>
                      <div className="text-right">
                        <p className="font-semibold">{product.quantity} unités</p>
                        <p className="text-sm text-gray-600">{product.revenue} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertes stock faible */}
          {reportData.products.lowStock.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Alertes stock faible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.products.lowStock.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="font-medium">{product.name}</span>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">Stock: {product.stock}</p>
                        <p className="text-sm text-gray-600">Minimum: {product.minStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Répartition par catégorie */}
          {reportData.analytics.categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.analytics.categoryBreakdown.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-gray-600">
                          {category.percentage}% - {category.amount} €
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;