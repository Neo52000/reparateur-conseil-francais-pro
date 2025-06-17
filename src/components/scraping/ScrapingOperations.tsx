
import React, { useState } from 'react';
import { useScrapingResults, RepairerResult } from '@/hooks/scraping/useScrapingResults';
import ScrapingFilters from './ScrapingFilters';
import ScrapingBulkActions from './ScrapingBulkActions';
import ScrapingResultsTable from './ScrapingResultsTable';
import RepairerModal from "./RepairerModal";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

const ScrapingOperations = () => {
  const {
    results,
    loading,
    selectedItems,
    setSelectedItems,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    loadResults,
    handleChangeStatusSelected,
    handleDeleteSelected
  } = useScrapingResults();

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedRepairer, setSelectedRepairer] = useState<RepairerResult | null>(null);

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
    const newSelection = selectedItems.includes(id) 
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id];
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredResults.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredResults.map(r => r.id));
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

  const handleVerifySelected = async () => {
    await handleChangeStatusSelected("verified");
  };

  const handleRefresh = () => {
    loadResults();
  };

  const showNoResults = !loading && results.length === 0;

  return (
    <div className="space-y-6">
      {/* Contrôles d'affichage */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <Label htmlFor="auto-refresh">Actualisation automatique</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefreshEnabled}
              onCheckedChange={setAutoRefreshEnabled}
            />
          </div>
          <Button 
            onClick={handleRefresh}
            size="sm" 
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {results.length} résultat(s) • {filteredResults.length} affiché(s)
        </div>
      </div>

      {showNoResults && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Aucun résultat de scraping trouvé. Les données pourraient ne pas avoir été chargées ou il y a un problème de permissions.
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh}
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
        onUpdated={handleRefresh}
      />
    </div>
  );
};

export default ScrapingOperations;
