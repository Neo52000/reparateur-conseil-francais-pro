import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Globe, 
  Server, 
  Zap, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import { MonitorDashboard } from './MonitorDashboard';
import { MonitorsList } from './MonitorsList';
import { IncidentsManager } from './IncidentsManager';
import { BusinessMetrics } from './BusinessMetrics';
import { StatusPages } from './StatusPages';
import { NotificationChannels } from './NotificationChannels';
import { useMonitoringData } from '@/hooks/useMonitoringData';

export const CheckmateMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { stats: overviewStats, loading } = useMonitoringData();

  return (
    <div className="space-y-6">
      {/* Header avec stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalMonitors}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="bg-success/10 text-success">
                {overviewStats.upMonitors} UP
              </Badge>
              <Badge variant="destructive" className="bg-destructive/10">
                {overviewStats.downMonitors} DOWN
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Moyenne sur 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{overviewStats.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Disponibilité moyenne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.incidents}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="monitors" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Monitors
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Status Pages
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <MonitorDashboard />
        </TabsContent>

        <TabsContent value="monitors">
          <MonitorsList />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentsManager />
        </TabsContent>

        <TabsContent value="business">
          <BusinessMetrics />
        </TabsContent>

        <TabsContent value="status">
          <StatusPages />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationChannels />
        </TabsContent>
      </Tabs>
    </div>
  );
};