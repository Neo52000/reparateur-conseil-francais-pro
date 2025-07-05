import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, RefreshCw, Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  stats?: {
    totalRepairers: number;
    activeModules: number;
    monthlyRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  onRefresh?: () => void;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  children,
  title,
  subtitle,
  stats,
  onRefresh
}) => {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Global */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Indicateurs temps réel */}
              {stats && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-admin-blue-light rounded-lg">
                    <Users className="h-4 w-4 text-admin-blue" />
                    <span className="text-sm font-medium">{stats.totalRepairers}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-admin-green-light rounded-lg">
                    <Activity className="h-4 w-4 text-admin-green" />
                    <span className="text-sm font-medium">{stats.activeModules}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-admin-purple-light rounded-lg">
                    <TrendingUp className="h-4 w-4 text-admin-purple" />
                    <span className="text-sm font-medium">{stats.monthlyRevenue}€</span>
                  </div>
                  <Badge 
                    variant={stats.systemHealth === 'healthy' ? 'default' : 
                            stats.systemHealth === 'warning' ? 'secondary' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {stats.systemHealth === 'critical' && <AlertTriangle className="h-3 w-3" />}
                    {stats.systemHealth === 'healthy' ? 'Système OK' : 
                     stats.systemHealth === 'warning' ? 'Attention' : 'Critique'}
                  </Badge>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => console.log('Notifications')}>
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => console.log('Paramètres')}>
                  <Settings className="h-4 w-4" />
                </Button>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;