import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Euro,
  Send,
  Filter,
  Search,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  client_id: string;
  device_type?: string;
  device_brand?: string;
  device_model?: string;
  repair_type?: string;
  issue_description?: string;
  urgency_level?: string;
  budget_range?: string;
  contact_preference?: string;
  status: string;
  created_at: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  estimated_price?: number;
  estimated_duration?: string;
  warranty_duration?: string;
  response_message?: string;
}

interface QuoteResponse {
  estimated_price: number;
  estimated_duration: string;
  warranty_duration: string;
  response_message: string;
}

const QuoteRequestsTabSection: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [responseData, setResponseData] = useState<QuoteResponse>({
    estimated_price: 0,
    estimated_duration: '',
    warranty_duration: '3',
    response_message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuoteRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data?.map(request => ({
        ...request,
        client_name: request.client_name || 'Client inconnu',
        device_type: 'Smartphone', // Valeur par défaut
        device_brand: request.device_brand || 'Non spécifié',
        device_model: request.device_model || 'Non spécifié',
        repair_type: request.repair_type || 'Non spécifié',
        issue_description: request.issue_description || 'Aucune description',
        urgency_level: 'medium', // Valeur par défaut
        budget_range: 'Non spécifié', // Valeur par défaut
        contact_preference: 'email' // Valeur par défaut
      })) || [];

      setQuoteRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de devis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuoteRequests();
  }, [user]);

  const handleStatusUpdate = async (requestId: string, newStatus: string, response?: QuoteResponse) => {
    try {
      setSubmitting(true);

      const updateData: any = { status: newStatus };
      
      if (response && newStatus === 'accepted') {
        updateData.estimated_price = response.estimated_price;
        updateData.estimated_duration = response.estimated_duration;
        updateData.warranty_duration = `${response.warranty_duration} mois`;
        updateData.response_message = response.response_message;
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('quotes_with_timeline')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      await fetchQuoteRequests();
      setSelectedRequest(null);
      
      toast({
        title: "Succès",
        description: `Demande de devis ${newStatus === 'accepted' ? 'acceptée' : 'refusée'} avec succès`
      });
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      accepted: { label: 'Accepté', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'Terminé', variant: 'outline' as const, icon: CheckCircle }
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

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      low: { label: 'Faible', variant: 'outline' as const },
      medium: { label: 'Moyenne', variant: 'secondary' as const },
      high: { label: 'Élevée', variant: 'destructive' as const }
    };

    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.medium;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredRequests = quoteRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = searchTerm === '' || 
      request.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.repair_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: quoteRequests.length,
    pending: quoteRequests.filter(q => q.status === 'pending').length,
    accepted: quoteRequests.filter(q => q.status === 'accepted').length,
    rejected: quoteRequests.filter(q => q.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refusés</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les devis</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accepted">Acceptés</SelectItem>
                  <SelectItem value="rejected">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Rechercher par client, appareil, marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Button onClick={fetchQuoteRequests} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes de devis */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune demande de devis</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "Vous n'avez pas encore reçu de demandes de devis."
                  : `Aucune demande de devis ${filter === 'pending' ? 'en attente' : filter === 'accepted' ? 'acceptée' : 'refusée'}.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-lg">{request.client_name}</h3>
                       {getStatusBadge(request.status)}
                     </div>
                    
                     <div className="text-sm text-muted-foreground space-y-1">
                       <p><strong>Appareil:</strong> {request.device_brand} {request.device_model}</p>
                       <p><strong>Réparation:</strong> {request.repair_type}</p>
                       <p><strong>Description:</strong> {request.issue_description}</p>
                     </div>
                    
                    
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {request.client_email && (
                        <span>📧 {request.client_email}</span>
                      )}
                      {request.client_phone && (
                        <span>📞 {request.client_phone}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => setSelectedRequest(request)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accepter
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Accepter la demande de devis</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Prix estimé (€)</Label>
                                <Input
                                  type="number"
                                  value={responseData.estimated_price}
                                  onChange={(e) => setResponseData(prev => ({
                                    ...prev,
                                    estimated_price: parseFloat(e.target.value) || 0
                                  }))}
                                  placeholder="Prix en euros"
                                />
                              </div>
                              
                              <div>
                                <Label>Durée estimée</Label>
                                <Select
                                  value={responseData.estimated_duration}
                                  onValueChange={(value) => setResponseData(prev => ({
                                    ...prev,
                                    estimated_duration: value
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner la durée" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1-2h">1-2 heures</SelectItem>
                                    <SelectItem value="2-4h">2-4 heures</SelectItem>
                                    <SelectItem value="1 jour">1 jour</SelectItem>
                                    <SelectItem value="2-3 jours">2-3 jours</SelectItem>
                                    <SelectItem value="1 semaine">1 semaine</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>Garantie (mois)</Label>
                                <Select
                                  value={responseData.warranty_duration}
                                  onValueChange={(value) => setResponseData(prev => ({
                                    ...prev,
                                    warranty_duration: value
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 mois</SelectItem>
                                    <SelectItem value="3">3 mois</SelectItem>
                                    <SelectItem value="6">6 mois</SelectItem>
                                    <SelectItem value="12">12 mois</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>Message personnalisé</Label>
                                <Textarea
                                  value={responseData.response_message}
                                  onChange={(e) => setResponseData(prev => ({
                                    ...prev,
                                    response_message: e.target.value
                                  }))}
                                  placeholder="Message pour le client..."
                                  rows={3}
                                />
                              </div>
                              
                              <Button
                                onClick={() => handleStatusUpdate(request.id, 'accepted', responseData)}
                                disabled={submitting || !responseData.estimated_price}
                                className="w-full"
                              >
                                {submitting ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 mr-2" />
                                )}
                                Envoyer le devis
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="destructive"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          disabled={submitting}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'accepted' && (
                      <Badge variant="outline" className="text-green-600">
                        <Euro className="h-3 w-3 mr-1" />
                        {request.estimated_price}€
                      </Badge>
                    )}
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

export default QuoteRequestsTabSection;