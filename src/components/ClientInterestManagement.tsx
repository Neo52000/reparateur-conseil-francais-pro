
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Mail, Phone, MessageSquare } from 'lucide-react';

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

  // Simuler le chargement des demandes d'intérêt
  useEffect(() => {
    const mockInterests: ClientInterest[] = [
      {
        id: '1',
        client_email: 'client1@example.com',
        client_phone: '0123456789',
        client_message: 'Bonjour, je souhaiterais réparer mon iPhone 12 qui a un écran cassé.',
        repairer_profile_id: 'repairer-1',
        status: 'pending',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        client_email: 'client2@example.com',
        client_message: 'Mon Samsung Galaxy S21 ne charge plus, pouvez-vous m\'aider ?',
        repairer_profile_id: 'repairer-2',
        status: 'approved',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        approved_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        approved_by: 'admin-user-id'
      },
      {
        id: '3',
        client_email: 'client3@example.com',
        client_phone: '0987654321',
        client_message: 'Écran tactile de ma tablette iPad qui ne répond plus.',
        repairer_profile_id: 'repairer-1',
        status: 'sent',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        approved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        approved_by: 'admin-user-id'
      }
    ];
    setInterests(mockInterests);
  }, []);

  const handleApproveInterest = async (interest: ClientInterest) => {
    setLoading(interest.id);
    try {
      // Simulate update for now (table doesn't exist yet)
      console.log('Would update client interest:', interest.id, 'to approved');
      // TODO: Implement real Supabase update when table is created
      
      logClientInterestAction('approve', interest.id, {
        client_email: interest.client_email,
        client_phone: interest.client_phone,
        repairer_profile_id: interest.repairer_profile_id,
        approval_time: new Date().toISOString(),
        previous_status: interest.status,
        new_status: 'approved',
        client_message_preview: interest.client_message?.substring(0, 100)
      }, 'info');

      setInterests(prev => 
        prev.map(i => 
          i.id === interest.id 
            ? { ...i, status: 'approved', approved_at: new Date().toISOString() }
            : i
        )
      );

      toast({
        title: "Demande approuvée",
        description: `La demande de ${interest.client_email} a été approuvée`,
      });
    } catch (error: any) {
      console.error('Error approving interest:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'approuver la demande",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRejectInterest = async (interest: ClientInterest) => {
    if (!confirm(`Êtes-vous sûr de vouloir rejeter la demande de ${interest.client_email} ?`)) {
      return;
    }

    setLoading(interest.id);
    try {
      // Simulate update for now (table doesn't exist yet)
      console.log('Would update client interest:', interest.id, 'to rejected');
      // TODO: Implement real Supabase update when table is created
      
      logClientInterestAction('reject', interest.id, {
        client_email: interest.client_email,
        client_phone: interest.client_phone,
        repairer_profile_id: interest.repairer_profile_id,
        rejection_time: new Date().toISOString(),
        previous_status: interest.status,
        new_status: 'rejected',
        rejection_reason: 'Manual admin rejection',
        client_message_preview: interest.client_message?.substring(0, 100)
      }, 'warning');

      setInterests(prev => 
        prev.map(i => 
          i.id === interest.id 
            ? { ...i, status: 'rejected' }
            : i
        )
      );

      toast({
        title: "Demande rejetée",
        description: `La demande de ${interest.client_email} a été rejetée`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSendToRepairer = async (interest: ClientInterest) => {
    if (interest.status !== 'approved') {
      toast({
        title: "Erreur",
        description: "Seules les demandes approuvées peuvent être envoyées",
        variant: "destructive"
      });
      return;
    }

    setLoading(interest.id);
    try {
      // Simuler l'envoi au réparateur
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logClientInterestAction('update', interest.id, {
        client_email: interest.client_email,
        repairer_profile_id: interest.repairer_profile_id,
        send_time: new Date().toISOString(),
        previous_status: interest.status,
        new_status: 'sent',
        notification_method: 'email',
        repairer_notified: true
      }, 'info');

      setInterests(prev => 
        prev.map(i => 
          i.id === interest.id 
            ? { ...i, status: 'sent', sent_at: new Date().toISOString() }
            : i
        )
      );

      toast({
        title: "Demande envoyée",
        description: `La demande a été transmise au réparateur`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande",
        variant: "destructive"
      });
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
                            : interest.client_message
                          }
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(interest.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(interest.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {interest.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveInterest(interest)}
                            disabled={loading === interest.id}
                          >
                            {loading === interest.id ? 'Traitement...' : 'Approuver'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectInterest(interest)}
                            disabled={loading === interest.id}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}
                      {interest.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendToRepairer(interest)}
                          disabled={loading === interest.id}
                        >
                          {loading === interest.id ? 'Envoi...' : 'Envoyer au réparateur'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientInterestManagement;
