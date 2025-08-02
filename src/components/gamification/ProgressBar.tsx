import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award } from 'lucide-react';

interface ProgressBarProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentLevel,
  currentXP,
  nextLevelXP,
  totalXP,
  className = ''
}) => {
  const progressPercentage = (currentXP / nextLevelXP) * 100;
  
  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (level >= 5) return <Award className="h-4 w-4 text-purple-500" />;
    return <Star className="h-4 w-4 text-blue-500" />;
  };

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Expert Réparation';
    if (level >= 5) return 'Réparateur Confirmé';
    if (level >= 3) return 'Apprenti Réparateur';
    return 'Débutant';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getLevelIcon(currentLevel)}
          <span className="font-semibold text-foreground">
            Niveau {currentLevel}
          </span>
          <Badge variant="secondary" className="text-xs">
            {getLevelTitle(currentLevel)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentXP} / {nextLevelXP} XP
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2 mb-2" />
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{Math.round(progressPercentage)}% vers le niveau {currentLevel + 1}</span>
        <span>{totalXP} XP total</span>
      </div>
    </div>
  );
};

export default ProgressBar;