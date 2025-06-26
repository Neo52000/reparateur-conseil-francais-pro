
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddRepairerModal from '@/components/AddRepairerModal';
import RepairerTableRow from './RepairerTableRow';
import BulkActionsBar from './BulkActionsBar';
import RepairersTableHeader from './RepairersTableHeader';
import { useRepairersTableActions } from './RepairersTableActions';
import { useRepairersTableSelection } from './RepairersTableSelection';

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

interface RepairersTableProps {
  repairers: RepairerData[];
  onViewProfile: (repairerId: string) => void;
  onRefresh: () => void;
}

const RepairersTable: React.FC<RepairersTableProps> = ({ repairers, onViewProfile, onRefresh }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    handleDeleteRepairer,
    handleToggleStatus,
    handleBulkSetActive,
    handleBulkDelete,
  } = useRepairersTableActions({
    repairers,
    selectedIds,
    loading,
    onRefresh,
    setLoading,
    setSelectedIds,
  });

  const { SelectAllCheckbox } = useRepairersTableSelection({ repairers, selectedIds });

  const handleAddSuccess = () => {
    onRefresh();
  };

  const handleCheckAll = (checked: boolean) => {
    setSelectedIds(checked ? repairers.map(r => r.id) : []);
  };

  const handleCheckOne = (repairerId: string, checked: boolean) => {
    setSelectedIds((ids) =>
      checked ? [...ids, repairerId] : ids.filter((id) => id !== repairerId)
    );
  };

  return (
    <>
      <Card>
        <RepairersTableHeader onAddRepairer={() => setAddModalOpen(true)} />
        <CardContent>
          {selectedIds.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedIds.length}
              onSetActive={handleBulkSetActive}
              onDelete={handleBulkDelete}
              disableActions={!!loading}
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SelectAllCheckbox onCheckAll={handleCheckAll} />
                </TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead>Réparations</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairers.map((repairer) => (
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
              ))}
            </TableBody>
          </Table>
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
