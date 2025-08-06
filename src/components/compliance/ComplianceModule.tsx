import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Shield, 
  FileText, 
  Calendar as CalendarIcon, 
  Download, 
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

interface ComplianceReport {
  id: string;
  type: 'nf525' | 'rgpd' | 'police' | 'tax';
  title: string;
  description: string;
  status: 'generated' | 'pending' | 'error';
  generated_at: string;
  period_start: string;
  period_end: string;
  file_url?: string;
}

const ComplianceModule = () => {
  const [reports] = useState<ComplianceReport[]>([
    {
      id: '1',
      type: 'nf525',
      title: 'Rapport NF-525 Janvier 2024',
      description: 'Archivage conforme des tickets de caisse',
      status: 'generated',
      generated_at: '2024-02-01T10:00:00Z',
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      file_url: '/reports/nf525-jan2024.pdf'
    },
    {
      id: '2',
      type: 'police',
      title: 'Déclaration Police Février 2024',
      description: 'Déclaration mensuelle des réparations',
      status: 'pending',
      generated_at: '2024-02-15T14:30:00Z',
      period_start: '2024-02-01',
      period_end: '2024-02-29'
    },
    {
      id: '3',
      type: 'rgpd',
      title: 'Audit RGPD Q1 2024',
      description: 'Rapport de conformité RGPD trimestriel',
      status: 'generated',
      generated_at: '2024-03-31T18:00:00Z',
      period_start: '2024-01-01',
      period_end: '2024-03-31',
      file_url: '/reports/rgpd-q1-2024.pdf'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newReportData, setNewReportData] = useState({
    type: 'police',
    description: '',
    period_start: '',
    period_end: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'generated':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'nf525': 'NF-525',
      'rgpd': 'RGPD',
      'police': 'Police',
      'tax': 'Fiscal'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'nf525': 'default',
      'rgpd': 'secondary',
      'police': 'outline',
      'tax': 'destructive'
    };
    return colors[type as keyof typeof colors] || 'outline';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', newReportData);
    // Ici on appellerait l'API pour générer le rapport
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Module de Conformité
          </h2>
          <p className="text-muted-foreground">
            Gérez la conformité réglementaire et les déclarations obligatoires
          </p>
        </div>
      </div>

      {/* Statistiques de conformité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports générés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'generated').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité NF-525</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">Dernière vérification: aujourd'hui</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaine déclaration</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">15 Mars</div>
            <p className="text-xs text-muted-foreground">Déclaration police</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rapports de conformité</CardTitle>
                  <CardDescription>
                    Consultez et téléchargez vos rapports de conformité
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(report.status)}
                          <div>
                            <h4 className="font-medium">{report.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {report.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getTypeColor(report.type)}>
                                {getTypeLabel(report.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(report.period_start)} - {formatDate(report.period_end)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status === 'generated' ? 'Généré' : 
                             report.status === 'pending' ? 'En cours' : 'Erreur'}
                          </Badge>
                          
                          <div className="text-sm text-muted-foreground">
                            {formatDate(report.generated_at)}
                          </div>
                          
                          {report.file_url && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Générer un nouveau rapport</CardTitle>
              <CardDescription>
                Créez un rapport de conformité pour une période donnée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type de rapport</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newReportData.type}
                    onChange={(e) => setNewReportData({ ...newReportData, type: e.target.value })}
                  >
                    <option value="police">Déclaration Police</option>
                    <option value="nf525">Rapport NF-525</option>
                    <option value="rgpd">Audit RGPD</option>
                    <option value="tax">Déclaration Fiscale</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Période</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Description du rapport..."
                  value={newReportData.description}
                  onChange={(e) => setNewReportData({ ...newReportData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de début</label>
                  <Input
                    type="date"
                    value={newReportData.period_start}
                    onChange={(e) => setNewReportData({ ...newReportData, period_start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de fin</label>
                  <Input
                    type="date"
                    value={newReportData.period_end}
                    onChange={(e) => setNewReportData({ ...newReportData, period_end: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Générer le rapport
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier des obligations</CardTitle>
              <CardDescription>
                Planifiez vos déclarations et rapports de conformité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Échéances à venir</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div>
                        <div className="font-medium">Déclaration Police</div>
                        <div className="text-sm text-muted-foreground">15 Mars 2024</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div>
                        <div className="font-medium">Rapport NF-525</div>
                        <div className="text-sm text-muted-foreground">31 Mars 2024</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium">Audit RGPD</div>
                        <div className="text-sm text-muted-foreground">30 Avril 2024</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceModule;