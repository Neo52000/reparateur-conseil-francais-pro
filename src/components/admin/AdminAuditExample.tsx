
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';

/**
 * Exemple d'intégration de l'audit dans les actions d'administration
 */
const AdminAuditExample: React.FC = () => {
  const {
    logSubscriptionAction,
    logRepairerAction,
    logPromoCodeAction,
    logCriticalAdminAction
  } = useAdminAuditIntegration();
  const { toast } = useToast();

  const handleSubscriptionApproval = () => {
    const subscriptionId = 'demo-subscription-123';
    
    logSubscriptionAction('approve', subscriptionId, {
      previous_status: 'pending',
      new_status: 'active',
      plan: 'premium',
      approval_reason: 'Manual admin approval'
    }, 'info');

    toast({
      title: "Action enregistrée",
      description: "Approbation d'abonnement loggée avec succès",
    });
  };

  const handleRepairerDeactivation = () => {
    const repairerId = 'demo-repairer-456';
    
    logRepairerAction('deactivate', repairerId, {
      previous_status: 'active',
      new_status: 'inactive',
      deactivation_reason: 'Policy violation',
      violation_type: 'fake_reviews'
    }, 'warning');

    toast({
      title: "Action critique enregistrée",
      description: "Désactivation de réparateur loggée",
      variant: "destructive"
    });
  };

  const handlePromoCodeCreation = () => {
    const promoCodeId = 'demo-promo-789';
    
    logPromoCodeAction('create', promoCodeId, {
      code: 'DEMO2024',
      discount_type: 'percentage',
      discount_value: 20,
      max_uses: 100,
      valid_until: '2024-12-31'
    }, 'info');

    toast({
      title: "Code promo créé",
      description: "Création de code promo enregistrée dans l'audit",
    });
  };

  const handleCriticalAction = () => {
    logCriticalAdminAction('delete', 'system_config', 'database-backup', {
      action: 'database_backup_deletion',
      backup_date: '2024-01-01',
      reason: 'Storage cleanup',
      requires_review: true
    });

    toast({
      title: "Action critique !",
      description: "Suppression de sauvegarde enregistrée - Nécessite une révision",
      variant: "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Démonstration de l'audit automatique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Ces boutons démontrent comment les actions d'administration sont automatiquement 
            enregistrées dans le système d'audit.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleSubscriptionApproval} variant="outline">
              Approuver un abonnement
            </Button>
            
            <Button onClick={handleRepairerDeactivation} variant="destructive">
              Désactiver un réparateur
            </Button>
            
            <Button onClick={handlePromoCodeCreation} variant="secondary">
              Créer un code promo
            </Button>
            
            <Button onClick={handleCriticalAction} variant="destructive">
              Action critique (test)
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Consultez l'onglet "Logs d'audit" pour voir les actions enregistrées en temps réel.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuditExample;
