import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Send, 
  Mail, 
  MessageSquare, 
  Phone,
  TrendingUp,
  RefreshCw,
  UserCheck,
  Calendar,
  MapPin
} from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  repairer_email?: string;
  repairer_phone?: string;
  repairer_city?: string;
  urgency_level?: 'low' | 'medium' | 'high' | 'critical';
}

interface QuoteStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
  overdue: number;
  avgResponseTime: number;
  conversionRate: number;
  todayQuotes: number;
}

interface CommunicationTemplate {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  target: 'client' | 'repairer';
  subject: string;
  content: string;
  isDefault: boolean;
}

const RealTimeQuotesManager: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
    overdue: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    todayQuotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [communicationModal, setCommunicationModal] = useState<{
    open: boolean;
    quote: Quote | null;
    type: 'email' | 'sms' | 'whatsapp';
    target: 'client' | 'repairer';
  }>({
    open: false,
    quote: null,
    type: 'email',
    target: 'client'
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  const { toast } = useToast();

  // Mise en place du temps réel
  useEffect(() => {
    if (!realTimeEnabled) return;

    const channel = supabase
      .channel('quotes-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'quotes_with_timeline' 
        },
        (payload) => {
          console.log('Changement de devis détecté:', payload);
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realTimeEnabled]);

  const handleRealtimeChange = useCallback((payload: any) => {
    const { eventType, new: newRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        toast({
          title: "🔔 Nouveau devis reçu",
          description: `Devis pour ${newRecord.device_brand} ${newRecord.device_model} de ${newRecord.client_name}`,
        });
        loadQuotes();
        loadStats();
        break;
      case 'UPDATE':
        toast({
          title: "📝 Statut de devis modifié",
          description: `Le devis de ${newRecord.client_name} a été mis à jour`,
        });
        loadQuotes();
        loadStats();
        break;
      case 'DELETE':
        toast({
          title: "🗑️ Devis supprimé",
          description: "Un devis a été supprimé du système",
        });
        loadQuotes();
        loadStats();
        break;
    }
  }, [toast]);

  useEffect(() => {
    loadQuotes();
    loadStats();
    loadTemplates();
    
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      if (realTimeEnabled) {
        loadQuotes();
        loadStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [filters, realTimeEnabled]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quotes_with_timeline')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%,device_brand.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrichir les données avec les noms des réparateurs
      const enrichedQuotes = await Promise.all((data || []).map(async quote => {
        let repairerName = 'Non assigné';
        let repairerBusinessName = 'Non assigné';
        let repairerEmail = '';
        let repairerPhone = '';
        let repairerCity = '';

        if (quote.repairer_id) {
          const { data: repairerData } = await supabase
            .from('repairer_profiles')
            .select('business_name, user_id, city, phone')
            .eq('id', quote.repairer_id)
            .single();

          if (repairerData) {
            repairerBusinessName = repairerData.business_name || 'Non assigné';
            repairerPhone = repairerData.phone || '';
            repairerCity = repairerData.city || '';

            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', repairerData.user_id)
              .single();

            if (profileData) {
              repairerName = `${profileData.first_name} ${profileData.last_name}`;
              repairerEmail = profileData.email;
            }
          }
        }

        return {
          ...quote,
          repairer_name: repairerName,
          repairer_business_name: repairerBusinessName,
          repairer_email: repairerEmail,
          repairer_phone: repairerPhone,
          repairer_city: repairerCity,
          urgency_level: calculateUrgencyLevel(quote.created_at, quote.status)
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
      const { data: quotesData, error } = await supabase
        .from('quotes_with_timeline')
        .select('status, created_at, updated_at');

      if (error) throw error;

      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      
      const total = quotesData?.length || 0;
      const pending = quotesData?.filter(q => q.status === 'pending').length || 0;
      const accepted = quotesData?.filter(q => q.status === 'accepted').length || 0;
      const rejected = quotesData?.filter(q => q.status === 'rejected').length || 0;
      const completed = quotesData?.filter(q => q.status === 'completed').length || 0;
      const todayQuotes = quotesData?.filter(q => 
        format(new Date(q.created_at), 'yyyy-MM-dd') === today
      ).length || 0;
      
      // Devis en retard (plus de 24h en attente)
      const overdue = quotesData?.filter(q => 
        q.status === 'pending' && 
        differenceInHours(now, new Date(q.created_at)) > 24
      ).length || 0;

      const conversionRate = total > 0 ? ((accepted + completed) / total) * 100 : 0;
      
      const responseTimes = quotesData?.filter(q => q.status !== 'pending').map(q => {
        const created = new Date(q.created_at);
        const updated = new Date(q.updated_at);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      }) || [];
      
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      setStats({
        total,
        pending,
        accepted,
        rejected,
        completed,
        overdue,
        avgResponseTime,
        conversionRate,
        todayQuotes
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadTemplates = async () => {
    // Templates par défaut
    const defaultTemplates: CommunicationTemplate[] = [
      {
        id: '1',
        type: 'email',
        target: 'client',
        subject: 'Votre demande de devis - Mise à jour',
        content: 'Bonjour {client_name},\n\nNous avons bien reçu votre demande de devis pour la réparation de votre {device_brand} {device_model}.\n\nNotre équipe examine votre demande et vous contactera sous 24h.\n\nCordialement,\nL\'équipe iRepairWorld',
        isDefault: true
      },
      {
        id: '2',
        type: 'email',
        target: 'repairer',
        subject: 'Nouvelle demande de devis - Action requise',
        content: 'Bonjour {repairer_name},\n\nUne nouvelle demande de devis vous a été assignée :\n\n- Client : {client_name}\n- Appareil : {device_brand} {device_model}\n- Type de réparation : {repair_type}\n- Description : {issue_description}\n\nMerci de traiter cette demande dans les plus brefs délais.',
        isDefault: true
      },
      {
        id: '3',
        type: 'sms',
        target: 'client',
        subject: '',
        content: 'iRepairWorld: Votre devis pour {device_brand} {device_model} est en cours de traitement. Réponse sous 24h.',
        isDefault: true
      },
      {
        id: '4',
        type: 'sms',
        target: 'repairer',
        subject: '',
        content: 'Nouveau devis assigné: {device_brand} {device_model} pour {client_name}. Consultez votre dashboard.',
        isDefault: true
      }
    ];
    
    setTemplates(defaultTemplates);
  };

  const calculateUrgencyLevel = (createdAt: string, status: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (status !== 'pending') return 'low';
    
    const hours = differenceInHours(new Date(), new Date(createdAt));
    
    if (hours > 48) return 'critical';
    if (hours > 24) return 'high';
    if (hours > 12) return 'medium';
    return 'low';
  };

  const getUrgencyBadge = (urgency: 'low' | 'medium' | 'high' | 'critical') => {
    const config = {
      low: { label: 'Normale', className: 'bg-green-100 text-green-800' },
      medium: { label: 'Modérée', className: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Élevée', className: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Critique', className: 'bg-red-100 text-red-800' }
    };
    
    const { label, className } = config[urgency];
    return <Badge className={className}>{label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      accepted: { label: 'Accepté', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'Terminé', variant: 'default' as const, icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const sendCommunication = async () => {
    if (!communicationModal.quote || !customMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Message requis",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remplacer les variables dans le message
      let message = customMessage;
      const quote = communicationModal.quote;
      
      message = message
        .replace(/{client_name}/g, quote.client_name || '')
        .replace(/{repairer_name}/g, quote.repairer_name || '')
        .replace(/{device_brand}/g, quote.device_brand || '')
        .replace(/{device_model}/g, quote.device_model || '')
        .replace(/{repair_type}/g, quote.repair_type || '')
        .replace(/{issue_description}/g, quote.issue_description || '');

      // Envoyer la communication via Supabase Edge Function
      const { error } = await supabase.functions.invoke('send-communication', {
        body: {
          type: communicationModal.type,
          target: communicationModal.target,
          message,
          quoteId: quote.id,
          recipient: communicationModal.target === 'client' 
            ? { email: quote.client_email, phone: quote.client_phone }
            : { email: quote.repairer_email, phone: quote.repairer_phone }
        }
      });
      
      if (error) throw error;

      toast({
        title: "Communication envoyée",
        description: `${communicationModal.type.toUpperCase()} envoyé à ${communicationModal.target === 'client' ? quote.client_name : quote.repairer_name}`,
      });

      setCommunicationModal({ open: false, quote: null, type: 'email', target: 'client' });
      setCustomMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la communication",
        variant: "destructive"
      });
    }
  };

  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotes_with_timeline')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

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

  const openCommunicationModal = (quote: Quote, type: 'email' | 'sms' | 'whatsapp', target: 'client' | 'repairer') => {
    setCommunicationModal({ open: true, quote, type, target });
    
    // Trouver et appliquer le template par défaut
    const defaultTemplate = templates.find(t => 
      t.type === type && t.target === target && t.isDefault
    );
    
    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate.id);
      setCustomMessage(defaultTemplate.content);
    } else {
      setCustomMessage('');
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.content);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gestion des Devis en Temps Réel</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-muted-foreground">
              {realTimeEnabled ? 'Temps réel activé' : 'Temps réel désactivé'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {realTimeEnabled ? 'Désactiver' : 'Activer'} temps réel
          </Button>
          <Button
            variant="outline"
            onClick={() => { loadQuotes(); loadStats(); }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayQuotes}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
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
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Recherche</label>
              <Input 
                placeholder="Client, email, marque..." 
                value={filters.search} 
                onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
              />
            </div>

            <div className="min-w-[150px]">
              <label className="text-sm font-medium">Statut</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
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
              <Input 
                type="date" 
                value={filters.dateFrom} 
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} 
              />
            </div>

            <div className="min-w-[150px]">
              <label className="text-sm font-medium">Date fin</label>
              <Input 
                type="date" 
                value={filters.dateTo} 
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} 
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => setFilters({
                status: 'all',
                search: '',
                dateFrom: '',
                dateTo: ''
              })}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des devis avec actions de communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Devis ({quotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun devis trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => {
                const hoursElapsed = differenceInHours(new Date(), new Date(quote.created_at));
                const needsAttention = quote.status === 'pending' && hoursElapsed > 24;
                
                return (
                  <div 
                    key={quote.id} 
                    className={`border rounded-lg p-4 transition-colors ${
                      needsAttention ? 'border-red-200 bg-red-50' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{quote.client_name}</h3>
                          {getStatusBadge(quote.status)}
                          {getUrgencyBadge(quote.urgency_level!)}
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
                            Réparateur: <span className="font-medium text-foreground">{quote.repairer_name}</span>
                          </p>
                          {quote.repairer_business_name && quote.repairer_business_name !== 'Non assigné' && (
                            <Badge variant="outline" className="text-xs">
                              {quote.repairer_business_name}
                            </Badge>
                          )}
                          {quote.repairer_city && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {quote.repairer_city}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                        {quote.estimated_price && (
                          <p className="text-sm font-medium text-primary">
                            {quote.estimated_price}€
                          </p>
                        )}
                        {needsAttention && (
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ En retard ({Math.floor(hoursElapsed)}h)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {quote.issue_description}
                      </p>
                      
                      <div className="flex gap-2 ml-4">
                        {/* Actions de communication client */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCommunicationModal(quote, 'email', 'client')}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="Envoyer email au client"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCommunicationModal(quote, 'sms', 'client')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Envoyer SMS au client"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCommunicationModal(quote, 'whatsapp', 'client')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Envoyer WhatsApp au client"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Actions de communication réparateur */}
                        {quote.repairer_id && (
                          <div className="flex gap-1 border-l pl-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openCommunicationModal(quote, 'email', 'repairer')}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                              title="Envoyer email au réparateur"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openCommunicationModal(quote, 'sms', 'repairer')}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                              title="Envoyer SMS au réparateur"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* Actions standards */}
                        <div className="flex gap-1 border-l pl-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {quote.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default" 
                                onClick={() => updateQuoteStatus(quote.id, 'accepted')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de communication */}
      <Dialog 
        open={communicationModal.open} 
        onOpenChange={(open) => setCommunicationModal({ ...communicationModal, open })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Envoyer {communicationModal.type.toUpperCase()} à{' '}
              {communicationModal.target === 'client' 
                ? communicationModal.quote?.client_name 
                : communicationModal.quote?.repairer_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template</label>
              <Select value={selectedTemplate} onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates
                    .filter(t => t.type === communicationModal.type && t.target === communicationModal.target)
                    .map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.isDefault ? '⭐ ' : ''}{template.subject || `Template ${template.type}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Votre message..."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variables disponibles: {'{client_name}'}, {'{repairer_name}'}, {'{device_brand}'}, {'{device_model}'}, {'{repair_type}'}, {'{issue_description}'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCommunicationModal({ ...communicationModal, open: false })}
              >
                Annuler
              </Button>
              <Button onClick={sendCommunication}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer {communicationModal.type.toUpperCase()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de détail du devis */}
      {selectedQuote && (
        <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du devis - {selectedQuote.client_name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations client</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom</label>
                    <p>{selectedQuote.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedQuote.client_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <p>{selectedQuote.client_phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations réparateur</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom</label>
                    <p>{selectedQuote.repairer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
                    <p>{selectedQuote.repairer_business_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedQuote.repairer_email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ville</label>
                    <p>{selectedQuote.repairer_city || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold text-lg">Détails de la réparation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Appareil</label>
                    <p>{selectedQuote.device_brand} {selectedQuote.device_model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type de réparation</label>
                    <p>{selectedQuote.repair_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Statut</label>
                    <div>{getStatusBadge(selectedQuote.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Urgence</label>
                    <div>{getUrgencyBadge(selectedQuote.urgency_level!)}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description du problème</label>
                  <p className="mt-1 p-3 bg-muted rounded">{selectedQuote.issue_description}</p>
                </div>

                {selectedQuote.estimated_price && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prix estimé</label>
                    <p className="text-lg font-semibold text-primary">{selectedQuote.estimated_price}€</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RealTimeQuotesManager;