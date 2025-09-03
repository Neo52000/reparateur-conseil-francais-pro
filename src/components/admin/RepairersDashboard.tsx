import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Star, 
  MapPin, 
  Activity,
  Calendar,
  Target,
  Award,
  Clock
} from 'lucide-react';

interface RepairerStats {
  totalRepairers: number;
  activeRepairers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalRevenue: number;
  totalInterests: number;
}

interface RepairersDashboardProps {
  stats: RepairerStats;
  repairers: any[];
}

const RepairersDashboard: React.FC<RepairersDashboardProps> = ({ stats, repairers }) => {
  // Calculs des métriques avancées
  const averageRating = repairers.length > 0 
    ? repairers.reduce((sum, r) => sum + (r.rating || 0), 0) / repairers.length 
    : 0;

  const totalRepairs = repairers.reduce((sum, r) => sum + (r.total_repairs || 0), 0);
  
  const topPerformers = repairers
    .filter(r => r.total_repairs > 0)
    .sort((a, b) => (b.total_repairs || 0) - (a.total_repairs || 0))
    .slice(0, 5);

  const conversionRate = stats.totalInterests > 0 
    ? ((stats.activeSubscriptions / stats.totalInterests) * 100).toFixed(1)
    : '0';

  const recentRegistrations = repairers
    .filter(r => {
      if (!r.created_at) return false;
      const registrationDate = new Date(r.created_at);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return registrationDate > oneWeekAgo;
    })
    .length;

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réparateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRepairers}</div>
            <p className="text-xs text-muted-foreground">
              +{recentRegistrations} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réparateurs Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRepairers}</div>
            <div className="flex items-center space-x-2 mt-1">
            <Progress 
              value={(stats.activeRepairers / Math.max(stats.totalRepairers, 1)) * 100} 
              className="flex-1" 
            />
            <span className="text-xs text-muted-foreground">
              {Math.round((stats.activeRepairers / Math.max(stats.totalRepairers, 1)) * 100)}%
            </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réparations Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRepairs}</div>
          <p className="text-xs text-muted-foreground">
            Moyenne: {totalRepairs > 0 && stats.totalRepairers > 0 ? (totalRepairs / stats.totalRepairers).toFixed(1) : '0'} par réparateur
          </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
          <div className="flex items-center mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star}
                className={`h-3 w-3 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} abonnés / {stats.totalInterests} intérêts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue}€</div>
          <p className="text-xs text-muted-foreground">
            Annuel estimé: {(stats.monthlyRevenue * 12).toLocaleString('fr-FR')}€
          </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance 7j</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{recentRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Nouveaux réparateurs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Réparateurs (Réparations)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((repairer, index) => (
                <div key={repairer.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{repairer.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {repairer.city}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repairer.rating || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{repairer.total_repairs}</div>
                    <div className="text-sm text-muted-foreground">réparations</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribution géographique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Répartition Géographique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              repairers.reduce((acc, repairer) => {
                const dept = repairer.department || '00';
                acc[dept] = (acc[dept] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 8)
              .map(([dept, count]) => (
                <div key={dept} className="text-center p-3 rounded-lg bg-accent/30">
                  <div className="font-bold text-lg">{count as number}</div>
                  <div className="text-sm text-muted-foreground">Dept. {dept}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes et insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Insights & Alertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.activeRepairers < stats.totalRepairers * 0.5 && stats.totalRepairers > 0 && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Taux d'activation faible:</strong> Seulement {Math.round((stats.activeRepairers / stats.totalRepairers) * 100)}% des réparateurs sont actifs.
                </p>
              </div>
            )}
            
            {recentRegistrations > 5 && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  🚀 <strong>Forte croissance:</strong> {recentRegistrations} nouveaux réparateurs cette semaine !
                </p>
              </div>
            )}

            {averageRating < 4.0 && (
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-sm text-orange-800">
                  📉 <strong>Note moyenne faible:</strong> {averageRating.toFixed(1)}/5. Considérez un programme d'amélioration qualité.
                </p>
              </div>
            )}

            {totalRepairs === 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">
                  🔍 <strong>Aucune réparation enregistrée:</strong> Vérifiez la configuration du système de tracking.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairersDashboard;