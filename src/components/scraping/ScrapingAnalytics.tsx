
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useScrapingStatus } from '@/hooks/scraping/useScrapingStatus';
import PappersStats from './PappersStats';
import MassiveScrapingStats from './MassiveScrapingStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';

const ScrapingAnalytics = () => {
  const { logs, loading } = useScrapingStatus();

  const completedLogs = logs.filter(log => log.status === 'completed');
  
  const getTotalStats = () => {
    const totalAdded = completedLogs.reduce((sum, log) => sum + (log.items_added || 0), 0);
    const totalUpdated = completedLogs.reduce((sum, log) => sum + (log.items_updated || 0), 0);
    const totalProcessed = completedLogs.reduce((sum, log) => sum + (log.items_scraped || 0), 0);
    const totalPappersVerified = completedLogs.reduce((sum, log) => sum + (log.items_pappers_verified || 0), 0);
    const totalPappersRejected = completedLogs.reduce((sum, log) => sum + (log.items_pappers_rejected || 0), 0);
    
    return { totalAdded, totalUpdated, totalProcessed, totalPappersVerified, totalPappersRejected };
  };

  const { totalAdded, totalUpdated, totalProcessed, totalPappersVerified, totalPappersRejected } = getTotalStats();

  // Données pour le graphique par source
  const sourceData = completedLogs.reduce((acc, log) => {
    const existing = acc.find(item => item.source === log.source);
    if (existing) {
      existing.added += log.items_added || 0;
      existing.updated += log.items_updated || 0;
      existing.verified += log.items_pappers_verified || 0;
      existing.rejected += log.items_pappers_rejected || 0;
    } else {
      acc.push({
        source: log.source,
        added: log.items_added || 0,
        updated: log.items_updated || 0,
        verified: log.items_pappers_verified || 0,
        rejected: log.items_pappers_rejected || 0
      });
    }
    return acc;
  }, [] as Array<{source: string, added: number, updated: number, verified: number, rejected: number}>);

  // Données pour le graphique de répartition Pappers
  const pappersData = [
    { name: 'Entreprises actives', value: totalPappersVerified - totalPappersRejected, color: '#10B981' },
    { name: 'Entreprises fermées', value: totalPappersRejected, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Brain className="h-6 w-6 animate-pulse mr-2" />
        Chargement des analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <MassiveScrapingStats
        totalAdded={totalAdded}
        totalUpdated={totalUpdated}
        totalProcessed={totalProcessed}
        totalPappersVerified={totalPappersVerified}
        totalPappersRejected={totalPappersRejected}
      />

      {/* Statistiques Pappers détaillées */}
      <PappersStats logs={logs} />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique par source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance par source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="added" fill="#10B981" name="Ajoutés" />
                <Bar dataKey="updated" fill="#3B82F6" name="Mis à jour" />
                <Bar dataKey="verified" fill="#8B5CF6" name="Vérifiés Pappers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique Pappers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Vérification Pappers.fr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pappersData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pappersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur l'efficacité */}
      <Card>
        <CardHeader>
          <CardTitle>Efficacité du système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Taux de réussite</h4>
              <p className="text-2xl font-bold text-green-600">
                {totalProcessed > 0 ? Math.round(((totalAdded + totalUpdated) / totalProcessed) * 100) : 0}%
              </p>
              <p className="text-sm text-green-700">
                {totalAdded + totalUpdated} réparateurs sur {totalProcessed} traités
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Taux de vérification Pappers</h4>
              <p className="text-2xl font-bold text-blue-600">
                {totalProcessed > 0 ? Math.round((totalPappersVerified / totalProcessed) * 100) : 0}%
              </p>
              <p className="text-sm text-blue-700">
                {totalPappersVerified} entreprises vérifiées
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900">Entreprises fermées évitées</h4>
              <p className="text-2xl font-bold text-red-600">
                {totalPappersRejected}
              </p>
              <p className="text-sm text-red-700">
                Entreprises radiées ou fermées filtrées
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingAnalytics;
