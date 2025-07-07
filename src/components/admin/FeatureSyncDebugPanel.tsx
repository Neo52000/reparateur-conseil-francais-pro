import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Check, AlertTriangle, Clock } from 'lucide-react';
import { useFeatureManagement } from '@/hooks/useFeatureManagement';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useToast } from '@/hooks/use-toast';

const FeatureSyncDebugPanel: React.FC = () => {
  const { toast } = useToast();
  const { demoModeEnabled, toggleDemoMode } = useDemoMode();
  const { 
    loading, 
    planConfigs, 
    planFeatureMatrix, 
    updatePlanPricing 
  } = useFeatureManagement();
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const forceSyncPricingAndFeatures = async () => {
    setSyncStatus('syncing');
    try {
      // Simuler un délai de synchronisation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Forcer un rechargement des données
      window.location.reload();
      
      setLastSync(new Date());
      setSyncStatus('success');
      
      toast({
        title: 'Synchronisation réussie',
        description: 'Les tarifs et fonctionnalités ont été synchronisés.'
      });
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: 'Erreur de synchronisation',
        description: 'Impossible de synchroniser les données.',
        variant: 'destructive'
      });
    }
  };

  const testPriceUpdate = async () => {
    if (planConfigs.length === 0) return;
    
    const testPlan = planConfigs.find(p => p.planName === 'Premium');
    if (!testPlan) return;

    const newPrice = testPlan.planPriceMonthly + 1;
    await updatePlanPricing('Premium', newPrice, testPlan.planPriceYearly + 10);
    
    toast({
      title: 'Test effectué',
      description: `Prix du plan Premium modifié: ${newPrice}€/mois`
    });
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'yellow';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Panneau de Debug - Synchronisation
          <Badge variant="outline" className={`text-${getSyncStatusColor()}-600`}>
            {getSyncStatusIcon()}
            {syncStatus === 'idle' && 'Prêt'}
            {syncStatus === 'syncing' && 'Sync...'}
            {syncStatus === 'success' && 'OK'}
            {syncStatus === 'error' && 'Erreur'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* État du mode démo */}
        <div>
          <h4 className="font-semibold mb-2">Mode Démo</h4>
          <div className="flex items-center gap-4">
            <Badge variant={demoModeEnabled ? "default" : "secondary"}>
              {demoModeEnabled ? 'Activé' : 'Désactivé'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDemoMode}
            >
              {demoModeEnabled ? 'Désactiver' : 'Activer'} le mode démo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {demoModeEnabled 
              ? 'Les données mockées sont affichées' 
              : 'Les vraies données de la base sont utilisées'
            }
          </p>
        </div>

        <Separator />

        {/* Actions de synchronisation */}
        <div>
          <h4 className="font-semibold mb-2">Actions de Synchronisation</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={forceSyncPricingAndFeatures}
              disabled={syncStatus === 'syncing'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Forcer la Sync
            </Button>
            <Button
              variant="outline"
              onClick={testPriceUpdate}
              disabled={loading || demoModeEnabled}
            >
              Test Modif Prix
            </Button>
          </div>
          {lastSync && (
            <p className="text-sm text-muted-foreground mt-2">
              Dernière sync: {lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>

        <Separator />

        {/* Statistiques */}
        <div>
          <h4 className="font-semibold mb-2">État des Données</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Plans chargés:</span>
              <Badge variant="outline" className="ml-2">
                {planConfigs.length}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Fonctionnalités:</span>
              <Badge variant="outline" className="ml-2">
                {planFeatureMatrix.length}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Mode:</span>
              <Badge variant="outline" className="ml-2">
                {demoModeEnabled ? 'Démo' : 'Production'}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Statut:</span>
              <Badge variant="outline" className="ml-2">
                {loading ? 'Chargement...' : 'Prêt'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Instructions */}
        <div>
          <h4 className="font-semibold mb-2">Instructions de Test</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Modifiez un tarif dans l'onglet "Tarification"</p>
            <p>2. Ouvrez /repairer/plans dans un nouvel onglet</p>
            <p>3. Vérifiez que les changements sont synchronisés automatiquement</p>
            <p>4. Utilisez "Forcer la Sync" en cas de problème</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureSyncDebugPanel;