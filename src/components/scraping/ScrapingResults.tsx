import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle,
  MapPin,
  Phone,
  Globe,
  Star,
  Brain,
  Trash2,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RepairerModal from "./RepairerModal";

interface RepairerResult {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  services: string[];
  price_range: string;
  source: string;
  is_verified: boolean;
  rating?: number;
  scraped_at: string;
}

const ScrapingResults = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<RepairerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedRepairer, setSelectedRepairer] = useState<RepairerResult | null>(null);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    console.log("[ScrapingResults] Chargement des résultats...");
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      console.log("[ScrapingResults] Données récupérées:", data);
      console.log("[ScrapingResults] Nombre de résultats:", data?.length || 0);
      
      // Force un nouveau tableau pour déclencher le re-render
      setResults([...(data || [])]);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les résultats.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatusSelected = async (newStatus: "verified" | "unverified") => {
    if (!supabase || selectedItems.length === 0) return;
    const isVerified = newStatus === "verified";
    
    console.log("[ScrapingResults] Changement de statut:", { selectedItems, newStatus, isVerified });
    
    try {
      const { error } = await supabase
        .from('repairers')
        .update({ is_verified: isVerified })
        .in('id', selectedItems);
      
      if (error) throw error;

      console.log("[ScrapingResults] Statut mis à jour avec succès");

      toast({
        title: "Modification du statut réussie",
        description: `${selectedItems.length} entreprise(s) ${isVerified ? "vérifiées" : "remises en attente"}.`
      });

      setSelectedItems([]);
      setStatusChangeOpen(false);
      
      // Attendre un petit délai puis recharger
      setTimeout(() => {
        console.log("[ScrapingResults] Rechargement après mise à jour du statut");
        loadResults();
      }, 500);
      
    } catch (error) {
      console.error("[ScrapingResults] Erreur lors du changement de statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive"
      });
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || result.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && result.is_verified) ||
                         (statusFilter === 'unverified' && !result.is_verified);
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredResults.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredResults.map(r => r.id));
    }
  };

  const handleVerifySelected = async () => {
    if (!supabase || selectedItems.length === 0) return;

    try {
      const { error } = await supabase
        .from('repairers')
        .update({ is_verified: true })
        .in('id', selectedItems);

      if (error) throw error;

      toast({
        title: "Vérification réussie",
        description: `${selectedItems.length} entreprises vérifiées.`
      });

      setSelectedItems([]);
      setTimeout(() => loadResults(), 500);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les entreprises.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (!supabase || selectedItems.length === 0) return;

    try {
      const { error } = await supabase
        .from('repairers')
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      toast({
        title: "Suppression réussie",
        description: `${selectedItems.length} entreprises supprimées.`
      });

      setSelectedItems([]);
      setTimeout(() => loadResults(), 500);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les entreprises.",
        variant: "destructive"
      });
    }
  };

  const getPriceRangeBadge = (range: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[range as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filtres et actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Résultats du Scraping IA
            </div>
            <Badge variant="secondary">
              {filteredResults.length} résultats
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sources</SelectItem>
                <SelectItem value="pages_jaunes">Pages Jaunes</SelectItem>
                <SelectItem value="google_places">Google Places</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="unverified">Non vérifiés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedItems.length} éléments sélectionnés
              </span>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleVerifySelected}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Vérifier
                </Button>
                <div className="relative inline-block">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusChangeOpen((v) => !v)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Changer le statut
                  </Button>
                  {statusChangeOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded shadow z-50">
                      <button
                        className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-green-700"
                        type="button"
                        onClick={() => handleChangeStatusSelected("verified")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marquer comme vérifié
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-gray-700"
                        type="button"
                        onClick={() => handleChangeStatusSelected("unverified")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remettre en attente
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-gray-500"
                        type="button"
                        onClick={() => setStatusChangeOpen(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau des résultats */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredResults.length && filteredResults.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Brain className="h-6 w-6 animate-pulse mr-2" />
                      Chargement des résultats...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Aucun résultat trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(result.id)}
                        onChange={() => handleSelectItem(result.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {result.address}, {result.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {result.phone && (
                          <div className="text-sm flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {result.phone}
                          </div>
                        )}
                        {result.website && (
                          <div className="text-sm flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            <a href={result.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline">
                              Site web
                            </a>
                          </div>
                        )}
                        {result.rating && (
                          <div className="text-sm flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-400" />
                            {result.rating}/5
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {result.services?.slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {result.services?.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{result.services.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriceRangeBadge(result.price_range)}>
                        {result.price_range}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {result.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRepairer(result);
                            setModalMode("view");
                            setModalOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRepairer(result);
                            setModalMode("edit");
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <RepairerModal
        repairer={selectedRepairer}
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onUpdated={loadResults}
      />
    </div>
  );
};

export default ScrapingResults;
