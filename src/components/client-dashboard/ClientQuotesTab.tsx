import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, Eye, MessageSquare, Search } from 'lucide-react';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';
import { QuoteDetailModal } from '@/components/quote/QuoteDetailModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Quote {
  id: string;
  status: string;
  device_brand: string;
  device_model: string;
  issue_description: string;
  issue_type: string;
  estimated_price?: number;
  estimated_duration?: string;
  repairer_notes?: string;
  repairer_id: string;
  repairer_name?: string;
  created_at: string;
}

export const ClientQuotesTab: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadQuotes();
    }
  }, [user]);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      accepted: { label: 'Accepté', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <EnhancedEmptyState
        icon={FileText}
        title="Aucun devis pour le moment"
        description="Commencez par rechercher un réparateur et demandez votre premier devis gratuit"
        primaryAction={{
          label: 'Rechercher un réparateur',
          onClick: () => navigate('/search'),
          icon: Search
        }}
        suggestions={[
          'Les devis sont gratuits et sans engagement',
          'Comparez plusieurs réparateurs pour le meilleur prix',
          'Recevez une réponse en moins de 24h'
        ]}
      />
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {quote.device_brand} - {quote.device_model}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Demande de devis
                </p>
              </div>
              {getStatusBadge(quote.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {quote.issue_description}
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Demandé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedQuote(quote)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir détails
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onAccept={(quoteId) => {
            setQuotes(quotes.map(q => 
              q.id === quoteId ? { ...q, status: 'accepted' } : q
            ));
          }}
          onReject={(quoteId) => {
            setQuotes(quotes.map(q => 
              q.id === quoteId ? { ...q, status: 'rejected' } : q
            ));
          }}
        />
      )}
    </div>
  );
};
