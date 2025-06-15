
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Plus, Edit, Eye } from 'lucide-react';

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

interface RepairersTableProps {
  repairers: RepairerData[];
  onViewProfile: (repairerId: string) => void;
}

const RepairersTable: React.FC<RepairersTableProps> = ({ repairers, onViewProfile }) => {
  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return { name: 'Gratuit', color: 'bg-gray-100 text-gray-800', icon: null };
      case 'basic':
        return { name: 'Basique', color: 'bg-blue-100 text-blue-800', icon: <Star className="h-4 w-4" /> };
      case 'premium':
        return { name: 'Premium', color: 'bg-purple-100 text-purple-800', icon: <Zap className="h-4 w-4" /> };
      case 'enterprise':
        return { name: 'Enterprise', color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> };
      default:
        return { name: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion des Réparateurs</CardTitle>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un réparateur
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Abonnement</TableHead>
              <TableHead>Réparations</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairers.map((repairer) => {
              const tierInfo = getTierInfo(repairer.subscription_tier);
              return (
                <TableRow key={repairer.id}>
                  <TableCell className="font-medium">{repairer.name}</TableCell>
                  <TableCell>{repairer.email}</TableCell>
                  <TableCell>{repairer.phone}</TableCell>
                  <TableCell>{repairer.city}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {tierInfo.icon}
                      <Badge className={tierInfo.color}>
                        {tierInfo.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{repairer.total_repairs}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{repairer.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewProfile(repairer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RepairersTable;
