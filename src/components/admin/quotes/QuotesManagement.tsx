import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Calendar, Users, TrendingUp, Eye, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, Filter, Download, BarChart3, UserCheck, Send } from 'lucide-react';
import { format, subDays, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AdvancedAnalytics from './AdvancedAnalytics';
interface Quote {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  repairer_id?: string;
  estimated_price?: number;
  client_id?: string;
  repairer_name?: string;
  repairer_business_name?: string;
}
interface RepairStats {
  repair_type: string;
  count: number;
  percentage: number;
}
interface QuoteEvolution {
  date: string;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
}
interface QuoteStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
  avgResponseTime: number;
  conversionRate: number;
}
const QuotesManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
    avgResponseTime: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [quoteEvolution, setQuoteEvolution] = useState<QuoteEvolution[]>([]);
  const [topRepairs, setTopRepairs] = useState<RepairStats[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadQuotes();
    loadStats();
    loadAnalytics();
  }, [filters]);
  const loadQuotes = async () => {
    setLoading(true);
    try {
      let query = supabase.from('quotes_with_timeline').select('*').order('created_at', {
        ascending: false
      });
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%,device_brand.ilike.%${filters.search}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;

      // Enrichir les données avec les noms des réparateurs
      const enrichedQuotes = await Promise.all((data || []).map(async quote => {
        let repairerName = 'Non assigné';
        let repairerBusinessName = 'Non assigné';
        if (quote.repairer_id) {
          const {
            data: repairerData
          } = await supabase.from('repairer_profiles').select('business_name, user_id').eq('id', quote.repairer_id).single();
          if (repairerData) {
            repairerBusinessName = repairerData.business_name || 'Non assigné';

            // Récupérer le nom du réparateur depuis la table profiles
            const {
              data: profileData
            } = await supabase.from('profiles').select('first_name, last_name').eq('id', repairerData.user_id).single();
            if (profileData) {
              repairerName = `${profileData.first_name} ${profileData.last_name}`;
            }
          }
        }
        return {
          ...quote,
          repairer_name: repairerName,
          repairer_business_name: repairerBusinessName
        };
      }));
      setQuotes(enrichedQuotes);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const loadStats = async () => {
    try {
      const {
        data: quotesData,
        error
      } = await supabase.from('quotes_with_timeline').select('status, created_at, updated_at');
      if (error) throw error;
      const total = quotesData?.length || 0;
      const pending = quotesData?.filter(q => q.status === 'pending').length || 0;
      const accepted = quotesData?.filter(q => q.status === 'accepted').length || 0;
      const rejected = quotesData?.filter(q => q.status === 'rejected').length || 0;
      const completed = quotesData?.filter(q => q.status === 'completed').length || 0;

      // Calcul du taux de conversion
      const conversionRate = total > 0 ? (accepted + completed) / total * 100 : 0;

      // Calcul du temps de réponse moyen (en heures)
      const responseTimes = quotesData?.filter(q => q.status !== 'pending').map(q => {
        const created = new Date(q.created_at);
        const updated = new Date(q.updated_at);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      }) || [];
      const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
      setStats({
        total,
        pending,
        accepted,
        rejected,
        completed,
        avgResponseTime,
        conversionRate
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };
  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const {
        error
      } = await supabase.from('quotes_with_timeline').update({
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', quoteId);
      if (error) throw error;
      toast({
        title: "Succès",
        description: `Statut du devis mis à jour: ${newStatus}`
      });
      loadQuotes();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const sendReminderToRepairer = async (quote: Quote) => {
    try {
      // Récupérer d'abord l'user_id du réparateur
      if (quote.repairer_id) {
        const { data: repairerData } = await supabase
          .from('repairer_profiles')
          .select('user_id')
          .eq('id', quote.repairer_id)
          .single();

        if (!repairerData?.user_id) {
          toast({
            title: "Erreur",
            description: "Réparateur introuvable",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.from('notifications_system').insert({
          user_id: repairerData.user_id,
          user_type: 'repairer',
          notification_type: 'quote_reminder',
          title: 'Rappel de devis en attente',
          message: `Le devis pour ${quote.device_brand} ${quote.device_model} de ${quote.client_name} attend votre réponse depuis plus de 24h.`,
          related_quote_id: quote.id,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
        if (error) throw error;
        
        toast({
          title: "Rappel envoyé",
          description: `Le réparateur ${quote.repairer_name} a été relancé`
        });
      } else {
        toast({
          title: "Erreur",
          description: "Aucun réparateur assigné à ce devis",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le rappel",
        variant: "destructive"
      });
    }
  };
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // Évolution des devis sur les 30 derniers jours
      const last30Days = Array.from({
        length: 30
      }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return format(date, 'yyyy-MM-dd');
      });
      const {
        data: evolutionData,
        error: evolutionError
      } = await supabase.from('quotes_with_timeline').select('created_at, status').gte('created_at', format(subDays(new Date(), 29), 'yyyy-MM-dd'));
      if (evolutionError) throw evolutionError;
      const evolution = last30Days.map(date => {
        const dayQuotes = evolutionData?.filter(q => format(new Date(q.created_at), 'yyyy-MM-dd') === date) || [];
        return {
          date: format(new Date(date), 'dd/MM'),
          pending: dayQuotes.filter(q => q.status === 'pending').length,
          accepted: dayQuotes.filter(q => q.status === 'accepted').length,
          rejected: dayQuotes.filter(q => q.status === 'rejected').length,
          completed: dayQuotes.filter(q => q.status === 'completed').length
        };
      });
      setQuoteEvolution(evolution);

      // Top des réparations demandées
      const {
        data: repairData,
        error: repairError
      } = await supabase.from('quotes_with_timeline').select('repair_type');
      if (repairError) throw repairError;
      const repairCounts = repairData?.reduce((acc, quote) => {
        acc[quote.repair_type] = (acc[quote.repair_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const total = Object.values(repairCounts).reduce((a, b) => a + b, 0);
      const topRepairsData = Object.entries(repairCounts).map(([repair_type, count]) => ({
        repair_type,
        count,
        percentage: count / total * 100
      })).sort((a, b) => b.count - a.count).slice(0, 8);
      setTopRepairs(topRepairsData);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };
  const getStatusBadge = (status: string, createdAt?: string) => {
    const statusConfig = {
      pending: {
        label: 'En attente',
        variant: 'secondary' as const,
        icon: Clock
      },
      accepted: {
        label: 'Accepté',
        variant: 'default' as const,
        icon: CheckCircle
      },
      rejected: {
        label: 'Refusé',
        variant: 'destructive' as const,
        icon: XCircle
      },
      completed: {
        label: 'Terminé',
        variant: 'default' as const,
        icon: CheckCircle
      },
      relaunch_needed: {
        label: 'À relancer',
        variant: 'destructive' as const,
        icon: AlertCircle
      }
    };

    // Vérifier si le devis en attente dépasse 24h
    if (status === 'pending' && createdAt) {
      const hoursElapsed = differenceInHours(new Date(), new Date(createdAt));
      if (hoursElapsed > 24) {
        const config = statusConfig.relaunch_needed;
        const Icon = config.icon;
        return <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label} ({Math.floor(hoursElapsed)}h)
          </Badge>;
      }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>;
  };
  const exportQuotes = async () => {
    try {
      const csvData = quotes.map(quote => ({
        'Date de création': format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', {
          locale: fr
        }),
        'Client': quote.client_name,
        'Email': quote.client_email,
        'Téléphone': quote.client_phone,
        'Marque': quote.device_brand,
        'Modèle': quote.device_model,
        'Type d\'appareil': quote.device_model,
        'Type de réparation': quote.repair_type,
        'Description': quote.issue_description,
        'Statut': quote.status,
        'Prix estimé': quote.estimated_price || ''
      }));
      const csv = [Object.keys(csvData[0]).join(','), ...csvData.map(row => Object.values(row).join(','))].join('\n');
      const blob = new Blob([csv], {
        type: 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devis_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Succès",
        description: "Export CSV téléchargé avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          
          
        </div>
        <Button onClick={exportQuotes} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refusés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux conversion</p>
                <p className="text-2xl font-bold text-primary">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps réponse</p>
                <p className="text-2xl font-bold text-primary">{stats.avgResponseTime.toFixed(1)}h</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des devis</TabsTrigger>
          <TabsTrigger value="analytics">Analyses avancées</TabsTrigger>
          <TabsTrigger value="evolution">Évolution des devis</TabsTrigger>
          <TabsTrigger value="repairs">Top réparations</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium">Recherche</label>
                  <Input placeholder="Client, email, marque..." value={filters.search} onChange={e => setFilters({
                  ...filters,
                  search: e.target.value
                })} />
                </div>

                <div className="min-w-[150px]">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={filters.status} onValueChange={value => setFilters({
                  ...filters,
                  status: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="accepted">Accepté</SelectItem>
                      <SelectItem value="rejected">Refusé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <label className="text-sm font-medium">Date début</label>
                  <Input type="date" value={filters.dateFrom} onChange={e => setFilters({
                  ...filters,
                  dateFrom: e.target.value
                })} />
                </div>

                <div className="min-w-[150px]">
                  <label className="text-sm font-medium">Date fin</label>
                  <Input type="date" value={filters.dateTo} onChange={e => setFilters({
                  ...filters,
                  dateTo: e.target.value
                })} />
                </div>

                <Button variant="outline" onClick={() => setFilters({
                status: 'all',
                dateFrom: '',
                dateTo: '',
                search: ''
              })}>
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des devis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Devis ({quotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div> : quotes.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  Aucun devis trouvé
                </div> : <div className="space-y-4">
                  {quotes.map(quote => {
                    const hoursElapsed = differenceInHours(new Date(), new Date(quote.created_at));
                    const needsReminder = quote.status === 'pending' && hoursElapsed > 24;
                    
                    return (
                      <div key={quote.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{quote.client_name}</h3>
                              {getStatusBadge(quote.status, quote.created_at)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {quote.client_email} • {quote.client_phone}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">{quote.device_brand} {quote.device_model}</span>
                              {' • '}
                              <span className="text-muted-foreground">{quote.repair_type}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Réparateur: <span className="font-medium text-foreground">{quote.repairer_name || 'Non assigné'}</span>
                              </p>
                              {quote.repairer_business_name && quote.repairer_business_name !== 'Non assigné' && (
                                <Badge variant="outline" className="text-xs">
                                  {quote.repairer_business_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: fr
                          })}
                            </p>
                            {quote.estimated_price && <p className="text-sm font-medium text-primary">
                                {quote.estimated_price}€
                              </p>}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                            {quote.issue_description}
                          </p>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => setSelectedQuote(quote)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {needsReminder && quote.repairer_id && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => sendReminderToRepairer(quote)}
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {quote.status === 'pending' && (
                              <>
                                <Button size="sm" variant="default" onClick={() => updateQuoteStatus(quote.id, 'accepted')}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => updateQuoteStatus(quote.id, 'rejected')}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdvancedAnalytics quotes={quotes} loading={analyticsLoading} />
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution des devis (30 derniers jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div> : <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quoteEvolution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="En attente" />
                      <Line type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={2} name="Acceptés" />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Refusés" />
                      <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} name="Terminés" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top des réparations demandées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div> : <div className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topRepairs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="repair_type" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topRepairs.map((repair, index) => <div key={repair.repair_type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{repair.repair_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {repair.count} demandes ({repair.percentage.toFixed(1)}%)
                          </p>
                        </div>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </div>)}
                  </div>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de détail */}
      {selectedQuote && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Détails du devis</span>
                <Button variant="ghost" onClick={() => setSelectedQuote(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <p>{selectedQuote.client_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <div>{getStatusBadge(selectedQuote.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedQuote.client_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p>{selectedQuote.client_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Appareil</label>
                  <p>{selectedQuote.device_brand} {selectedQuote.device_model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type de réparation</label>
                  <p>{selectedQuote.repair_type}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description du problème</label>
                <p className="mt-1 p-3 bg-muted rounded">{selectedQuote.issue_description}</p>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedQuote.status === 'pending' && <>
                    <Button className="flex-1" onClick={() => {
                updateQuoteStatus(selectedQuote.id, 'accepted');
                setSelectedQuote(null);
              }}>
                      Accepter
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => {
                updateQuoteStatus(selectedQuote.id, 'rejected');
                setSelectedQuote(null);
              }}>
                      Refuser
                    </Button>
                  </>}
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
};
export default QuotesManagement;