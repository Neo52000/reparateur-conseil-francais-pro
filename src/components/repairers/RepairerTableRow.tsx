
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
  department: string;
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
  // Générer l'ID personnalisé avec nom de boutique + code postal
  const generateCustomId = (name: string, city: string) => {
    const shopName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
    // Extraire le code postal de la ville si possible, sinon utiliser les 2 premiers caractères
    const postalCode = city.match(/\d{5}/) ? city.match(/\d{5}/)[0] : city.substring(0, 2).toLowerCase();
    return `${shopName}-${postalCode}`;
  };

  const customId = generateCustomId(repairer.name, repairer.city);

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={checked}
          onCheckedChange={value => onCheck(Boolean(value))}
          aria-label="Sélectionner le réparateur"
        />
      </TableCell>
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold">{repairer.name}</div>
          <div className="text-xs text-gray-500">ID: {customId}</div>
        </div>
      </TableCell>
      <TableCell>{repairer.email}</TableCell>
      <TableCell>{repairer.phone}</TableCell>
      <TableCell>
        <div>
          <div>{repairer.city}</div>
          <div className="text-xs text-gray-500">Dept. {repairer.department || '00'}</div>
        </div>
      </TableCell>
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
