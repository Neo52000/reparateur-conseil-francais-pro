import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, Eye, Send } from 'lucide-react';
import { EnhancedEmptyState } from '@/components/shared/EnhancedEmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { enhancedToast } from '@/lib/utils/enhancedToast';

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
  contact_email: string;
  contact_phone: string;
  user_id: string;
  created_at: string;
}

export const RepairerQuotesTab: React.FC = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadQuotes();
    }
  }, [user]);

  const loadQuotes = async () => {
    try {
      // TODO: Replace with actual repairer_id lookup
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      enhancedToast.error({
        title: 'Erreur',
        description: 'Impossible de charger les demandes de devis'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (quoteId: string) => {
    setRespondingTo(quoteId);
    // TODO: Open response modal or navigate to response form
    setTimeout(() => setRespondingTo(null), 1000);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'À traiter', variant: 'secondary' as const, icon: Clock },
      responded: { label: 'Répondu', variant: 'default' as const, icon: Send },
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <EnhancedEmptyState
        icon={FileText}
        title="Aucune demande de devis"
        description="Les demandes de devis de vos clients apparaîtront ici"
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
                  {quote.issue_type}
                </p>
              </div>
              {getStatusBadge(quote.status)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Description du problème</h4>
              <p className="text-sm text-muted-foreground">{quote.issue_description}</p>
            </div>

            {quote.repairer_notes && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Notes internes</h4>
                <p className="text-sm text-muted-foreground">{quote.repairer_notes}</p>
              </div>
            )}

            {quote.estimated_price && (
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-semibold">Prix estimé:</span>
                  <span className="ml-2 text-primary font-bold">{quote.estimated_price}€</span>
                </div>
                {quote.estimated_duration && (
                  <div>
                    <span className="font-semibold">Durée:</span>
                    <span className="ml-2">{quote.estimated_duration}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {quote.status === 'pending' && (
                <Button 
                  onClick={() => handleRespond(quote.id)}
                  disabled={respondingTo === quote.id}
                  className="flex-1"
                >
                  {respondingTo === quote.id ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Réponse en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Répondre
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Détails
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
