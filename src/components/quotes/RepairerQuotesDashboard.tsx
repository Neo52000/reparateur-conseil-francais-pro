import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Smartphone,
  User,
  Calendar,
  Euro
} from 'lucide-react';
import { QuoteResponseForm } from './QuoteResponseForm';

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
  repairer_response_deadline: string;
  estimated_price: number;
  quoted_at: string;
  accepted_at: string;
  rejected_at: string;
}

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, color: 'bg-yellow-500' },
  quoted: { label: 'Devis envoyé', icon: CheckCircle, color: 'bg-blue-500' },
  accepted: { label: 'Accepté', icon: CheckCircle, color: 'bg-green-500' },
  rejected: { label: 'Refusé', icon: XCircle, color: 'bg-red-500' },
  expired: { label: 'Expiré', icon: AlertCircle, color: 'bg-gray-500' }
};

export const RepairerQuotesDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  const fetchQuotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining <= 6 && hoursRemaining > 0;
  };

  const isDeadlinePassed = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return now > deadlineDate;
  };

  const formatTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursRemaining = Math.max(0, (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursRemaining < 1) {
      const minutesRemaining = Math.max(0, (deadlineDate.getTime() - now.getTime()) / (1000 * 60));
      return `${Math.floor(minutesRemaining)}min restantes`;
    }
    
    return `${Math.floor(hoursRemaining)}h restantes`;
  };

  const handleResponseSuccess = () => {
    setShowResponseForm(false);
    setSelectedQuote(null);
    fetchQuotes();
  };

  const filterQuotesByStatus = (status: string) => {
    return quotes.filter(quote => {
      if (status === 'all') return true;
      if (status === 'urgent') {
        return quote.status === 'pending' && (isDeadlineNear(quote.repairer_response_deadline) || isDeadlinePassed(quote.repairer_response_deadline));
      }
      return quote.status === status;
    });
  };

  const getQuoteStats = () => {
    const pending = quotes.filter(q => q.status === 'pending').length;
    const quoted = quotes.filter(q => q.status === 'quoted').length;
    const accepted = quotes.filter(q => q.status === 'accepted').length;
    const urgent = quotes.filter(q => 
      q.status === 'pending' && isDeadlineNear(q.repairer_response_deadline)
    ).length;

    return { pending, quoted, accepted, urgent };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (showResponseForm && selectedQuote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowResponseForm(false)}>
            ← Retour
          </Button>
          <h2 className="text-2xl font-bold">Répondre au devis</h2>
        </div>
        <QuoteResponseForm 
          quote={selectedQuote} 
          onSuccess={handleResponseSuccess}
        />
      </div>
    );
  }

  const stats = getQuoteStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Devis</h1>
        <div className="text-sm text-muted-foreground">
          {quotes.length} demandes au total
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Urgents</p>
                <p className="text-2xl font-bold">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Devis envoyés</p>
                <p className="text-2xl font-bold">{stats.quoted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Acceptés</p>
                <p className="text-2xl font-bold">{stats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres par onglets */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tous ({quotes.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
          <TabsTrigger value="urgent">Urgents ({stats.urgent})</TabsTrigger>
          <TabsTrigger value="quoted">Devis envoyés ({stats.quoted})</TabsTrigger>
          <TabsTrigger value="accepted">Acceptés ({stats.accepted})</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'urgent', 'quoted', 'accepted'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterQuotesByStatus(status).map(quote => (
              <Card key={quote.id} className={`transition-all ${
                quote.status === 'pending' && isDeadlinePassed(quote.repairer_response_deadline) 
                  ? 'border-red-200 bg-red-50' 
                  : quote.status === 'pending' && isDeadlineNear(quote.repairer_response_deadline)
                  ? 'border-orange-200 bg-orange-50'
                  : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">
                          {quote.device_brand} {quote.device_model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {quote.repair_type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>{quote.client_name || 'Client anonyme'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Demandé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {quote.status === 'pending' && (
                        <div className={`flex items-center gap-2 text-sm ${
                          isDeadlinePassed(quote.repairer_response_deadline) ? 'text-red-600' :
                          isDeadlineNear(quote.repairer_response_deadline) ? 'text-orange-600' : ''
                        }`}>
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            {isDeadlinePassed(quote.repairer_response_deadline) 
                              ? 'Délai dépassé !' 
                              : formatTimeRemaining(quote.repairer_response_deadline)
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {quote.estimated_price && (
                        <div className="flex items-center gap-2 text-sm">
                          <Euro className="h-4 w-4" />
                          <span>Devis: {quote.estimated_price}€</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Description du problème:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {quote.issue_description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {quote.status === 'pending' && (
                      <Button 
                        onClick={() => {
                          setSelectedQuote(quote);
                          setShowResponseForm(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Répondre au devis
                      </Button>
                    )}
                    {quote.status === 'accepted' && (
                      <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Planifier RDV
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterQuotesByStatus(status).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Aucun devis dans cette catégorie</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};