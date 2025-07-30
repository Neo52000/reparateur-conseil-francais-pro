import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { QualiReparV3DossierForm } from './QualiReparV3DossierForm';
import { toast } from 'sonner';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Dossier {
  id: string;
  dossier_number: string;
  client_name: string;
  client_email: string;
  product_brand: string;
  product_model: string;
  repair_type_code: string;
  repair_cost: number;
  status: string;
  created_at: string;
  documents_count?: number;
}

export const QualiReparV3Dashboard: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDossiers = async () => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select(`
          id,
          dossier_number,
          client_name,
          client_email,
          product_brand,
          product_model,
          repair_type_code,
          repair_cost,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrichir avec le nombre de documents
      const enrichedDossiers = await Promise.all(
        (data || []).map(async (dossier) => {
          const { count } = await supabase
            .from('qualirepar_documents')
            .select('*', { count: 'exact', head: true })
            .eq('dossier_id', dossier.id);
          
          return {
            ...dossier,
            documents_count: count || 0
          };
        })
      );

      setDossiers(enrichedDossiers);
    } catch (error) {
      console.error('Erreur récupération dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'default';
      case 'validated': return 'default';
      case 'approved': return 'default';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'submitted': return 'Soumis';
      case 'validated': return 'Validé';
      case 'approved': return 'Approuvé';
      case 'completed': return 'Terminé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const filteredDossiers = dossiers.filter(dossier => 
    dossier.dossier_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dossier.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dossier.product_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dossier.product_model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showCreateForm) {
    return (
      <QualiReparV3DossierForm
        onSuccess={() => {
          setShowCreateForm(false);
          fetchDossiers();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dossiers QualiRépar V3</h1>
          <p className="text-muted-foreground">
            Gestion des demandes de remboursement QualiRépar
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchDossiers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouveau Dossier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dossiers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dossiers.filter(d => ['submitted', 'validated'].includes(d.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dossiers.filter(d => d.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">
              {dossiers.reduce((sum, d) => sum + (d.repair_cost || 0), 0).toFixed(2)}€
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro, client, marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Dossiers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Liste des Dossiers ({filteredDossiers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : filteredDossiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Aucun dossier trouvé' : 'Aucun dossier créé'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{dossier.dossier_number}</span>
                        <Badge variant={getStatusColor(dossier.status)}>
                          {getStatusLabel(dossier.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{dossier.client_name}</span> • 
                        {dossier.product_brand} {dossier.product_model} • 
                        {dossier.repair_type_code || 'Non spécifié'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Créé le {new Date(dossier.created_at).toLocaleDateString()} • 
                        {dossier.documents_count} document(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{dossier.repair_cost}€</div>
                      <div className="text-xs text-muted-foreground">
                        {dossier.client_email}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};