
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddRepairerModal from '@/components/AddRepairerModal';
import RepairerTableRow from './RepairerTableRow';
import BulkActionsBar from './BulkActionsBar';
import RepairersTableHeader from './RepairersTableHeader';
import RepairersFilters, { RepairersFiltersState } from './RepairersFilters';
import { useRepairersTableActions } from './RepairersTableActions';
import { useRepairersTableSelection } from './RepairersTableSelection';
import { detectEnseigne } from '@/constants/enseignes';

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  region?: string;
  department: string;
  postal_code?: string;
  address?: string;
  subscription_tier: string;
  subscribed: boolean;
  is_active?: boolean;
  total_repairs: number;
  rating: number | null;
  created_at: string;
  category_name?: string;
  category_color?: string;
  lat?: number | null;
  lng?: number | null;
  has_qualirepar_label?: boolean;
  detected_enseigne?: string;
}

interface RepairersTableProps {
  repairers: RepairerData[];
  onViewProfile: (repairerId: string) => void;
  onRefresh: () => void;
  onSeoOptimize?: () => void;
}

const RepairersTable: React.FC<RepairersTableProps> = ({ repairers, onViewProfile, onRefresh, onSeoOptimize }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<RepairersFiltersState>({
    region: '',
    department: '',
    city: '',
    hasGps: null,
    isActive: 'all',
    hasQualiRepar: 'all',
    enseigne: ''
  });

  const {
    handleDeleteRepairer,
    handleToggleStatus,
    handleBulkSetActive,
    handleBulkSetInactive,
    requestBulkDelete,
    confirmBulkDelete,
    cancelBulkDelete,
    showBulkDeleteConfirm,
  } = useRepairersTableActions({
    repairers,
    selectedIds,
    loading,
    onRefresh,
    setLoading,
    setSelectedIds,
  });

  const { SelectAllCheckbox } = useRepairersTableSelection({ repairers: repairers, selectedIds });

  // Enrichir les réparateurs avec l'enseigne détectée
  const enrichedRepairers = useMemo(() => {
    return repairers.map(repairer => ({
      ...repairer,
      detected_enseigne: repairer.detected_enseigne || detectEnseigne(repairer.name)
    }));
  }, [repairers]);

  // Filtrer les réparateurs selon les critères
  const filteredRepairers = useMemo(() => {
    return enrichedRepairers.filter(repairer => {
      // Filtre région
      if (filters.region && repairer.region !== filters.region) {
        return false;
      }
      
      // Filtre département
      if (filters.department && repairer.department !== filters.department) {
        return false;
      }
      
      // Filtre ville (recherche partielle insensible à la casse)
      if (filters.city) {
        const cityLower = filters.city.toLowerCase();
        if (!repairer.city?.toLowerCase().includes(cityLower)) {
          return false;
        }
      }
      
      // Filtre GPS
      if (filters.hasGps !== null) {
        const hasGps = repairer.lat != null && repairer.lng != null;
        if (filters.hasGps !== hasGps) {
          return false;
        }
      }
      
      // Filtre Actif/Inactif
      if (filters.isActive !== 'all') {
        const isActive = repairer.is_active === true;
        if (filters.isActive === 'active' && !isActive) {
          return false;
        }
        if (filters.isActive === 'inactive' && isActive) {
          return false;
        }
      }

      // Filtre QualiRépar
      if (filters.hasQualiRepar !== 'all') {
        const hasLabel = repairer.has_qualirepar_label === true;
        if (filters.hasQualiRepar === 'yes' && !hasLabel) {
          return false;
        }
        if (filters.hasQualiRepar === 'no' && hasLabel) {
          return false;
        }
      }

      // Filtre Enseigne
      if (filters.enseigne) {
        if (filters.enseigne === 'independant') {
          if (repairer.detected_enseigne !== 'Indépendant') {
            return false;
          }
        } else {
          if (repairer.detected_enseigne !== filters.enseigne) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [enrichedRepairers, filters]);

  // Stats pour les filtres
  const filterStats = useMemo(() => ({
    total: enrichedRepairers.length,
    filtered: filteredRepairers.length,
    withGps: enrichedRepairers.filter(r => r.lat != null && r.lng != null).length,
    withQualiRepar: enrichedRepairers.filter(r => r.has_qualirepar_label === true).length
  }), [enrichedRepairers, filteredRepairers]);

  const handleAddSuccess = () => {
    onRefresh();
  };

  const handleCheckAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredRepairers.map(r => r.id) : []);
  };

  const handleCheckOne = (repairerId: string, checked: boolean) => {
    setSelectedIds((ids) =>
      checked ? [...ids, repairerId] : ids.filter((id) => id !== repairerId)
    );
  };

  return (
    <>
      <Card>
        <RepairersTableHeader 
          onAddRepairer={() => setAddModalOpen(true)}
          onRefresh={onRefresh}
          onSeoOptimize={onSeoOptimize}
          totalCount={repairers.length}
          filteredCount={filteredRepairers.length}
        />
        <CardContent className="space-y-4">
          {/* Filtres */}
          <RepairersFilters
            filters={filters}
            onFiltersChange={setFilters}
            stats={filterStats}
          />

          {selectedIds.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedIds.length}
              onSetActive={handleBulkSetActive}
              onSetInactive={handleBulkSetInactive}
              onDelete={requestBulkDelete}
              disableActions={!!loading}
              showDeleteConfirm={showBulkDeleteConfirm}
              onConfirmDelete={confirmBulkDelete}
              onCancelDelete={cancelBulkDelete}
            />
          )}
          
          <div className="rounded-md border overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <SelectAllCheckbox onCheckAll={handleCheckAll} />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepairers.length === 0 ? (
                  <TableRow>
                    <td colSpan={11} className="text-center py-8 text-muted-foreground">
                      {repairers.length === 0 
                        ? 'Aucun réparateur trouvé'
                        : 'Aucun réparateur ne correspond aux filtres'}
                    </td>
                  </TableRow>
                ) : (
                  filteredRepairers.map((repairer) => (
                    <RepairerTableRow
                      key={repairer.id}
                      repairer={repairer}
                      loading={loading}
                      onViewProfile={onViewProfile}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteRepairer}
                      checked={selectedIds.includes(repairer.id)}
                      onCheck={(checked) => handleCheckOne(repairer.id, checked)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AddRepairerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
};

export default RepairersTable;
