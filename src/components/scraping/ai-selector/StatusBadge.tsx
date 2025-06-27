
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'configured':
      return <Badge className="bg-green-100 text-green-800">Configuré</Badge>;
    case 'needs_config':
      return <Badge className="bg-orange-100 text-orange-800">Configuration requise</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Non disponible</Badge>;
  }
};

export default StatusBadge;
