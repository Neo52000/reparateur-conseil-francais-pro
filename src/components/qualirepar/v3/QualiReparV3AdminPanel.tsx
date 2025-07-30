import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Download
} from 'lucide-react';

interface AdminStats {
  totalDossiers: number;
  pendingValidation: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  documentsToReview: number;
}

interface DossierWithDocuments {
  id: string;
  dossier_number: string;
  client_name: string;
  product_brand: string;
  product_model: string;
  status: string;
  repair_cost: number;
  created_at: string;
  documents: any[];
}

export const QualiReparV3AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalDossiers: 0,
    pendingValidation: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    documentsToReview: 0
  });
  const [pendingDossiers, setPendingDossiers] = useState<DossierWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      // Statistiques globales
      const { data: dossiers, error: dossiersError } = await supabase
        .from('qualirepar_dossiers')
        .select('id, status, repair_cost');

      if (dossiersError) throw dossiersError;

      const totalDossiers = dossiers?.length || 0;
      const pendingValidation = dossiers?.filter(d => d.status === 'submitted').length || 0;
      const approved = dossiers?.filter(d => d.status === 'approved').length || 0;
      const rejected = dossiers?.filter(d => d.status === 'rejected').length || 0;
      const totalAmount = dossiers?.reduce((sum, d) => sum + (d.repair_cost || 0), 0) || 0;

      // Documents à réviser
      const { count: documentsCount } = await supabase
        .from('qualirepar_documents')
        .select('*', { count: 'exact', head: true })
        .eq('file_validation_status', 'pending');

      setStats({
        totalDossiers,
        pendingValidation,
        approved,
        rejected,
        totalAmount,
        documentsToReview: documentsCount || 0
      });

      // Dossiers en attente avec leurs documents
      const { data: pendingData, error: pendingError } = await supabase
        .from('qualirepar_dossiers')
        .select(`
          id,
          dossier_number,
          client_name,
          product_brand,
          product_model,
          status,
          repair_cost,
          created_at
        `)
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

      if (pendingError) throw pendingError;

      // Récupérer les documents pour chaque dossier
      const dossiersWithDocuments = await Promise.all(
        (pendingData || []).map(async (dossier) => {
          const { data: documents } = await supabase
            .from('qualirepar_documents')
            .select('*')
            .eq('dossier_id', dossier.id);

          return {
            ...dossier,
            documents: documents || []
          };
        })
      );

      setPendingDossiers(dossiersWithDocuments);

    } catch (error) {
      console.error('Erreur admin:', error);
      toast.error('Erreur lors du chargement des données admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDossierAction = async (dossierId: string, action: 'approve' | 'reject') => {
    setActionLoading(dossierId);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('qualirepar_dossiers')
        .update({ 
          status: newStatus,
          validated_at: new Date().toISOString(),
          validated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', dossierId);

      if (error) throw error;

      toast.success(`Dossier ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
      fetchAdminData(); // Recharger les données

    } catch (error) {
      console.error('Erreur action dossier:', error);
      toast.error(`Erreur lors de l'action sur le dossier`);
    } finally {
      setActionLoading(null);
    }
  };

  const exportDossiers = async () => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .csv();

      if (error) throw error;

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qualirepar-dossiers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export réalisé avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des données admin...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-semibold">Administration QualiRépar V3</h1>
            <p className="text-muted-foreground">
              Validation et gestion des dossiers de remboursement
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={exportDossiers}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Total Dossiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDossiers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingValidation}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approuvés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejetés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Montant Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalAmount.toFixed(2)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Docs à Réviser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.documentsToReview}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Dossiers en Attente ({stats.pendingValidation})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents à Réviser ({stats.documentsToReview})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dossiers à Valider</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDossiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun dossier en attente de validation
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDossiers.map((dossier) => (
                    <div
                      key={dossier.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{dossier.dossier_number}</span>
                            <Badge variant="secondary">En attente</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{dossier.client_name}</span> • 
                            {dossier.product_brand} {dossier.product_model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Soumis le {new Date(dossier.created_at).toLocaleDateString()} • 
                            {dossier.documents.length} document(s)
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="font-semibold">{dossier.repair_cost}€</div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleDossierAction(dossier.id, 'approve')}
                              disabled={actionLoading === dossier.id}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDossierAction(dossier.id, 'reject')}
                              disabled={actionLoading === dossier.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      {dossier.documents.length > 0 && (
                        <div className="border-t pt-3">
                          <div className="text-sm font-medium mb-2">Documents joints:</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {dossier.documents.map((doc, idx) => (
                              <div key={idx} className="text-xs bg-muted rounded p-2">
                                <div className="font-medium">{doc.document_type}</div>
                                <div className="text-muted-foreground">{doc.file_name}</div>
                                <Badge 
                                  variant={doc.file_validation_status === 'validated' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {doc.file_validation_status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents en Attente de Révision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Fonctionnalité de révision des documents en cours de développement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};