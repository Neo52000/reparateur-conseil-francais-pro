
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Warranty {
  id: string;
  repairer_id: string;
  quote_id?: string;
  repair_type: string;
  device_brand: string;
  device_model: string;
  warranty_start_date: string;
  warranty_end_date: string;
  warranty_duration_days: number;
  status: 'active' | 'expired' | 'claimed' | 'void';
  terms_conditions?: string;
  claim_description?: string;
  claim_date?: string;
  claim_status?: 'pending' | 'approved' | 'rejected' | 'resolved';
  created_at: string;
}

const ClientWarrantiesTab = () => {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadWarranties();
    }
  }, [user]);

  const loadWarranties = async () => {
    try {
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWarranties(data || []);
    } catch (error) {
      console.error('Erreur chargement garanties:', error);
      toast.error('Erreur lors du chargement des garanties');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimWarranty = async () => {
    if (!selectedWarranty || !claimDescription.trim()) {
      toast.error('Veuillez décrire le problème rencontré');
      return;
    }

    try {
      const { error } = await supabase
        .from('warranties')
        .update({
          status: 'claimed',
          claim_description: claimDescription,
          claim_date: new Date().toISOString(),
          claim_status: 'pending'
        })
        .eq('id', selectedWarranty.id);

      if (error) throw error;

      toast.success('Demande de garantie envoyée avec succès');
      setIsClaimDialogOpen(false);
      setClaimDescription('');
      setSelectedWarranty(null);
      loadWarranties();
    } catch (error) {
      console.error('Erreur réclamation garantie:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    }
  };

  const getStatusBadge = (warranty: Warranty) => {
    const today = new Date();
    const endDate = new Date(warranty.warranty_end_date);
    const isExpired = today > endDate;

    if (warranty.status === 'claimed') {
      const claimConfig = {
        pending: { label: 'Réclamation en cours', variant: 'secondary' as const, icon: Clock },
        approved: { label: 'Réclamation acceptée', variant: 'default' as const, icon: CheckCircle },
        rejected: { label: 'Réclamation refusée', variant: 'destructive' as const, icon: AlertTriangle },
        resolved: { label: 'Réclamation résolue', variant: 'default' as const, icon: CheckCircle }
      };
      
      const config = claimConfig[warranty.claim_status as keyof typeof claimConfig];
      const IconComponent = config.icon;
      
      return (
        <Badge variant={config.variant} className="flex items-center gap-1">
          <IconComponent className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    }

    if (isExpired || warranty.status === 'expired') {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expirée
        </Badge>
      );
    }

    if (warranty.status === 'void') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Annulée
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const getDaysRemaining = (warranty: Warranty) => {
    const today = new Date();
    const endDate = new Date(warranty.warranty_end_date);
    const daysRemaining = differenceInDays(endDate, today);
    
    if (daysRemaining < 0) return null;
    
    return daysRemaining;
  };

  const canClaimWarranty = (warranty: Warranty) => {
    const today = new Date();
    const endDate = new Date(warranty.warranty_end_date);
    return warranty.status === 'active' && today <= endDate;
  };

  const activeWarranties = warranties.filter(w => {
    const today = new Date();
    const endDate = new Date(w.warranty_end_date);
    return w.status === 'active' && today <= endDate;
  }).length;

  const expiredWarranties = warranties.filter(w => {
    const today = new Date();
    const endDate = new Date(w.warranty_end_date);
    return today > endDate || w.status === 'expired';
  }).length;

  const claimedWarranties = warranties.filter(w => w.status === 'claimed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Garanties actives</p>
                <p className="text-xl font-bold text-green-600">{activeWarranties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Réclamations</p>
                <p className="text-xl font-bold text-orange-600">{claimedWarranties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Expirées</p>
                <p className="text-xl font-bold text-gray-600">{expiredWarranties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des garanties */}
      <Card>
        <CardHeader>
          <CardTitle>Mes garanties ({warranties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {warranties.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune garantie trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appareil</TableHead>
                  <TableHead>Réparation</TableHead>
                  <TableHead>Date de fin</TableHead>
                  <TableHead>Jours restants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map((warranty) => {
                  const daysRemaining = getDaysRemaining(warranty);
                  
                  return (
                    <TableRow key={warranty.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{warranty.device_brand} {warranty.device_model}</div>
                        </div>
                      </TableCell>
                      <TableCell>{warranty.repair_type}</TableCell>
                      <TableCell>
                        {format(new Date(warranty.warranty_end_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {daysRemaining !== null ? (
                          <span className={daysRemaining <= 30 ? 'text-orange-600 font-semibold' : ''}>
                            {daysRemaining} jours
                          </span>
                        ) : (
                          <span className="text-gray-500">Expirée</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(warranty)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {warranty.terms_conditions && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Conditions de garantie</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">Appareil: {warranty.device_brand} {warranty.device_model}</h4>
                                    <p className="text-sm text-gray-600">Réparation: {warranty.repair_type}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Conditions:</h4>
                                    <p className="text-sm whitespace-pre-wrap">{warranty.terms_conditions}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {canClaimWarranty(warranty) && (
                            <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedWarranty(warranty)}
                                >
                                  Réclamer
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Réclamation de garantie</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">Appareil concerné</h4>
                                    <p className="text-sm text-gray-600">
                                      {selectedWarranty?.device_brand} {selectedWarranty?.device_model} - {selectedWarranty?.repair_type}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Décrivez le problème rencontré *
                                    </label>
                                    <Textarea
                                      value={claimDescription}
                                      onChange={(e) => setClaimDescription(e.target.value)}
                                      placeholder="Expliquez en détail le problème que vous rencontrez avec la réparation..."
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>
                                      Annuler
                                    </Button>
                                    <Button onClick={handleClaimWarranty}>
                                      Envoyer la réclamation
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {warranty.claim_description && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Voir réclamation
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Détails de la réclamation</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">Statut</h4>
                                    {getStatusBadge(warranty)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Date de réclamation</h4>
                                    <p className="text-sm text-gray-600">
                                      {warranty.claim_date && format(new Date(warranty.claim_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Description du problème</h4>
                                    <p className="text-sm whitespace-pre-wrap">{warranty.claim_description}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientWarrantiesTab;
