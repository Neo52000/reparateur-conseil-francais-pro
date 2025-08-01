import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MessageSquare, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface RelaunchLog {
  id: string;
  campaign_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  emails_sent: number;
  sms_sent: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

const AutomatedRelaunchDashboard: React.FC = () => {
  const [logs, setLogs] = useState<RelaunchLog[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmails: 0,
    totalSMS: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const campaignTypes = [
    {
      id: 'incomplete_profiles',
      name: 'Profils incomplets',
      description: 'Relance des réparateurs avec profils incomplets',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'inactive_users',
      name: 'Utilisateurs inactifs',
      description: 'Réactivation des comptes dormants',
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      id: 'abandoned_cart',
      name: 'Paniers abandonnés',
      description: 'Récupération des commandes abandonnées',
      icon: MessageSquare,
      color: 'bg-purple-500'
    },
    {
      id: 'performance_boost',
      name: 'Boost de performance',
      description: 'Suggestions d\'amélioration personnalisées',
      icon: TrendingUp,
      color: 'bg-green-500'
    }
  ];

  useEffect(() => {
    loadRelaunchLogs();
    calculateStats();
  }, []);

  const loadRelaunchLogs = async () => {
    try {
      // Pour l'instant, utiliser des données mockées car la table n'existe pas encore
      const mockLogs: RelaunchLog[] = [
        {
          id: '1',
          campaign_type: 'incomplete_profiles',
          status: 'completed',
          emails_sent: 45,
          sms_sent: 12,
          opened_count: 23,
          clicked_count: 8,
          converted_count: 3,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          campaign_type: 'inactive_users',
          status: 'running',
          emails_sent: 23,
          sms_sent: 8,
          opened_count: 12,
          clicked_count: 4,
          converted_count: 1,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des logs de relance:', error);
    }
  };

  const calculateStats = async () => {
    try {
      // Calculer les statistiques sur les données mockées
      const mockLogs: RelaunchLog[] = [
        {
          id: '1',
          campaign_type: 'incomplete_profiles',
          status: 'completed',
          emails_sent: 45,
          sms_sent: 12,
          opened_count: 23,
          clicked_count: 8,
          converted_count: 3,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          campaign_type: 'inactive_users',
          status: 'running',
          emails_sent: 23,
          sms_sent: 8,
          opened_count: 12,
          clicked_count: 4,
          converted_count: 1,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      const totalEmails = mockLogs.reduce((sum, log) => sum + (log.emails_sent || 0), 0);
      const totalSMS = mockLogs.reduce((sum, log) => sum + (log.sms_sent || 0), 0);
      const totalOpened = mockLogs.reduce((sum, log) => sum + (log.opened_count || 0), 0);
      const totalClicked = mockLogs.reduce((sum, log) => sum + (log.clicked_count || 0), 0);

      setStats({
        totalCampaigns: mockLogs.length,
        activeCampaigns: mockLogs.filter(log => log.status === 'running').length,
        totalEmails,
        totalSMS,
        avgOpenRate: totalEmails > 0 ? (totalOpened / totalEmails) * 100 : 0,
        avgClickRate: totalEmails > 0 ? (totalClicked / totalEmails) * 100 : 0
      });
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
    }
  };

  const launchCampaign = async (campaignType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('automated-relaunch', {
        body: {
          campaignType,
          dryRun: false
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Campagne lancée",
          description: `La campagne "${campaignTypes.find(c => c.id === campaignType)?.name}" a été démarrée`,
        });
        await loadRelaunchLogs();
        await calculateStats();
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du lancement de la campagne:', error);
      toast({
        title: "Erreur de campagne",
        description: error.message || 'Impossible de lancer la campagne',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    const labels = {
      completed: 'Terminé',
      failed: 'Échoué',
      running: 'En cours',
      pending: 'En attente'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Campagnes totales</p>
                <p className="text-lg font-semibold">{stats.totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Campagnes actives</p>
                <p className="text-lg font-semibold">{stats.activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Emails envoyés</p>
                <p className="text-lg font-semibold">{stats.totalEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">SMS envoyés</p>
                <p className="text-lg font-semibold">{stats.totalSMS}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taux d'ouverture</p>
                <p className="text-lg font-semibold">{stats.avgOpenRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taux de clic</p>
                <p className="text-lg font-semibold">{stats.avgClickRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lancement de campagnes */}
      <Card>
        <CardHeader>
          <CardTitle>Lancer une campagne de relance</CardTitle>
          <CardDescription>
            Sélectionnez le type de campagne automatisée à démarrer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaignTypes.map(campaign => {
              const Icon = campaign.icon;
              return (
                <Card key={campaign.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${campaign.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    <Button 
                      onClick={() => launchCampaign(campaign.id)}
                      disabled={loading}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Lancer
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune campagne lancée</p>
                <p className="text-sm">Lancez votre première campagne pour voir les résultats ici</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {campaignTypes.find(c => c.id === log.campaign_type)?.name || log.campaign_type}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Démarré: {formatDate(log.created_at)}
                      </div>
                      {log.completed_at && (
                        <div className="text-sm text-muted-foreground">
                          Terminé: {formatDate(log.completed_at)}
                        </div>
                      )}
                      {log.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          Erreur: {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      📧 {log.emails_sent || 0} | 📱 {log.sms_sent || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      👁️ {log.opened_count || 0} | 🖱️ {log.clicked_count || 0} | ✅ {log.converted_count || 0}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedRelaunchDashboard;