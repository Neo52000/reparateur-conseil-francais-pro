import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';

interface PappersStatsProps {
  logs: ScrapingLog[];
}

const PappersStats = ({ logs }: PappersStatsProps) => {
  const completedLogs = logs.filter(log => log.status === 'completed');
  
  const getTotalStats = () => {
    const totalVerified = completedLogs.reduce((sum, log) => sum + (log.items_pappers_verified || 0), 0);
    const totalRejected = completedLogs.reduce((sum, log) => sum + (log.items_pappers_rejected || 0), 0);
    const totalApiCalls = completedLogs.reduce((sum, log) => sum + (log.pappers_api_calls || 0), 0);
    const totalProcessed = completedLogs.reduce((sum, log) => sum + (log.items_scraped || 0), 0);
    
    return { totalVerified, totalRejected, totalApiCalls, totalProcessed };
  };

  const { totalVerified, totalRejected, totalApiCalls, totalProcessed } = getTotalStats();

  const verificationRate = totalProcessed > 0 ? Math.round((totalVerified / totalProcessed) * 100) : 0;
  const rejectionRate = totalVerified > 0 ? Math.round((totalRejected / totalVerified) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          Statistiques API Recherche d'Entreprises
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Entreprises vérifiées</p>
                <p className="text-2xl font-bold text-blue-900">{totalVerified}</p>
                <p className="text-xs text-blue-700">{verificationRate}% du total traité</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Entreprises fermées</p>
                <p className="text-2xl font-bold text-red-900">{totalRejected}</p>
                <p className="text-xs text-red-700">{rejectionRate}% des vérifiées</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Appels API</p>
                <p className="text-2xl font-bold text-purple-900">{totalApiCalls}</p>
                <p className="text-xs text-purple-700">Gratuits ✨</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Économies réalisées</p>
                <p className="text-2xl font-bold text-green-900">100%</p>
                <p className="text-xs text-green-700">API gouvernementale</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            🇫🇷 API Recherche d'Entreprises - Gouvernement Français
          </h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• <strong>Gratuite</strong> : Aucun coût d'utilisation</li>
            <li>• <strong>Officielle</strong> : Données directes du registre français des entreprises</li>
            <li>• <strong>Fiable</strong> : Source autoritaire pour le statut des entreprises</li>
            <li>• <strong>Complète</strong> : SIRET, SIREN, statut administratif, dates de création/cessation</li>
            <li>• <strong>Illimitée</strong> : Pas de quota ni de restriction d'usage</li>
          </ul>
        </div>

        {completedLogs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Dernières vérifications</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {completedLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <span>{log.source}</span>
                  <div className="flex space-x-4 text-gray-600">
                    <span>✅ {log.items_pappers_verified || 0}</span>
                    <span>❌ {log.items_pappers_rejected || 0}</span>
                    <span>🔄 {log.pappers_api_calls || 0} appels</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PappersStats;
