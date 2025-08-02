import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
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
  MapPin,
  Edit,
  UserPlus,
  Users,
  Crown
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
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [availableRepairers, setAvailableRepairers] = useState<any[]>([]);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [selectedRepairer, setSelectedRepairer] = useState<string>('');
  
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

  const loadAvailableRepairers = async () => {
    try {
      // First get all repairer profiles
      const { data: repairerProfiles, error: profilesError } = await supabase
        .from('repairer_profiles')
        .select('id, business_name, city, address, postal_code, phone, user_id');

      if (profilesError) {
        console.error('Erreur chargement profils réparateurs:', profilesError);
        return;
      }

      if (!repairerProfiles || repairerProfiles.length === 0) {
        setAvailableRepairers([]);
        return;
      }

      // Get user profiles and subscriptions for each repairer
      const repairersWithData = await Promise.all(
        repairerProfiles.map(async (rep) => {
          try {
            // Get user profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', rep.user_id)
              .single();

            // Get subscription info
            const { data: subscriptionData } = await supabase
              .from('repairer_subscriptions')
              .select('subscription_tier, subscribed')
              .eq('user_id', rep.user_id)
              .eq('subscribed', true)
              .maybeSingle();

            // Skip if no profile data
            if (!profileData) return null;

            // Use subscription data or default to free
            const subscription_tier = subscriptionData?.subscription_tier || 'free';
            const isPaid = ['basic', 'premium', 'enterprise'].includes(subscription_tier);

            return {
              id: rep.id,
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
              business_name: rep.business_name,
              city: rep.city,
              address: rep.address,
              postal_code: rep.postal_code,
              phone: rep.phone,
              email: profileData.email,
              subscription_tier,
              isPaid
            };
          } catch (error) {
            console.error(`Erreur pour le réparateur ${rep.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results and update state
      const validRepairers = repairersWithData.filter(Boolean);
      setAvailableRepairers(validRepairers);
      
      console.log('Réparateurs chargés:', validRepairers);
    } catch (error) {
      console.error('Erreur lors du chargement des réparateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réparateurs",
        variant: "destructive",
      });
    }
  };

  // Helper function pour obtenir le nom du département - définie avant utilisation
  const getDepartmentName = (code: string): string => {
    const departments: Record<string, string> = {
      '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
      '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
      '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
      '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
      '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor',
      '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
      '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
      '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
      '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
      '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
      '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
      '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
      '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
      '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
      '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
      '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
      '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
      '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
      '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
      '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
      '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
      '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
      '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
      '95': 'Val-d\'Oise'
    };
    return departments[code] || 'Département inconnu';
  };

  // Grouper les réparateurs par département et ville - optimisé avec useMemo
  const groupedRepairers = React.useMemo(() => {
    return availableRepairers.reduce((acc, repairer) => {
      const department = repairer.postal_code ? repairer.postal_code.substring(0, 2) : '00';
      const departmentName = getDepartmentName(department);
      const key = `${department} - ${departmentName}`;
      const city = repairer.city || 'Ville inconnue';
      
      if (!acc[key]) {
        acc[key] = {};
      }
      if (!acc[key][city]) {
        acc[key][city] = [];
      }
      
      acc[key][city].push(repairer);
      return acc;
    }, {} as Record<string, Record<string, typeof availableRepairers>>);
  }, [availableRepairers]);

  const assignRepairer = async () => {
    if (!selectedQuote || !selectedRepairer) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un réparateur",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mettre à jour le devis
      const { error: updateError } = await supabase
        .from('quotes_with_timeline')
        .update({
          repairer_id: selectedRepairer,
          assignment_status: 'admin_assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuote.id);

      if (updateError) throw updateError;

      // Enregistrer l'assignation dans la table admin_quote_assignments
      const { error: assignError } = await supabase
        .from('admin_quote_assignments')
        .upsert({
          quote_id: selectedQuote.id,
          target_repairer_id: selectedRepairer,
          status: 'assigned',
          notes: assignmentNote,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString()
        });

      if (assignError) throw assignError;

      toast({
        title: "Succès",
        description: "Réparateur assigné avec succès"
      });

      setShowAssignmentModal(false);
      setSelectedRepairer('');
      setAssignmentNote('');
      setSelectedQuote(null);
      loadQuotes();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le réparateur",
        variant: "destructive"
      });
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
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Informations réparateur</h3>
                  {selectedQuote.repairer_id ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        loadAvailableRepairers();
                        setShowAssignmentModal(true);
                      }}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Réassigner
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        loadAvailableRepairers();
                        setShowAssignmentModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assigner
                    </Button>
                  )}
                </div>

                {selectedQuote.repairer_id ? (
                  <div className="border rounded-lg p-4">
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
                ) : (
                  <div className="border rounded-lg p-4 border-orange-200 bg-orange-50">
                    <p className="text-sm text-orange-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Aucun réparateur assigné
                    </p>
                  </div>
                )}
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

      {/* Modal d'assignation de réparateur */}
      <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedQuote?.repairer_id ? 'Réassigner' : 'Assigner'} un réparateur
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Sélection du réparateur par département */}
            <div>
              <label className="text-sm font-medium">Sélectionner un réparateur</label>
              <Select value={selectedRepairer} onValueChange={setSelectedRepairer}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un réparateur par département..." />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {Object.entries(groupedRepairers).map(([department, cities]) => (
                    <div key={department}>
                      <SelectGroup>
                        <SelectLabel className="font-semibold text-primary">
                          {department}
                        </SelectLabel>
                        {Object.entries(cities).map(([city, repairers]) =>
                          repairers.map((repairer) => {
                            const isPaid = repairer.isPaid;
                            
                            return (
                              <SelectItem 
                                key={repairer.id} 
                                value={repairer.id}
                                className="py-3"
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{repairer.name}</span>
                                      {isPaid && (
                                        <Crown className="h-3 w-3 text-yellow-500" />
                                      )}
                                    </div>
                                    {repairer.business_name && (
                                      <div className="text-xs text-muted-foreground">
                                        {repairer.business_name}
                                      </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                      {city} ({repairer.postal_code})
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    repairer.subscription_tier === 'free' 
                                      ? 'bg-gray-100 text-gray-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {repairer.subscription_tier === 'free' ? 'Gratuit' :
                                     repairer.subscription_tier === 'basic' ? 'Basic' :
                                     repairer.subscription_tier === 'premium' ? 'Premium' :
                                     repairer.subscription_tier === 'enterprise' ? 'Enterprise' :
                                     repairer.subscription_tier}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectGroup>
                      <SelectSeparator />
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Détails du réparateur sélectionné */}
            {selectedRepairer && (() => {
              const repairer = availableRepairers.find(r => r.id === selectedRepairer);
              if (!repairer) return null;
              
              const isPaid = repairer.isPaid;
              
              return (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Réparateur sélectionné
                    {isPaid && <Crown className="h-4 w-4 text-yellow-500" />}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom :</strong> {repairer.name}</p>
                    {repairer.business_name && (
                      <p><strong>Entreprise :</strong> {repairer.business_name}</p>
                    )}
                    <p><strong>Adresse :</strong> {repairer.address}, {repairer.city} {repairer.postal_code}</p>
                    {repairer.email && (
                      <p><strong>Email :</strong> {repairer.email}</p>
                    )}
                    {repairer.phone && (
                      <p><strong>Téléphone :</strong> {repairer.phone}</p>
                    )}
                    <p>
                      <strong>Abonnement :</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        repairer.subscription_tier === 'free' 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {repairer.subscription_tier === 'free' ? 'Gratuit' :
                         repairer.subscription_tier === 'basic' ? 'Basic' :
                         repairer.subscription_tier === 'premium' ? 'Premium' :
                         repairer.subscription_tier === 'enterprise' ? 'Enterprise' :
                         repairer.subscription_tier}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="text-sm font-medium">Note d'assignation (optionnel)</label>
              <Textarea
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                placeholder="Ajouter une note sur cette assignation..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedRepairer('');
                  setAssignmentNote('');
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={assignRepairer}
                disabled={!selectedRepairer}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {selectedQuote?.repairer_id ? 'Réassigner' : 'Assigner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RealTimeQuotesManager;