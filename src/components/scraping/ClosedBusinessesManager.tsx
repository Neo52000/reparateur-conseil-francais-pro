
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClosedBusiness {
  id: string;
  siret?: string;
  siren?: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  status: string;
  closure_date?: string;
  verification_date: string;
  created_at: string;
}

const ClosedBusinessesManager = () => {
  const [closedBusinesses, setClosedBusinesses] = useState<ClosedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadClosedBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('closed_businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setClosedBusinesses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises fermées:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les entreprises fermées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteClosedBusiness = async (id: string) => {
    try {
      const { error } = await supabase
        .from('closed_businesses')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: "Entreprise fermée supprimée de la liste"
      });

      loadClosedBusinesses();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadClosedBusinesses();
  }, []);

  const filteredBusinesses = closedBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.city && business.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (business.siret && business.siret.includes(searchTerm))
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ceased': { label: 'Cessée', variant: 'destructive' as const },
      'closed': { label: 'Fermée', variant: 'destructive' as const },
      'liquidation': { label: 'Liquidation', variant: 'secondary' as const },
      'radiée': { label: 'Radiée', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Entreprises fermées ({filteredBusinesses.length})
          </div>
          <Button onClick={loadClosedBusinesses} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, ville ou SIRET..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>SIRET</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de vérification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Aucun résultat trouvé' : 'Aucune entreprise fermée enregistrée'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell>
                        {business.address && business.city ? (
                          <div className="text-sm">
                            <div>{business.address}</div>
                            <div className="text-gray-500">
                              {business.postal_code} {business.city}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Non renseignée</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {business.siret ? (
                          <code className="text-sm bg-gray-100 px-1 rounded">
                            {business.siret}
                          </code>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(business.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(business.verification_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => deleteClosedBusiness(business.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Informations */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="text-sm font-medium text-amber-900 mb-2">
              ℹ️ À propos de cette liste
            </h4>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• Les entreprises listées ici ont été identifiées comme fermées par l'API Recherche d'Entreprises</li>
              <li>• Elles sont automatiquement exclues des futurs scrapings</li>
              <li>• Vous pouvez supprimer une entrée si vous pensez qu'il y a une erreur</li>
              <li>• La vérification sera refaite lors du prochain scraping si l'entreprise est supprimée</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClosedBusinessesManager;
