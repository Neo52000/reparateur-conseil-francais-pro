import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

interface PendingQuote {
  id: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  created_at: string;
  client_name: string;
  client_email: string;
  target_repairer_name?: string;
  assignment_id: string;
}

interface Repairer {
  id: string;
  business_name: string;
  subscription_tier: string;
  city: string;
  user_id: string;
}

const AdminQuoteAssignments: React.FC = () => {
  const [pendingQuotes, setPendingQuotes] = useState<PendingQuote[]>([]);
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [selectedRepairer, setSelectedRepairer] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingQuotes();
    fetchRepairers();
  }, []);

  const fetchPendingQuotes = async () => {
    setLoading(true);
    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('admin_quote_assignments')
        .select(`
          id,
          quote_id,
          target_repairer_id,
          status,
          notes,
          created_at,
          quotes_with_timeline (
            id,
            device_type,
            device_brand,
            device_model,
            repair_type,
            issue_description,
            created_at,
            client_id,
            profiles!quotes_with_timeline_client_id_fkey (
              first_name,
              last_name,
              email
            )
          ),
          repairer_profiles (
            business_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      const formattedQuotes = assignmentsData?.map((assignment: any) => ({
        id: assignment.quotes_with_timeline.id,
        device_type: assignment.quotes_with_timeline.device_type,
        device_brand: assignment.quotes_with_timeline.device_brand,
        device_model: assignment.quotes_with_timeline.device_model,
        repair_type: assignment.quotes_with_timeline.repair_type,
        issue_description: assignment.quotes_with_timeline.issue_description,
        created_at: assignment.quotes_with_timeline.created_at,
        client_name: `${assignment.quotes_with_timeline.profiles?.first_name} ${assignment.quotes_with_timeline.profiles?.last_name}`.trim(),
        client_email: assignment.quotes_with_timeline.profiles?.email,
        target_repairer_name: assignment.repairer_profiles?.business_name,
        assignment_id: assignment.id,
      })) || [];

      setPendingQuotes(formattedQuotes);
    } catch (error: any) {
      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const fetchRepairers = async () => {
    try {
      const { data, error } = await supabase
        .from('repairer_profiles')
        .select(`
          id,
          business_name,
          city,
          user_id,
          repairer_subscriptions!inner (
            subscription_tier,
            subscribed
          )
        `)
        .eq('repairer_subscriptions.subscribed', true)
        .order('business_name');

      if (error) throw error;

      const formattedRepairers = data?.map((rep: any) => ({
        id: rep.id,
        business_name: rep.business_name,
        subscription_tier: rep.repairer_subscriptions.subscription_tier,
        city: rep.city,
        user_id: rep.user_id,
      })) || [];

      setRepairers(formattedRepairers);
    } catch (error: any) {
      console.error('Erreur lors du chargement des réparateurs:', error);
    }
  };

  const assignQuote = async (quoteId: string, assignmentId: string) => {
    if (!selectedRepairer) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un réparateur",
        variant: "destructive"
      });
      return;
    }

    setAssigning(quoteId);
    try {
      // Mettre à jour le devis avec le nouveau réparateur
      const { error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .update({
          repairer_id: selectedRepairer,
          assignment_status: 'admin_assigned',
          admin_assigned_at: new Date().toISOString(),
          admin_assigned_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // Marquer l'assignation comme terminée
      const { error: assignmentError } = await supabase
        .from('admin_quote_assignments')
        .update({
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
          notes: assignmentNotes
        })
        .eq('id', assignmentId);

      if (assignmentError) throw assignmentError;

      toast({
        title: "Attribution réussie",
        description: "Le devis a été attribué avec succès"
      });

      // Réinitialiser les formulaires et recharger
      setSelectedRepairer('');
      setAssignmentNotes('');
      fetchPendingQuotes();
    } catch (error: any) {
      toast({
        title: "Erreur d'attribution",
        description: error.message,
        variant: "destructive"
      });
    }
    setAssigning(null);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Chargement des devis en attente...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          Attribution des devis ({pendingQuotes.length})
        </h2>
      </div>

      {pendingQuotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun devis en attente
            </h3>
            <p className="text-gray-600">
              Tous les devis ont été attribués automatiquement ou manuellement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingQuotes.map((quote) => (
            <Card key={quote.id} className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    {quote.device_brand} {quote.device_model}
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    En attente
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Détails du devis</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Type :</span> {quote.device_type}</p>
                      <p><span className="font-medium">Réparation :</span> {quote.repair_type}</p>
                      <p><span className="font-medium">Problème :</span> {quote.issue_description}</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Client</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {quote.client_name}
                      </p>
                      <p>{quote.client_email}</p>
                      {quote.target_repairer_name && (
                        <p><span className="font-medium">Réparateur ciblé :</span> {quote.target_repairer_name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Attribuer à un réparateur</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Select value={selectedRepairer} onValueChange={setSelectedRepairer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un réparateur" />
                        </SelectTrigger>
                        <SelectContent>
                          {repairers.map((repairer) => (
                            <SelectItem key={repairer.id} value={repairer.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{repairer.business_name}</span>
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge className={getTierBadgeColor(repairer.subscription_tier)}>
                                    {repairer.subscription_tier}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{repairer.city}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Textarea
                        placeholder="Notes d'attribution (optionnel)"
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => assignQuote(quote.id, quote.assignment_id)}
                      disabled={!selectedRepairer || assigning === quote.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {assigning === quote.id ? 'Attribution...' : 'Attribuer le devis'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuoteAssignments;