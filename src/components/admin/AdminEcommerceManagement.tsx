import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Eye, Monitor, ShoppingBag } from 'lucide-react';
import EcommerceDashboard from './super-admin/EcommerceDashboard';
import { useToast } from '@/hooks/use-toast';

const AdminEcommerceManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'interface'>('dashboard');
  const { toast } = useToast();

  const handleViewInterface = () => {
    setActiveView('interface');
    toast({
      title: "Interface E-commerce",
      description: "Affichage de l'interface e-commerce comme vue par les réparateurs",
    });
  };

  const handleViewDashboard = () => {
    setActiveView('dashboard');
  };

  // Composant E-commerce simple pour la démo
  const EcommerceInterface = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Produits</p>
                <p className="text-2xl font-bold">124</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold">47</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Monitor className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Visiteurs</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interface E-commerce Réparateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Interface de gestion e-commerce pour les réparateurs
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-center text-muted-foreground">
              Interface e-commerce en cours de développement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation entre les vues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Administration E-commerce
            <div className="flex gap-2">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={handleViewDashboard}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard Admin
              </Button>
              <Button
                variant={activeView === 'interface' ? 'default' : 'outline'}
                size="sm"
                onClick={handleViewInterface}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Interface Réparateur
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {activeView === 'dashboard' 
              ? 'Vue d\'administration complète des boutiques e-commerce'
              : 'Interface e-commerce telle que vue par les réparateurs'
            }
          </p>
        </CardContent>
      </Card>

      {/* Contenu conditionnel */}
      {activeView === 'dashboard' ? (
        <EcommerceDashboard />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Interface E-commerce - Vue Réparateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/10">
              <EcommerceInterface />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEcommerceManagement;