
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import RepairerTableActions from './RepairerTableActions';

interface RepairerTableRowProps {
  repairer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    subscription_tier?: string;
    created_at?: string;
    city?: string;
    phone?: string;
  };
  onViewProfile: (repairerId: string) => void;
  onRefresh: () => void;
}

const RepairerTableRow: React.FC<RepairerTableRowProps> = ({
  repairer,
  onViewProfile,
  onRefresh
}) => {
  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'premium': return 'default';
      case 'pro': return 'secondary';
      case 'free': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {repairer.email}
      </TableCell>
      <TableCell>
        {`${repairer.first_name || ''} ${repairer.last_name || ''}`.trim() || 'N/A'}
      </TableCell>
      <TableCell>
        {repairer.city || 'N/A'}
      </TableCell>
      <TableCell>
        {repairer.phone || 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant={getTierBadgeVariant(repairer.subscription_tier || 'free')}>
          {repairer.subscription_tier || 'free'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={repairer.is_active !== false ? 'default' : 'secondary'}>
          {repairer.is_active !== false ? 'Actif' : 'Inactif'}
        </Badge>
      </TableCell>
      <TableCell>
        {formatDate(repairer.created_at)}
      </TableCell>
      <TableCell>
        <RepairerTableActions
          repairer={repairer}
          onViewProfile={onViewProfile}
          onRefresh={onRefresh}
        />
      </TableCell>
    </TableRow>
  );
};

export default RepairerTableRow;
