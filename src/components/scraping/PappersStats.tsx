
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, XCircle, Database, AlertTriangle } from 'lucide-react';

interface PappersStatsProps {
  logs: Array<{
    id: string;
    source: string;
    status: string;
    items_scraped: number;
    items_added: number;
    items_updated: number;
    items_pappers_verified?: number;
    items_pappers_rejected?: number;
    pappers_api_calls?: number;
    started_at: string;
  }>;
}

const PappersStats = ({ logs }: PappersStatsProps) => {
  const completedLogs = logs.filter(log => log.status === 'completed');
  
  const totalPappersVerified = completedLogs.reduce((sum, log) => sum + (log.items_pappers_verified || 0), 0);
  const totalPappersRejected = completedLogs.reduce((sum, log) => sum + (log.items_pappers_rejected || 0), 0);
  const totalApiCalls = completedLogs.reduce((sum, log) => sum + (log.pappers_api_calls || 0), 0);

  const verificationRate = completedLogs.length > 0 
    ? Math.round((totalPappersVerified / completedLogs.reduce((sum, log) => sum + log.items_scraped, 0)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Vérification Pappers.fr
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Entreprises vérifiées</p>
                  <p className="text-2xl font-bold text-green-900">{totalPappersVerified}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Entreprises fermées</p>
                  <p className="text-2xl font-bold text-red-900">{totalPappersRejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Appels API</p>
                  <p className="text-2xl font-bold text-blue-900">{totalApiCalls}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Taux de vérification</p>
                  <p className="text-2xl font-bold text-purple-900">{verificationRate}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Informations sur Pappers.fr */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">
              🏢 Vérification Pappers.fr
            </h4>
            <ul className="text-xs text-indigo-800 space-y-1">
              <li>• <strong>Statut légal</strong> : Vérification en temps réel du statut des entreprises</li>
              <li>• <strong>Base officielle</strong> : Données directement issues de l'INSEE et Infogreffe</li>
              <li>• <strong>Filtrage automatique</strong> : Exclusion des entreprises radiées ou en liquidation</li>
              <li>• <strong>Cache intelligent</strong> : Évite les requêtes répétées (7 jours de cache)</li>
              <li>• <strong>Liste d'exclusion</strong> : Entreprises fermées sauvegardées pour éviter le re-scraping</li>
            </ul>
          </div>

          {/* Dernières vérifications */}
          {completedLogs.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Dernières vérifications</h4>
              <div className="space-y-2">
                {completedLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{log.source}</span>
                      <Badge variant="secondary">
                        {log.items_pappers_verified || 0} vérifiées
                      </Badge>
                      {(log.items_pappers_rejected || 0) > 0 && (
                        <Badge variant="destructive">
                          {log.items_pappers_rejected} fermées
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        {log.pappers_api_calls || 0} appels API
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.started_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PappersStats;
