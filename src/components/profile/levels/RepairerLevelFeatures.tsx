import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Lock,
  Star,
  Crown,
  ArrowRight,
  Phone,
  Calendar,
  MessageSquare,
  BarChart3,
  Award,
  MapPin,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepairerLevel } from './RepairerLevelBadge';
import { Link } from 'react-router-dom';

interface FeatureItem {
  name: string;
  icon: React.ElementType;
  levels: RepairerLevel[];
  premium?: boolean;
}

const allFeatures: FeatureItem[] = [
  { name: 'Fiche visible sur la plateforme', icon: MapPin, levels: [0, 1, 2, 3] },
  { name: 'Téléphone affiché', icon: Phone, levels: [1, 2, 3] },
  { name: 'Email de contact', icon: MessageSquare, levels: [1, 2, 3] },
  { name: 'Devis en ligne', icon: Zap, levels: [2, 3], premium: true },
  { name: 'Prise de RDV en ligne', icon: Calendar, levels: [2, 3], premium: true },
  { name: 'Gestion des avis clients', icon: Star, levels: [2, 3], premium: true },
  { name: 'Tableau de bord statistiques', icon: BarChart3, levels: [2, 3], premium: true },
  { name: 'Académie Pro (formations)', icon: Award, levels: [2, 3], premium: true },
  { name: 'Priorité dans les résultats', icon: TrendingUp, levels: [2, 3], premium: true },
  { name: 'Exclusivité zone géographique', icon: Crown, levels: [3], premium: true },
  { name: 'Caisse NF525 intégrée', icon: Zap, levels: [3], premium: true }
];

interface RepairerLevelFeaturesProps {
  currentLevel: RepairerLevel;
  seoScore?: number;
  completionPercent?: number;
  className?: string;
}

const RepairerLevelFeatures: React.FC<RepairerLevelFeaturesProps> = ({
  currentLevel,
  seoScore = 0,
  completionPercent = 0,
  className
}) => {
  const getNextLevel = (): RepairerLevel | null => {
    if (currentLevel >= 3) return null;
    return (currentLevel + 1) as RepairerLevel;
  };

  const nextLevel = getNextLevel();

  const levelNames: Record<RepairerLevel, string> = {
    0: 'Non revendiqué',
    1: 'Gratuit',
    2: 'Premium',
    3: 'Exclusif'
  };

  const levelColors: Record<RepairerLevel, string> = {
    0: 'text-muted-foreground',
    1: 'text-blue-600',
    2: 'text-amber-600',
    3: 'text-purple-600'
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Niveau actuel : <span className={levelColors[currentLevel]}>{levelNames[currentLevel]}</span></span>
          {currentLevel > 0 && (
            <div className="text-sm font-normal text-muted-foreground">
              Score SEO : <span className="font-semibold text-foreground">{seoScore}/100</span>
            </div>
          )}
        </CardTitle>
        
        {currentLevel > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Complétion du profil</span>
              <span className="font-medium">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-2">
          {allFeatures.map((feature, index) => {
            const isAvailable = feature.levels.includes(currentLevel);
            const Icon = feature.icon;
            
            return (
              <div 
                key={index}
                className={cn(
                  'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                  isAvailable 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-muted/50'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-full',
                  isAvailable 
                    ? 'bg-green-100 dark:bg-green-900/40' 
                    : 'bg-muted'
                )}>
                  {isAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 flex items-center gap-2">
                  <Icon className={cn(
                    'h-4 w-4',
                    isAvailable ? 'text-foreground' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-sm',
                    isAvailable ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {feature.name}
                  </span>
                  {feature.premium && !isAvailable && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      Premium+
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {nextLevel && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                {currentLevel === 0 
                  ? 'Revendiquez votre fiche pour débloquer plus de fonctionnalités'
                  : `Passez au niveau ${levelNames[nextLevel]} pour plus de visibilité`
                }
              </p>
            </div>
            
            <Link to={currentLevel === 0 ? '/repairer/auth' : '/repairer/subscription'}>
              <Button className="w-full" size="lg">
                {currentLevel === 0 ? 'Revendiquer ma fiche' : `Passer au niveau ${levelNames[nextLevel]}`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepairerLevelFeatures;
