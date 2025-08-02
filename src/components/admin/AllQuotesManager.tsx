import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, Smartphone, Search, Eye, Filter } from 'lucide-react';

interface Quote {
  id: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  created_at: string;
  client_name: string;
  client_email: string;
  repairer_business_name?: string;
  assignment_status: string;
  admin_assigned_at?: string;
  subscription_tier?: string;
}

const AllQuotesManager: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');

  useEffect(() => {
    fetchAllQuotes();
  }, []);

  const fetchAllQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select(`
          id,
          device_type,
          device_brand,
          device_model,
          repair_type,
          issue_description,
          created_at,
          assignment_status,
          admin_assigned_at,
          repairer_id,
          client_id,
          profiles!quotes_with_timeline_client_id_fkey (
            first_name,
            last_name,
            email
          ),
          repairer_profiles (
            business_name,
            user_id,
            repairer_subscriptions!inner (
              subscription_tier
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuotes = data?.map((quote: any) => ({
        id: quote.id,
        device_type: quote.device_type,
        device_brand: quote.device_brand,
        device_model: quote.device_model,
        repair_type: quote.repair_type,
        issue_description: quote.issue_description,
        created_at: quote.created_at,
        client_name: `${quote.profiles?.first_name || ''} ${quote.profiles?.last_name || ''}`.trim(),
        client_email: quote.profiles?.email || '',
        repairer_business_name: quote.repairer_profiles?.business_name,
        assignment_status: quote.assignment_status || 'unassigned',
        admin_assigned_at: quote.admin_assigned_at,
        subscription_tier: quote.repairer_profiles?.repairer_subscriptions?.subscription_tier,
      })) || [];

      setQuotes(formattedQuotes);
    } catch (error: any) {
      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'auto_assigned':
        return <Badge className="bg-green-100 text-green-800">Attribution automatique</Badge>;
      case 'admin_assigned':
        return <Badge className="bg-blue-100 text-blue-800">Attribution manuelle</Badge>;
      case 'pending_admin_assignment':
        return <Badge className="bg-orange-100 text-orange-800">En attente admin</Badge>;
      default:
        return <Badge variant="outline">Non attribué</Badge>;
    }
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    
    const colors = {
      enterprise: 'bg-yellow-100 text-yellow-800',
      premium: 'bg-purple-100 text-purple-800', 
      basic: 'bg-blue-100 text-blue-800',
      free: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[tier as keyof typeof colors] || colors.free}>
        {tier}
      </Badge>
    );
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.device_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.device_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.repairer_business_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quote.assignment_status === statusFilter;
    const matchesSubscription = subscriptionFilter === 'all' || quote.subscription_tier === subscriptionFilter;

    return matchesSearch && matchesStatus && matchesSubscription;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Chargement des devis...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6" />
          Tous les devis ({quotes.length})
        </h2>
        <Button onClick={fetchAllQuotes} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Client, appareil, réparateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Statut d'attribution</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="auto_assigned">Attribution automatique</SelectItem>
                  <SelectItem value="admin_assigned">Attribution manuelle</SelectItem>
                  <SelectItem value="pending_admin_assignment">En attente admin</SelectItem>
                  <SelectItem value="unassigned">Non attribué</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Type d'abonnement</label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les abonnements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les abonnements</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSubscriptionFilter('all');
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des devis */}
      <div className="grid gap-4">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Aucun devis trouvé avec les filtres appliqués.</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 items-start">
                  {/* Informations du devis */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      {quote.device_brand} {quote.device_model}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Type :</span> {quote.device_type}</p>
                      <p><span className="font-medium">Réparation :</span> {quote.repair_type}</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Informations du client */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{quote.client_name || 'Non renseigné'}</p>
                      <p>{quote.client_email}</p>
                    </div>
                  </div>

                  {/* Attribution */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Attribution</h4>
                    <div className="space-y-2">
                      {getStatusBadge(quote.assignment_status)}
                      {quote.repairer_business_name ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {quote.repairer_business_name}
                          </p>
                          <div className="flex gap-1">
                            {getTierBadge(quote.subscription_tier)}
                          </div>
                          {quote.admin_assigned_at && (
                            <p className="text-xs text-gray-500">
                              Attribution manuelle le {new Date(quote.admin_assigned_at).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Aucun réparateur attribué</p>
                      )}
                    </div>
                  </div>

                  {/* Problème */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Problème</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {quote.issue_description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AllQuotesManager;