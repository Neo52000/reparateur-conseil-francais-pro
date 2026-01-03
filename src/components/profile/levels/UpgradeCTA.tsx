import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Crown, 
  ArrowRight,
  Zap,
  TrendingUp,
  Shield,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepairerLevel } from './RepairerLevelBadge';
import { Link } from 'react-router-dom';

interface UpgradeCTAProps {
  currentLevel: RepairerLevel;
  businessName?: string;
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

const upgradeConfig: Record<1 | 2, {
  targetLevel: RepairerLevel;
  title: string;
  subtitle: string;
  features: string[];
  icon: React.ElementType;
  price: string;
  badgeText: string;
  gradient: string;
}> = {
  1: {
    targetLevel: 2,
    title: 'Passez au Premium',
    subtitle: 'Multipliez vos demandes de devis par 3',
    features: [
      'Devis et RDV en ligne',
      'Priorité dans les résultats',
      'Statistiques détaillées',
      'Académie Pro'
    ],
    icon: Star,
    price: '49€/mois',
    badgeText: 'Recommandé',
    gradient: 'from-amber-500/10 to-orange-500/10'
  },
  2: {
    targetLevel: 3,
    title: 'Devenez Partenaire Exclusif',
    subtitle: 'Dominez votre zone géographique',
    features: [
      'Exclusivité sur votre ville',
      'Caisse NF525 intégrée',
      'Support prioritaire',
      'Badge officiel TopReparateurs'
    ],
    icon: Crown,
    price: '299€/mois',
    badgeText: 'Exclusif',
    gradient: 'from-purple-500/10 to-pink-500/10'
  }
};

const UpgradeCTA: React.FC<UpgradeCTAProps> = ({
  currentLevel,
  businessName,
  variant = 'card',
  className
}) => {
  // Ne pas afficher si niveau 0 (utiliser ClaimProfileCTA) ou niveau 3 (déjà max)
  if (currentLevel === 0 || currentLevel === 3) return null;

  const config = upgradeConfig[currentLevel as 1 | 2];
  const Icon = config.icon;

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-4 p-4 rounded-lg border',
        `bg-gradient-to-r ${config.gradient}`,
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{config.title}</p>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>
        <Link to="/repairer/subscription">
          <Button size="sm">
            Découvrir
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'p-6 rounded-xl border-2 border-dashed border-primary/30',
        `bg-gradient-to-r ${config.gradient}`,
        className
      )}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground">{config.title}</h3>
                <p className="text-muted-foreground">{config.subtitle}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {config.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {config.badgeText}
            </Badge>
            <div className="text-2xl font-bold text-foreground">{config.price}</div>
            <Link to="/repairer/subscription">
              <Button size="lg" className="mt-2">
                Passer au niveau supérieur
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={cn(
      'overflow-hidden border-2 border-primary/20',
      className
    )}>
      <div className={cn('p-1', `bg-gradient-to-r ${config.gradient}`)}>
        <CardContent className="bg-card rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">{config.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {config.badgeText}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{config.subtitle}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {config.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3 text-green-600" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-foreground">{config.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">HT</span>
                </div>
                <Link to="/repairer/subscription">
                  <Button>
                    Découvrir
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default UpgradeCTA;
