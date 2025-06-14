
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RepairerModal from "./RepairerModal";
import ScrapingFilters from './ScrapingFilters';
import ScrapingBulkActions from './ScrapingBulkActions';
import ScrapingResultsTable from './ScrapingResultsTable';

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

  const handleView = (repairer: RepairerResult) => {
    setSelectedRepairer(repairer);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (repairer: RepairerResult) => {
    setSelectedRepairer(repairer);
    setModalMode("edit");
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ScrapingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resultsCount={filteredResults.length}
      />

      <ScrapingBulkActions
        selectedItems={selectedItems}
        onVerifySelected={handleVerifySelected}
        onDeleteSelected={handleDeleteSelected}
        onChangeStatusSelected={handleChangeStatusSelected}
      />

      <ScrapingResultsTable
        results={filteredResults}
        loading={loading}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onEdit={handleEdit}
      />
      
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
