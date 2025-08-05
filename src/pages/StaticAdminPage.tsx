import React from 'react';
import PageBuilderPage from '@/pages/admin/PageBuilderPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  Search,
  Bell,
  User,
  LogOut,
  Plus,
  Globe
} from 'lucide-react';

const StaticAdminPage = () => {
  // Récupération du tab depuis l'URL de manière statique
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab') || 'dashboard';

  const renderSimpleTopBar = () => (
    <header className="h-16 bg-wp-header border-b border-wp-header/20 sticky top-0 z-50 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-wp-accent rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-wp-header-foreground font-medium">
              TopRéparateurs.fr - Admin
            </span>
          </div>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-wp-header-foreground text-sm">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );

  const renderNavigation = () => (
    <nav className="bg-background border-b p-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => window.location.href = '/admin?tab=dashboard'}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button 
          variant={activeTab === 'page-builder' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => window.location.href = '/admin?tab=page-builder'}
        >
          <FileText className="w-4 h-4 mr-2" />
          Constructeur de Pages
        </Button>
        <Button 
          variant={activeTab === 'users' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => window.location.href = '/admin?tab=users'}
        >
          <Users className="w-4 h-4 mr-2" />
          Utilisateurs
        </Button>
        <Button 
          variant={activeTab === 'settings' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => window.location.href = '/admin?tab=settings'}
        >
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </Button>
      </div>
    </nav>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'page-builder':
        return <PageBuilderPage />;
      
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Module en cours de développement...</p>
            </CardContent>
          </Card>
        );
      
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuration système...</p>
            </CardContent>
          </Card>
        );
      
      default: // dashboard
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tableau de bord Administrateur</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Bienvenue dans l'interface d'administration simplifiée.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-semibold">Utilisateurs</h3>
                      <p className="text-2xl font-bold">156</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-semibold">Pages</h3>
                      <p className="text-2xl font-bold">23</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-semibold">Analytics</h3>
                      <p className="text-2xl font-bold">98%</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderSimpleTopBar()}
      {renderNavigation()}
      <main className="container mx-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default StaticAdminPage;