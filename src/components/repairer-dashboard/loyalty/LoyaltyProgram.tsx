
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star, Crown, Target, TrendingUp } from 'lucide-react';

interface LoyaltyProgramProps {
  demoModeEnabled: boolean;
}

const LoyaltyProgram: React.FC<LoyaltyProgramProps> = ({ demoModeEnabled }) => {
  const currentLevel = {
    name: 'Expert',
    icon: Trophy,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    points: 2850,
    maxPoints: 3000,
    benefits: [
      'Priorité dans les résultats de recherche',
      'Badge "Expert" sur votre profil',
      'Réduction de 10% sur les outils premium',
      'Support prioritaire'
    ]
  };

  const nextLevel = {
    name: 'Maître',
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    requiredPoints: 3000,
    benefits: [
      'Visibilité maximale',
      'Badge "Maître" doré',
      'Réduction de 20% sur tous les outils',
      'Accès aux fonctionnalités beta'
    ]
  };

  const achievements = [
    {
      id: 1,
      name: 'Premier pas',
      description: 'Première réparation terminée',
      icon: Star,
      earned: true,
      points: 50,
      date: '2024-01-10'
    },
    {
      id: 2,
      name: 'Satisfaction client',
      description: '10 avis 5 étoiles',
      icon: Award,
      earned: true,
      points: 200,
      date: '2024-01-20'
    },
    {
      id: 3,
      name: 'Spécialiste',
      description: '50 réparations complétées',
      icon: Trophy,
      earned: true,
      points: 500,
      date: '2024-02-15'
    },
    {
      id: 4,
      name: 'Expert certifié',
      description: '100 réparations + certification',
      icon: Crown,
      earned: false,
      points: 1000,
      progress: 75
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'TechPro Réparations', points: 5420, badge: 'Maître' },
    { rank: 2, name: 'Mobile Express', points: 4850, badge: 'Maître' },
    { rank: 3, name: 'Vous', points: 2850, badge: 'Expert' },
    { rank: 4, name: 'Repair Center', points: 2640, badge: 'Expert' },
    { rank: 5, name: 'Quick Fix', points: 2310, badge: 'Expert' }
  ];

  const weeklyMissions = [
    {
      name: 'Réparations rapides',
      description: 'Terminer 5 réparations en moins de 2h',
      progress: 3,
      total: 5,
      points: 150,
      deadline: '2024-01-21'
    },
    {
      name: 'Satisfaction client',
      description: 'Obtenir 3 avis 5 étoiles',
      progress: 1,
      total: 3,
      points: 100,
      deadline: '2024-01-21'
    },
    {
      name: 'Nouveaux clients',
      description: 'Servir 5 nouveaux clients',
      progress: 4,
      total: 5,
      points: 200,
      deadline: '2024-01-21'
    }
  ];

  const progressPercentage = (currentLevel.points / currentLevel.maxPoints) * 100;

  return (
    <div className="space-y-6">
      {demoModeEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Mode Démonstration
            </Badge>
            <span className="text-sm text-blue-700">
              Programme de fidélisation avec données d'exemple
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Niveau actuel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <currentLevel.icon className={`h-6 w-6 ${currentLevel.color}`} />
              Niveau {currentLevel.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progression vers {nextLevel.name}</span>
              <span className="text-sm font-medium">{currentLevel.points}/{currentLevel.maxPoints} pts</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">{nextLevel.requiredPoints - currentLevel.points} points</span> pour le niveau suivant
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Avantages actuels :</h4>
              <ul className="text-sm space-y-1">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Classement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Classement régional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.name === 'Vous' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {entry.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missions hebdomadaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Missions hebdomadaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weeklyMissions.map((mission, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{mission.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{mission.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression</span>
                    <span>{mission.progress}/{mission.total}</span>
                  </div>
                  <Progress value={(mission.progress / mission.total) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{mission.points} pts
                    </Badge>
                    <span className="text-gray-500">Expire le {new Date(mission.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Succès */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Succès débloqués
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 border rounded-lg ${
                achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <achievement.icon className={`h-5 w-5 ${
                      achievement.earned ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.earned ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-100 text-green-800">
                          +{achievement.points} pts
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Débloqué le {new Date(achievement.date!).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyProgram;
