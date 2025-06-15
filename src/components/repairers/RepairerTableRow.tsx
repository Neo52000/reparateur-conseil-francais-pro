
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import SubscriptionTierBadge from './SubscriptionTierBadge';
import RepairerTableActions from './RepairerTableActions';
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

interface RepairerTableRowProps {
  repairer: RepairerData;
  loading: string | null;
  onViewProfile: (repairerId: string) => void;
  onToggleStatus: (repairerId: string, currentStatus: boolean) => void;
  onDelete: (repairerId: string) => void;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

const RepairerTableRow: React.FC<RepairerTableRowProps> = ({
  repairer,
  loading,
  onViewProfile,
  onToggleStatus,
  onDelete,
  checked,
  onCheck,
}) => {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={checked}
          onCheckedChange={value => onCheck(Boolean(value))}
          aria-label="Sélectionner le réparateur"
        />
      </TableCell>
      <TableCell className="font-medium">{repairer.name}</TableCell>
      <TableCell>{repairer.email}</TableCell>
      <TableCell>{repairer.phone}</TableCell>
      <TableCell>{repairer.city}</TableCell>
      <TableCell>
        <SubscriptionTierBadge tier={repairer.subscription_tier} />
      </TableCell>
      <TableCell>{repairer.total_repairs}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span>{repairer.rating}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={repairer.subscribed ? "default" : "secondary"}>
          {repairer.subscribed ? 'Actif' : 'Inactif'}
        </Badge>
      </TableCell>
      <TableCell>
        <RepairerTableActions
          repairerId={repairer.id}
          currentStatus={repairer.subscribed}
          loading={loading}
          onViewProfile={onViewProfile}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default RepairerTableRow;
