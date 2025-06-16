
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Check, 
  X, 
  Mail, 
  Phone, 
  Calendar,
  RefreshCw 
} from 'lucide-react';

interface InterestRequest {
  id: string;
  repairer_profile_id: string;
  client_email: string | null;
  client_phone: string | null;
  client_message: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
  repairers?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    city: string;
  };
}

const ClientInterestManagement: React.FC = () => {
  const [requests, setRequests] = useState<InterestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_interest_requests')
        .select(`
          *,
          repairers!inner(
            name,
            email,
            phone,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching interest requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes d'intérêt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    
    try {
      const { error } = await supabase
        .from('client_interest_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Demande approuvée",
        description: "La demande d'intérêt a été approuvée"
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    
    try {
      const { error } = await supabase
        .from('client_interest_requests')
        .update({
          status: 'rejected',
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Demande rejetée",
        description: "La demande d'intérêt a été rejetée"
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleSendNotification = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    
    try {
      const { error } = await supabase.functions.invoke('send-repairer-interest-notification', {
        body: { requestId }
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "La notification a été envoyée au réparateur"
      });

      fetchRequests();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approuvée</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Envoyée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Demandes d'intérêt client</CardTitle>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune demande d'intérêt trouvée</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Réparateur</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.repairers?.name}</p>
                      <p className="text-sm text-gray-500">{request.repairers?.city}</p>
                      {request.repairers?.email && (
                        <p className="text-xs text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {request.repairers.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{request.client_email}</p>
                      {request.client_phone && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {request.client_phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">
                        {request.client_message || 'Aucun message'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(request.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingIds.has(request.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingIds.has(request.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && request.repairers?.email && (
                        <Button
                          onClick={() => handleSendNotification(request.id)}
                          disabled={processingIds.has(request.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Envoyer
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
  );
};

export default ClientInterestManagement;
