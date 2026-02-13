
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';

interface ClientInterest {
  id: string;
  client_email: string;
  client_phone?: string;
  client_message?: string;
  repairer_profile_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  created_at: string;
  approved_at?: string;
  sent_at?: string;
  approved_by?: string;
}

const ClientInterestManagement: React.FC = () => {
  const { logClientInterestAction } = useAdminAuditIntegration();
  const { toast } = useToast();
  const [interests, setInterests] = useState<ClientInterest[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('client_interests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterests((data || []) as ClientInterest[]);
    } catch (error) {
      console.error('Erreur chargement intérêts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes',
        variant: 'destructive',
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleApproveInterest = async (interest: ClientInterest) => {
    setLoading(interest.id);
    try {
      const { error } = await supabase
        .from('client_interests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', interest.id);

      if (error) throw error;

      logClientInterestAction('approve', interest.id, {
        client_email: interest.client_email,
        repairer_profile_id: interest.repairer_profile_id,
        previous_status: interest.status,
        new_status: 'approved',
      }, 'info');

      setInterests(prev =>
        prev.map(i =>
          i.id === interest.id
            ? { ...i, status: 'approved', approved_at: new Date().toISOString() }
            : i
        )
      );

      toast({ title: 'Demande approuvée', description: `La demande de ${interest.client_email} a été approuvée` });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || "Impossible d'approuver", variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleRejectInterest = async (interest: ClientInterest) => {
    if (!confirm(`Rejeter la demande de ${interest.client_email} ?`)) return;

    setLoading(interest.id);
    try {
      const { error } = await supabase
        .from('client_interests')
        .update({ status: 'rejected' })
        .eq('id', interest.id);

      if (error) throw error;

      logClientInterestAction('reject', interest.id, {
        client_email: interest.client_email,
        repairer_profile_id: interest.repairer_profile_id,
        previous_status: interest.status,
        new_status: 'rejected',
      }, 'warning');

      setInterests(prev =>
        prev.map(i => i.id === interest.id ? { ...i, status: 'rejected' } : i)
      );

      toast({ title: 'Demande rejetée', variant: 'destructive' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de rejeter', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleSendToRepairer = async (interest: ClientInterest) => {
    if (interest.status !== 'approved') return;

    setLoading(interest.id);
    try {
      const { error } = await supabase
        .from('client_interests')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', interest.id);

      if (error) throw error;

      logClientInterestAction('update', interest.id, {
        client_email: interest.client_email,
        repairer_profile_id: interest.repairer_profile_id,
        new_status: 'sent',
      }, 'info');

      setInterests(prev =>
        prev.map(i =>
          i.id === interest.id
            ? { ...i, status: 'sent', sent_at: new Date().toISOString() }
            : i
        )
      );

      toast({ title: 'Demande envoyée', description: 'La demande a été transmise au réparateur' });
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'envoyer", variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: ClientInterest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />En attente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejetée</Badge>;
      case 'sent':
        return <Badge variant="outline"><Mail className="mr-1 h-3 w-3" />Envoyée</Badge>;
    }
  };

  const pendingCount = interests.filter(i => i.status === 'pending').length;
  const approvedCount = interests.filter(i => i.status === 'approved').length;
  const sentCount = interests.filter(i => i.status === 'sent').length;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envoyées</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes d'intérêt clients</CardTitle>
        </CardHeader>
        <CardContent>
          {interests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Aucune demande d'intérêt</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interests.map((interest) => (
                  <TableRow key={interest.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {interest.client_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {interest.client_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {interest.client_phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {interest.client_message && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm truncate" title={interest.client_message}>
                            {interest.client_message.length > 50
                              ? `${interest.client_message.substring(0, 50)}...`
                              : interest.client_message}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(interest.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(interest.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {interest.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApproveInterest(interest)} disabled={loading === interest.id}>
                              {loading === interest.id ? 'Traitement...' : 'Approuver'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectInterest(interest)} disabled={loading === interest.id}>
                              Rejeter
                            </Button>
                          </>
                        )}
                        {interest.status === 'approved' && (
                          <Button size="sm" variant="outline" onClick={() => handleSendToRepairer(interest)} disabled={loading === interest.id}>
                            {loading === interest.id ? 'Envoi...' : 'Envoyer au réparateur'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientInterestManagement;
