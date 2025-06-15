
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddRepairerModal from '@/components/AddRepairerModal';
import RepairerTableRow from './RepairerTableRow';

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
  onRefresh: () => void;
}

const RepairersTable: React.FC<RepairersTableProps> = ({ repairers, onViewProfile, onRefresh }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleDeleteRepairer = async (repairerId: string) => {
    setLoading(repairerId);
    try {
      // En réalité, on devrait supprimer de la vraie table des réparateurs
      // Pour l'instant, on simule juste une suppression
      console.log('Suppression du réparateur:', repairerId);
      
      toast({
        title: "Succès",
        description: "Réparateur supprimé avec succès"
      });
      
      onRefresh();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (repairerId: string, currentStatus: boolean) => {
    setLoading(repairerId);
    try {
      // Simulation du changement de statut
      console.log('Changement de statut pour:', repairerId, 'vers:', !currentStatus);
      
      toast({
        title: "Succès",
        description: `Statut ${!currentStatus ? 'activé' : 'désactivé'} avec succès`
      });
      
      onRefresh();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleAddSuccess = () => {
    onRefresh();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Réparateurs</CardTitle>
          <Button onClick={() => setAddModalOpen(true)}>
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
