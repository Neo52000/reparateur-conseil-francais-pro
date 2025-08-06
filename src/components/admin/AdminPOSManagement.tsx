import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart3, Settings, Eye, Monitor } from 'lucide-react';
import POSInterface from '../pos/POSInterface';
import POSDashboard from './super-admin/POSDashboard';
import { useToast } from '@/hooks/use-toast';

const AdminPOSManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'interface'>('dashboard');
  const { toast } = useToast();

  const handleViewInterface = () => {
    setActiveView('interface');
    toast({
      title: "Interface POS",
      description: "Affichage de l'interface POS comme vue par les réparateurs",
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
            Administration POS
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
              ? 'Vue d\'administration complète des systèmes POS'
              : 'Interface POS telle que vue par les réparateurs'
            }
          </p>
        </CardContent>
      </Card>

      {/* Contenu conditionnel */}
      {activeView === 'dashboard' ? (
        <POSDashboard />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Interface POS - Vue Réparateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/10">
              <POSInterface />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPOSManagement;