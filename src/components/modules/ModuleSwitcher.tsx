import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  ShoppingCart, 
  CreditCard, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useModuleAccess, ModuleSubscription } from '@/hooks/useModuleAccess';

interface ModuleSwitcherProps {
  currentView: 'dashboard' | 'pos' | 'ecommerce';
  onViewChange: (view: 'dashboard' | 'pos' | 'ecommerce') => void;
}

const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const { 
    modules, 
    loading, 
    hasModuleAccess, 
    getModuleDetails, 
    activateModule 
  } = useModuleAccess();

  const getStatusBadge = (module: ModuleSubscription | null) => {
    if (!module) {
      return <Badge variant="outline">Non activé</Badge>;
    }

    switch (module.payment_status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Impayé</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inactif</Badge>;
    }
  };

  const handleActivateModule = async (moduleType: 'pos' | 'ecommerce') => {
    const success = await activateModule(moduleType);
    if (success && moduleType === 'pos') {
      // Basculer automatiquement vers le POS après activation
      onViewChange('pos');
    }
  };

  const posModule = getModuleDetails('pos');
  const ecommerceModule = getModuleDetails('ecommerce');
  const hasPosAccess = hasModuleAccess('pos');
  const hasEcommerceAccess = hasModuleAccess('ecommerce');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue actuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentView === 'dashboard' && <Monitor className="w-5 h-5" />}
            {currentView === 'pos' && <CreditCard className="w-5 h-5" />}
            {currentView === 'ecommerce' && <ShoppingCart className="w-5 h-5" />}
            Vue actuelle: {
              currentView === 'dashboard' ? 'Dashboard' : 
              currentView === 'pos' ? 'Point de Vente' : 'E-commerce'
            }
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Modules disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dashboard (toujours disponible) */}
        <Card className={currentView === 'dashboard' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </div>
              <Badge variant="default">Inclus</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Interface standard de gestion avec toutes les fonctionnalités de base.
            </p>
            <Button 
              variant={currentView === 'dashboard' ? 'default' : 'outline'}
              onClick={() => onViewChange('dashboard')}
              className="w-full"
              disabled={currentView === 'dashboard'}
            >
              {currentView === 'dashboard' ? 'Vue actuelle' : 'Basculer'}
            </Button>
          </CardContent>
        </Card>

        {/* Module POS */}
        <Card className={currentView === 'pos' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <CardTitle className="text-lg">Point de Vente</CardTitle>
              </div>
              {getStatusBadge(posModule)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Hub central qui absorbe les fonctionnalités dashboard avec caisse NF-525.
            </p>
            <div className="text-sm font-medium mb-4">
              €49,90/mois • €499/an
            </div>
            
            {hasPosAccess ? (
              <Button 
                variant={currentView === 'pos' ? 'default' : 'outline'}
                onClick={() => onViewChange('pos')}
                className="w-full"
              >
                {currentView === 'pos' ? 'Vue actuelle' : (
                  <>Basculer <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => handleActivateModule('pos')}
                className="w-full"
              >
                Activer le module
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Module E-commerce */}
        <Card className={currentView === 'ecommerce' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <CardTitle className="text-lg">E-commerce</CardTitle>
              </div>
              {getStatusBadge(ecommerceModule)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Boutique en ligne personnalisée avec gestion complète des commandes.
            </p>
            <div className="text-sm font-medium mb-4">
              €89/mois • €890/an
            </div>
            
            {hasEcommerceAccess ? (
              <Button 
                variant={currentView === 'ecommerce' ? 'default' : 'outline'}
                onClick={() => onViewChange('ecommerce')}
                className="w-full"
              >
                {currentView === 'ecommerce' ? 'Vue actuelle' : (
                  <>Basculer <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => handleActivateModule('ecommerce')}
                className="w-full"
              >
                Activer le module
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations sur la synchronisation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Synchronisation intelligente
              </h4>
              <p className="text-sm text-blue-700">
                {hasPosAccess && !hasEcommerceAccess && (
                  "Le POS synchronise automatiquement vos données avec le dashboard. Toutes vos informations sont centralisées."
                )}
                {!hasPosAccess && hasEcommerceAccess && (
                  "Votre boutique e-commerce se synchronise avec le dashboard pour maintenir l'inventaire à jour."
                )}
                {hasPosAccess && hasEcommerceAccess && (
                  "Le POS agit comme hub central : Dashboard ↔ POS ↔ E-commerce. Synchronisation complète en temps réel."
                )}
                {!hasPosAccess && !hasEcommerceAccess && (
                  "Activez les modules POS et/ou E-commerce pour bénéficier de la synchronisation automatique des données."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleSwitcher;