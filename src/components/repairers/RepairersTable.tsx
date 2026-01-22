
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
    isActive: 'all'
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

  // Filtrer les réparateurs selon les critères
  const filteredRepairers = useMemo(() => {
    return repairers.filter(repairer => {
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
      
      return true;
    });
  }, [repairers, filters]);

  // Stats pour les filtres
  const filterStats = useMemo(() => ({
    total: repairers.length,
    filtered: filteredRepairers.length,
    withGps: repairers.filter(r => r.lat != null && r.lng != null).length
  }), [repairers, filteredRepairers]);

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
