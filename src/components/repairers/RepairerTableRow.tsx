
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface RepairerTableRowProps {
  repairer: {
    id: string;
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone: string;
    city: string;
    department: string;
    subscription_tier: string;
    subscribed: boolean;
    total_repairs: number;
    rating: number;
    created_at: string;
    is_active?: boolean;
    category_name?: string;
    category_color?: string;
  };
  loading: string | null;
  onViewProfile: (repairerId: string) => void;
  onToggleStatus: (repairerId: string, currentStatus: boolean) => Promise<void>;
  onDelete: (repairerId: string) => Promise<void>;
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
  onCheck
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

  const displayName = repairer.name || `${repairer.first_name || ''} ${repairer.last_name || ''}`.trim() || 'N/A';

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheck}
          disabled={!!loading}
        />
      </TableCell>
      <TableCell className="font-medium">
        {displayName}
      </TableCell>
      <TableCell>
        {repairer.email}
      </TableCell>
      <TableCell>
        {repairer.phone || 'N/A'}
      </TableCell>
      <TableCell>
        {repairer.city || 'N/A'}
      </TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          style={{ backgroundColor: `${repairer.category_color}20`, borderColor: repairer.category_color, color: repairer.category_color }}
        >
          {repairer.category_name || 'Non catégorisé'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getTierBadgeVariant(repairer.subscription_tier || 'free')}>
          {repairer.subscription_tier || 'free'}
        </Badge>
      </TableCell>
      <TableCell>
        {repairer.total_repairs || 0}
      </TableCell>
      <TableCell>
        {repairer.rating ? `${repairer.rating}/5` : 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant={repairer.is_active !== false ? 'default' : 'secondary'}>
          {repairer.is_active !== false ? 'Actif' : 'Inactif'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewProfile(repairer.id)}
            disabled={loading === repairer.id}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(repairer.id, repairer.is_active !== false)}
            disabled={loading === repairer.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(repairer.id)}
            disabled={loading === repairer.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RepairerTableRow;
