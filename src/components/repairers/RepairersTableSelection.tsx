
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface UseRepairersTableSelectionProps {
  repairers: any[];
  selectedIds: string[];
}

export const useRepairersTableSelection = ({ repairers, selectedIds }: UseRepairersTableSelectionProps) => {
  const SelectAllCheckbox = ({ onCheckAll }: { onCheckAll: (checked: boolean) => void }) => (
    <Checkbox
      checked={selectedIds.length === repairers.length && repairers.length > 0}
      onCheckedChange={onCheckAll}
      className="translate-y-[2px]"
    />
  );

  return { SelectAllCheckbox };
};
