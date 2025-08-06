import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Eye, Monitor, ShoppingBag } from 'lucide-react';
import EcommerceDashboard from './super-admin/EcommerceDashboard';
import RepairerEcommerceInterface from '../ecommerce/RepairerEcommerceInterface';
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
              <RepairerEcommerceInterface />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEcommerceManagement;