import React, { useState } from 'react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import RepairerDashboard from './RepairerDashboard';
import POSInterface from '@/components/pos/POSInterface';
import ModuleSwitcher from '@/components/modules/ModuleSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Wrapper principal pour le dashboard réparateur avec gestion des modules POS/E-commerce
 * Cette composante gère le switch entre Dashboard classique, POS et E-commerce
 */
const RepairerDashboardWithModules: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'pos' | 'ecommerce'>('dashboard');
  const { hasModuleAccess, loading } = useModuleAccess();

  // Vérifier si l'utilisateur a accès au POS/E-commerce
  const hasPosAccess = hasModuleAccess('pos');
  const hasEcommerceAccess = hasModuleAccess('ecommerce');

  // Si l'utilisateur tente d'accéder à un module sans autorisation, rediriger vers dashboard
  React.useEffect(() => {
    if (currentView === 'pos' && !hasPosAccess) {
      setCurrentView('dashboard');
    }
    if (currentView === 'ecommerce' && !hasEcommerceAccess) {
      setCurrentView('dashboard');
    }
  }, [currentView, hasPosAccess, hasEcommerceAccess]);

  const handleViewChange = (view: 'dashboard' | 'pos' | 'ecommerce') => {
    // Vérifier les permissions avant de changer de vue
    if (view === 'pos' && !hasPosAccess) {
      console.warn('Accès POS non autorisé');
      return;
    }
    if (view === 'ecommerce' && !hasEcommerceAccess) {
      console.warn('Accès E-commerce non autorisé');
      return;
    }
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div>Chargement des modules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation entre modules (affiché seulement si au moins un module est actif ou on est sur le dashboard) */}
      {(currentView === 'dashboard' || hasPosAccess || hasEcommerceAccess) && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            {currentView !== 'dashboard' && (
              <div className="mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au Dashboard
                </Button>
              </div>
            )}
            
            {currentView === 'dashboard' && (
              <ModuleSwitcher 
                currentView={currentView}
                onViewChange={handleViewChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Contenu principal selon la vue active */}
      <div className={currentView === 'dashboard' ? '' : 'pt-0'}>
        {currentView === 'dashboard' && <RepairerDashboard />}
        
        {currentView === 'pos' && hasPosAccess && (
          <POSInterface />
        )}

        {currentView === 'ecommerce' && hasEcommerceAccess && (
          <div className="min-h-screen flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Module E-commerce</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  L'interface e-commerce est en cours de développement.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full"
                >
                  Retour au Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fallback si accès non autorisé */}
        {((currentView === 'pos' && !hasPosAccess) || (currentView === 'ecommerce' && !hasEcommerceAccess)) && (
          <div className="min-h-screen flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Accès non autorisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas accès à ce module. Veuillez activer le module correspondant.
                </p>
                <Button 
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full"
                >
                  Retour au Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairerDashboardWithModules;