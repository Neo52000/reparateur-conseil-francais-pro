import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Award, 
  Shield, 
  Star, 
  Verified, 
  Trophy,
  Clock,
  MapPin,
  Zap,
  Target,
  Crown,
  Gem,
  CheckCircle
} from 'lucide-react';

export interface RepairerBadge {
  id: string;
  type: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  level?: 'bronze' | 'silver' | 'gold' | 'diamond';
  criteria?: string;
  icon?: string;
}

interface RepairerBadgesProps {
  badges: RepairerBadge[];
  showAll?: boolean;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getBadgeIcon = (type: string, level?: string) => {
  const icons = {
    'qualirepar': Shield,
    'siret_verified': Verified,
    'multi_specialist': Star,
    'service_247': Clock,
    'local_expert': MapPin,
    'fast_response': Zap,
    'precision_expert': Target,
    'premium_member': Crown,
    'excellence': Gem,
    'certified': CheckCircle,
    'achievement': Trophy,
    'default': Award
  };

  return icons[type as keyof typeof icons] || icons.default;
};

const getBadgeColors = (type: string, level?: string, earned?: boolean) => {
  if (!earned) {
    return {
      bg: 'bg-gray-100 border-gray-200',
      text: 'text-gray-400',
      iconColor: 'text-gray-400'
    };
  }

  const levelColors = {
    diamond: {
      bg: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300',
      text: 'text-purple-800',
      iconColor: 'text-purple-600'
    },
    gold: {
      bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400',
      text: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    silver: {
      bg: 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400',
      text: 'text-gray-800',
      iconColor: 'text-gray-600'
    },
    bronze: {
      bg: 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-400',
      text: 'text-orange-800',
      iconColor: 'text-orange-600'
    }
  };

  if (level && levelColors[level]) {
    return levelColors[level];
  }

  const typeColors = {
    'qualirepar': {
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400',
      text: 'text-green-800',
      iconColor: 'text-green-600'
    },
    'siret_verified': {
      bg: 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-400',
      text: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    'premium_member': {
      bg: 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-400',
      text: 'text-purple-800',
      iconColor: 'text-purple-600'
    },
    'default': {
      bg: 'bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30',
      text: 'text-primary',
      iconColor: 'text-primary'
    }
  };

  return typeColors[type as keyof typeof typeColors] || typeColors.default;
};

const BadgeTooltipContent: React.FC<{ badge: RepairerBadge }> = ({ badge }) => (
  <div className="space-y-2 max-w-xs">
    <div className="font-semibold text-sm">{badge.name}</div>
    <div className="text-xs text-muted-foreground">{badge.description}</div>
    {badge.criteria && (
      <div className="text-xs">
        <span className="font-medium">Critères:</span> {badge.criteria}
      </div>
    )}
    {badge.earnedAt && (
      <div className="text-xs text-muted-foreground">
        Obtenu le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
      </div>
    )}
  </div>
);

const RepairerBadges: React.FC<RepairerBadgesProps> = ({
  badges,
  showAll = false,
  animate = true,
  size = 'md',
  className = ''
}) => {
  const displayBadges = showAll ? badges : badges.filter(badge => badge.earned);
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    hover: { scale: 1.05, rotate: 2 }
  };

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <motion.div
        className={`flex flex-wrap gap-2 ${className}`}
        variants={animate ? containerVariants : undefined}
        initial={animate ? "hidden" : undefined}
        animate={animate ? "visible" : undefined}
      >
        {displayBadges.map((badge, index) => {
          const IconComponent = getBadgeIcon(badge.type, badge.level);
          const colors = getBadgeColors(badge.type, badge.level, badge.earned);
          
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <motion.div
                  variants={animate ? badgeVariants : undefined}
                  whileHover={animate ? "hover" : undefined}
                  className={`inline-flex ${!badge.earned ? 'opacity-50' : ''}`}
                >
                  <Badge
                    variant="outline"
                    className={`
                      ${colors.bg} ${colors.text} border ${sizeClasses[size]}
                      flex items-center gap-1.5 px-2 py-1
                      ${badge.earned ? 'shadow-sm hover:shadow-md' : ''}
                      transition-all duration-200
                      ${!badge.earned ? 'border-dashed' : ''}
                    `}
                  >
                    <IconComponent className={`${iconSizes[size]} ${colors.iconColor} flex-shrink-0`} />
                    <span className="font-medium">{badge.name}</span>
                    {badge.level && badge.earned && (
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </Badge>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <BadgeTooltipContent badge={badge} />
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* Badge de nombre d'autres badges si plus de 3 */}
        {!showAll && badges.filter(b => b.earned).length > 3 && (
          <motion.div
            whileHover={animate ? "hover" : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Badge 
              variant="outline" 
              className={`
                bg-muted border-muted-foreground/20 text-muted-foreground
                ${sizeClasses[size]} px-2 py-1
              `}
            >
              +{badges.filter(b => b.earned).length - 3}
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default RepairerBadges;