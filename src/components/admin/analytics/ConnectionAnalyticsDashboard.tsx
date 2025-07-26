/**
 * Dashboard des analytics de connexion pour les administrateurs
 * Affiche les statistiques de session, connexions/déconnexions, etc.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useConnectionStats } from '@/hooks/analytics/useConnectionAnalytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  LogIn, 
  LogOut, 
  Clock, 
  TrendingUp,
  Activity
} from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export const ConnectionAnalyticsDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const { stats, loading, refetch } = useConnectionStats(startDate, endDate);

  // Calculs des métriques
  const totalLogins = stats.filter(s => s.event_type === 'login').reduce((acc, s) => acc + s.event_count, 0);
  const totalLogouts = stats.filter(s => s.event_type === 'logout').reduce((acc, s) => acc + s.event_count, 0);
  const totalTimeouts = stats.filter(s => s.event_type === 'session_timeout').reduce((acc, s) => acc + s.event_count, 0);
  
  const uniqueUsers = Math.max(...stats.map(s => s.unique_users), 0);
  const avgSessionTime = stats
    .filter(s => s.event_type === 'logout' && s.avg_session_duration)
    .reduce((acc, s, _, arr) => acc + (s.avg_session_duration / arr.length), 0);

  // Données pour les graphiques
  const dailyActivity = stats
    .reduce((acc: any[], stat) => {
      const existing = acc.find(item => item.date === stat.date);
      if (existing) {
        existing[stat.event_type] = stat.event_count;
      } else {
        acc.push({
          date: stat.date,
          [stat.event_type]: stat.event_count
        });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const roleDistribution = stats
    .filter(s => s.event_type === 'login')
    .reduce((acc: any[], stat) => {
      const existing = acc.find(item => item.role === stat.user_role);
      if (existing) {
        existing.count += stat.event_count;
      } else {
        acc.push({
          role: stat.user_role || 'unknown',
          count: stat.event_count
        });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres de date */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics de Connexion</h2>
          <p className="text-muted-foreground">
            Suivi des sessions utilisateur et patterns de connexion
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Date de début"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Date de fin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={refetch} disabled={loading} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions Totales</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Sessions ouvertes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Uniques</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(avgSessionTime / 60)}min
            </div>
            <p className="text-xs text-muted-foreground">
              Temps de session moyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Expirées</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Timeouts automatiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activité quotidienne */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Quotidienne</CardTitle>
            <CardDescription>
              Connexions et déconnexions par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="login" name="Connexions" fill="hsl(var(--chart-1))" />
                <Bar dataKey="logout" name="Déconnexions" fill="hsl(var(--chart-2))" />
                <Bar dataKey="session_timeout" name="Timeouts" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution par rôle */}
        <Card>
          <CardHeader>
            <CardTitle>Connexions par Rôle</CardTitle>
            <CardDescription>
              Répartition des connexions selon les rôles utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Sessions</CardTitle>
          <CardDescription>
            Historique détaillé des événements de connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune donnée disponible pour la période sélectionnée
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Rôle</th>
                      <th className="text-right p-2">Événements</th>
                      <th className="text-right p-2">Utilisateurs</th>
                      <th className="text-right p-2">Durée Moy.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">{new Date(stat.date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={
                            stat.event_type === 'login' ? 'default' :
                            stat.event_type === 'logout' ? 'secondary' : 'destructive'
                          }>
                            {stat.event_type}
                          </Badge>
                        </td>
                        <td className="p-2">{stat.user_role || 'N/A'}</td>
                        <td className="p-2 text-right">{stat.event_count}</td>
                        <td className="p-2 text-right">{stat.unique_users}</td>
                        <td className="p-2 text-right">
                          {stat.avg_session_duration ? 
                            `${Math.round(stat.avg_session_duration / 60)}min` : 
                            'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};