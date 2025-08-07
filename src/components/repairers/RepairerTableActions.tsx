
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

interface RepairerTableActionsProps {
  repairer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    subscription_tier?: string;
  };
  onViewProfile: (id: string) => void;
  onRefresh: () => void;
}

const RepairerTableActions = ({ 
  repairer, 
  onViewProfile, 
  onRefresh 
}: RepairerTableActionsProps) => {
  const { logRepairerAction } = useAdminAuditIntegration();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleActivateRepairer = async () => {
    setLoading(true);
    try {
      // Log action for audit trail - actual update will be implemented when is_active field is added
      console.log('Would update repairer active status:', repairer.id);
      // TODO: Implement real update when is_active field is added to repairers table
      
      logRepairerAction('activate', repairer.id, {
        previous_status: 'inactive',
        new_status: 'active',
        repairer_email: repairer.email,
        repairer_name: `${repairer.first_name || ''} ${repairer.last_name || ''}`.trim(),
        activation_reason: 'Manual admin activation'
      }, 'info');

      toast({
        title: "Réparateur activé",
        description: `${repairer.email} a été activé avec succès`,
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateRepairer = async () => {
    setLoading(true);
    try {
      // Log action for audit trail - actual update will be implemented when is_active field is added
      console.log('Would deactivate repairer:', repairer.id);
      // TODO: Implement real update when is_active field is added to repairers table
      
      logRepairerAction('deactivate', repairer.id, {
        previous_status: 'active',
        new_status: 'inactive',
        repairer_email: repairer.email,
        repairer_name: `${repairer.first_name || ''} ${repairer.last_name || ''}`.trim(),
        deactivation_reason: 'Manual admin deactivation',
        subscription_tier: repairer.subscription_tier
      }, 'warning');

      toast({
        title: "Réparateur désactivé",
        description: `${repairer.email} a été désactivé`,
        variant: "destructive"
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de désactiver le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepairer = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${repairer.email} ? Cette action est irréversible.`)) {
      return;
    }

    setLoading(true);
    try {
      // Log action for audit trail - actual deletion will be implemented carefully
      console.log('Would delete repairer:', repairer.id);
      // TODO: Implement real deletion with proper constraints handling
      
      logRepairerAction('delete', repairer.id, {
        repairer_email: repairer.email,
        repairer_name: `${repairer.first_name || ''} ${repairer.last_name || ''}`.trim(),
        deletion_reason: 'Manual admin deletion',
        subscription_tier: repairer.subscription_tier,
        deletion_date: new Date().toISOString()
      }, 'critical');

      toast({
        title: "Réparateur supprimé",
        description: `${repairer.email} a été supprimé définitivement`,
        variant: "destructive"
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewProfile(repairer.id)}>
          <Eye className="mr-2 h-4 w-4" />
          Voir le profil
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => console.log('Edit repairer:', repairer.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        
        {repairer.is_active !== false ? (
          <DropdownMenuItem onClick={handleDeactivateRepairer} disabled={loading}>
            <UserX className="mr-2 h-4 w-4" />
            {loading ? 'Désactivation...' : 'Désactiver'}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleActivateRepairer} disabled={loading}>
            <UserCheck className="mr-2 h-4 w-4" />
            {loading ? 'Activation...' : 'Activer'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={handleDeleteRepairer} 
          className="text-red-600"
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {loading ? 'Suppression...' : 'Supprimer'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RepairerTableActions;
