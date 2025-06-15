
import React, { useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

interface RepairersTableSelectionProps {
  repairers: RepairerData[];
  selectedIds: string[];
  onCheckAll: (checked: boolean) => void;
  onCheckOne: (repairerId: string, checked: boolean) => void;
}

export const useRepairersTableSelection = ({ repairers, selectedIds }: { repairers: RepairerData[], selectedIds: string[] }) => {
  const selectAllInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllInputRef.current) {
      selectAllInputRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < repairers.length;
    }
  }, [selectedIds, repairers.length]);

  const allChecked = repairers.length > 0 && selectedIds.length === repairers.length;

  const SelectAllCheckbox: React.FC<{ onCheckAll: (checked: boolean) => void }> = ({ onCheckAll }) => (
    <Checkbox
      checked={allChecked}
      onCheckedChange={(checked) => onCheckAll(Boolean(checked))}
      aria-label="Tout sélectionner"
      ref={(el) => {
        if (el) {
          const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
          selectAllInputRef.current = input;
        } else {
          selectAllInputRef.current = null;
        }
      }}
    />
  );

  return { SelectAllCheckbox, allChecked };
};
