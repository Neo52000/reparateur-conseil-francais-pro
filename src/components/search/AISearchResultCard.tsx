/**
 * Carte de résultat de recherche IA
 */

import React from 'react';
import { Star, MapPin, Phone, CheckCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MatchedRepairer } from '@/services/search';
import { RepairerLevelBadge } from '@/components/profile/levels';

interface AISearchResultCardProps {
  repairer: MatchedRepairer;
  rank?: number;
  onSelect?: (repairer: MatchedRepairer) => void;
  onContact?: (repairer: MatchedRepairer) => void;
  showMatchScore?: boolean;
  compact?: boolean;
}

export const AISearchResultCard: React.FC<AISearchResultCardProps> = ({
  repairer,
  rank,
  onSelect,
  onContact,
  showMatchScore = false,
  compact = false,
}) => {
  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };
  
  const formatMatchScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50",
        rank === 1 && "ring-2 ring-primary/30 bg-primary/5",
        compact ? "p-3" : "p-4"
      )}
      onClick={() => onSelect?.(repairer)}
    >
      <CardContent className="p-0">
        <div className="flex gap-4">
          {/* Rank indicator */}
          {rank && rank <= 3 && (
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              rank === 1 && "bg-yellow-500 text-white",
              rank === 2 && "bg-gray-400 text-white",
              rank === 3 && "bg-amber-600 text-white",
            )}>
              {rank}
            </div>
          )}
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg truncate">
                    {repairer.name}
                  </h3>
                  {repairer.isVerified && (
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                  <RepairerLevelBadge 
                    level={repairer.repairerLevel as 0 | 1 | 2 | 3} 
                    size="sm" 
                  />
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{repairer.city}</span>
                    {repairer.distance && (
                      <span className="font-medium text-foreground">
                        • {formatDistance(repairer.distance)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">
                      {repairer.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Match score */}
              {showMatchScore && (
                <Badge 
                  variant={repairer.matchScore >= 0.7 ? "default" : "secondary"}
                  className="flex-shrink-0"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {formatMatchScore(repairer.matchScore)}
                </Badge>
              )}
            </div>
            
            {/* Match reasons */}
            {repairer.matchReasons.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {repairer.matchReasons.slice(0, 3).map((reason, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Specialties */}
            {repairer.specialties.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1 mt-2">
                {repairer.specialties.slice(0, 4).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {repairer.specialties.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{repairer.specialties.length - 4}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Actions */}
            {!compact && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(repairer);
                  }}
                >
                  Voir le profil
                </Button>
                
                {repairer.phone && repairer.repairerLevel >= 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContact?.(repairer);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Contacter
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISearchResultCard;
