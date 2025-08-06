import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  Database,
  Settings,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Globe,
  Lock,
  Plus
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

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: string;
  user_agent: string;
  session_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'warning';
}

interface ComplianceReport {
  id: string;
  name: string;
  type: 'gdpr' | 'security' | 'financial' | 'custom';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  records_count: number;
  file_url: string | null;
}

interface AuditRule {
  id: string;
  name: string;
  description: string;
  condition: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  alert_email: string;
  created_at: string;
}

const AuditTrail: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [auditRules, setAuditRules] = useState<AuditRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    severity: 'all',
    status: 'all',
    date_from: '',
    date_to: ''
  });

  const { toast } = useToast();

  const activityData = [
    { time: '00:00', logins: 12, modifications: 5, errors: 1 },
    { time: '04:00', logins: 3, modifications: 2, errors: 0 },
    { time: '08:00', logins: 45, modifications: 23, errors: 2 },
    { time: '12:00', logins: 67, modifications: 34, errors: 5 },
    { time: '16:00', logins: 52, modifications: 28, errors: 3 },
    { time: '20:00', logins: 28, modifications: 15, errors: 1 },
  ];

  const actionTypeData = [
    { name: 'Connexions', value: 35, color: 'hsl(var(--admin-blue))' },
    { name: 'Modifications', value: 28, color: 'hsl(var(--admin-green))' },
    { name: 'Suppressions', value: 15, color: 'hsl(var(--admin-red))' },
    { name: 'Créations', value: 22, color: 'hsl(var(--admin-purple))' },
  ];

  const severityData = [
    { name: 'Faible', value: 45, color: 'hsl(var(--admin-blue))' },
    { name: 'Moyenne', value: 30, color: 'hsl(var(--admin-yellow))' },
    { name: 'Élevée', value: 20, color: 'hsl(var(--admin-orange))' },
    { name: 'Critique', value: 5, color: 'hsl(var(--admin-red))' },
  ];

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      setIsLoading(true);
      
      // Données de démonstration
      const mockAuditLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          user_id: 'admin-123',
          user_email: 'admin@repairhub.fr',
          action: 'LOGIN',
          resource_type: 'auth',
          resource_id: null,
          details: { method: 'password', success: true },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          session_id: 'sess_abc123',
          severity: 'low',
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user_id: 'repairer-456',
          user_email: 'jean.dupont@techrepair.fr',
          action: 'UPDATE_PROFILE',
          resource_type: 'repairer_profile',
          resource_id: 'profile_789',
          details: { 
            fields_changed: ['phone', 'address'],
            old_values: { phone: '0123456789', address: 'Ancienne adresse' },
            new_values: { phone: '0987654321', address: 'Nouvelle adresse' }
          },
          ip_address: '85.123.45.67',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          session_id: 'sess_def456',
          severity: 'medium',
          status: 'success'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user_id: 'admin-123',
          user_email: 'admin@repairhub.fr',
          action: 'DELETE_USER',
          resource_type: 'user',
          resource_id: 'user_999',
          details: { 
            reason: 'Account violation',
            deleted_data: { email: 'spam@example.com', role: 'user' }
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          session_id: 'sess_abc123',
          severity: 'high',
          status: 'success'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          user_id: 'system',
          user_email: 'system@repairhub.fr',
          action: 'FAILED_LOGIN_ATTEMPT',
          resource_type: 'auth',
          resource_id: null,
          details: { 
            attempted_email: 'hacker@malicious.com',
            attempts_count: 5,
            blocked: true
          },
          ip_address: '192.168.1.666',
          user_agent: 'curl/7.68.0',
          session_id: 'sess_suspicious',
          severity: 'critical',
          status: 'failed'
        }
      ];

      const mockComplianceReports: ComplianceReport[] = [
        {
          id: '1',
          name: 'Rapport RGPD mensuel',
          type: 'gdpr',
          status: 'completed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          records_count: 12847,
          file_url: '/reports/gdpr-2024-01.pdf'
        },
        {
          id: '2',
          name: 'Audit sécurité Q1',
          type: 'security',
          status: 'running',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: null,
          records_count: 0,
          file_url: null
        },
        {
          id: '3',
          name: 'Rapport financier',
          type: 'financial',
          status: 'scheduled',
          created_at: new Date(Date.now() + 86400000).toISOString(),
          completed_at: null,
          records_count: 0,
          file_url: null
        }
      ];

      const mockAuditRules: AuditRule[] = [
        {
          id: '1',
          name: 'Connexions suspectes',
          description: 'Alerte en cas de multiples tentatives de connexion échouées',
          condition: { failed_login_attempts: { threshold: 5, timeframe: '5m' } },
          severity: 'high',
          enabled: true,
          alert_email: 'security@repairhub.fr',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Modifications sensibles',
          description: 'Surveillance des modifications de données utilisateur',
          condition: { resource_types: ['user', 'repairer_profile'], actions: ['UPDATE', 'DELETE'] },
          severity: 'medium',
          enabled: true,
          alert_email: 'audit@repairhub.fr',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Accès administrateur',
          description: 'Log de tous les accès avec des privilèges administrateur',
          condition: { user_roles: ['admin', 'super_admin'] },
          severity: 'high',
          enabled: true,
          alert_email: 'admin@repairhub.fr',
          created_at: new Date().toISOString()
        }
      ];

      setAuditLogs(mockAuditLogs);
      setComplianceReports(mockComplianceReports);
      setAuditRules(mockAuditRules);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'audit",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  const handleGenerateReport = async (type: string) => {
    try {
      const newReport: ComplianceReport = {
        id: Date.now().toString(),
        name: `Rapport ${type} - ${new Date().toLocaleDateString()}`,
        type: type as any,
        status: 'running',
        created_at: new Date().toISOString(),
        completed_at: null,
        records_count: 0,
        file_url: null
      };

      setComplianceReports(prev => [newReport, ...prev]);

      toast({
        title: "Rapport en cours de génération",
        description: `Le rapport ${type} est en cours de création...`,
      });

      // Simulation de la génération
      setTimeout(() => {
        setComplianceReports(prev => prev.map(report => 
          report.id === newReport.id 
            ? { 
                ...report, 
                status: 'completed', 
                completed_at: new Date().toISOString(),
                records_count: Math.floor(Math.random() * 10000) + 1000,
                file_url: `/reports/${type}-${Date.now()}.pdf`
              }
            : report
        ));
        
        toast({
          title: "Rapport généré",
          description: "Le rapport est maintenant disponible au téléchargement",
        });
      }, 5000);

    } catch (error: any) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-admin-blue';
      case 'medium': return 'text-admin-yellow';
      case 'high': return 'text-admin-orange';
      case 'critical': return 'text-admin-red';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'failed': return <XCircle className="h-4 w-4 text-admin-red" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-admin-yellow" />;
      default: return <Clock className="h-4 w-4 text-admin-gray" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      completed: 'default',
      running: 'secondary',
      scheduled: 'outline',
      failed: 'destructive',
      warning: 'secondary'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !filters.search || 
      log.user_email.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesAction = filters.action === 'all' || log.action === filters.action;
    const matchesSeverity = filters.severity === 'all' || log.severity === filters.severity;
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    
    return matchesSearch && matchesAction && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Piste d'Audit</h2>
          <p className="text-muted-foreground">Surveillance et conformité des activités système</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Statistiques d'audit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Événements/jour</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-admin-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">Alertes actives</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Rapports générés</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-admin-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Conformité</p>
                <p className="text-2xl font-bold">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Logs d'audit</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="rules">Règles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Journal d'audit</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-8 w-64"
                    />
                  </div>
                  
                  <Select value={filters.severity} onValueChange={(value) => 
                    setFilters({...filters, severity: value})
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sévérité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.status} onValueChange={(value) => 
                    setFilters({...filters, status: value})
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="success">Succès</SelectItem>
                      <SelectItem value="failed">Échec</SelectItem>
                      <SelectItem value="warning">Avertissement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(log.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            <Badge variant="outline" className="text-xs">{log.resource_type}</Badge>
                            <span className={`text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {log.severity.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            <span>{log.user_email}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                            <span className="mx-2">•</span>
                            <span>{log.ip_address}</span>
                          </div>
                          
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {JSON.stringify(log.details, null, 0).substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(log.status)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports de conformité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            <div>
                              <h4 className="font-medium">{report.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {report.records_count > 0 && `${report.records_count.toLocaleString()} enregistrements`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.type}</Badge>
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Créé: {new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
                          {report.completed_at && report.file_url && (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Télécharger
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Générer un rapport</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleGenerateReport('gdpr')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Rapport RGPD
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleGenerateReport('security')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Audit sécurité
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleGenerateReport('financial')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Rapport financier
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleGenerateReport('custom')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Rapport personnalisé
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Règles d'audit</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle règle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-admin-green' : 'bg-admin-gray'}`} />
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity.toUpperCase()}
                        </span>
                        {rule.enabled ? (
                          <Badge variant="default">Activée</Badge>
                        ) : (
                          <Badge variant="outline">Désactivée</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      <span>Notification: {rule.alert_email}</span>
                      <span className="mx-2">•</span>
                      <span>Créée: {new Date(rule.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configurer
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: rule.enabled ? "Règle désactivée" : "Règle activée",
                            description: `La règle "${rule.name}" a été ${rule.enabled ? 'désactivée' : 'activée'}`,
                          });
                        }}
                      >
                        {rule.enabled ? 'Désactiver' : 'Activer'}
                      </Button>
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
                <CardTitle>Activité par heure (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="logins" stackId="1" stroke="hsl(var(--admin-blue))" fill="hsl(var(--admin-blue-light))" />
                    <Area type="monotone" dataKey="modifications" stackId="1" stroke="hsl(var(--admin-green))" fill="hsl(var(--admin-green-light))" />
                    <Area type="monotone" dataKey="errors" stackId="1" stroke="hsl(var(--admin-red))" fill="hsl(var(--admin-red-light))" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types d'actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={actionTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {actionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Niveaux de sévérité</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={severityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--admin-blue))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de conformité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">RGPD</span>
                    <span className="font-medium text-admin-green">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sécurité</span>
                    <span className="font-medium text-admin-green">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audit</span>
                    <span className="font-medium text-admin-yellow">95.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rétention</span>
                    <span className="font-medium text-admin-green">100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de détails */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'événement d'audit</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{selectedLog.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span>{new Date(selectedLog.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Action:</span>
                      <span className="font-medium">{selectedLog.action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ressource:</span>
                      <span>{selectedLog.resource_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sévérité:</span>
                      <span className={getSeverityColor(selectedLog.severity)}>
                        {selectedLog.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedLog.status)}
                        <span>{selectedLog.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informations utilisateur</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono">{selectedLog.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedLog.user_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP:</span>
                      <span className="font-mono">{selectedLog.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session:</span>
                      <span className="font-mono">{selectedLog.session_id}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">User Agent</h4>
                <code className="text-xs bg-muted p-2 rounded block">
                  {selectedLog.user_agent}
                </code>
              </div>
              
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Détails techniques</h4>
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTrail;