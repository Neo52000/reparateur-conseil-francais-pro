import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSystemDiagnostics } from '@/hooks/useSystemDiagnostics';
import { Bot, Zap, Brain, HelpCircle } from 'lucide-react';

const ChatModeIndicator: React.FC = () => {
  const { diagnostics, canUseAI, shouldUseFallback, isHealthy } = useSystemDiagnostics();

  const getModeConfig = () => {
    if (canUseAI && !shouldUseFallback) {
      return {
        icon: Bot,
        label: 'IA Avancée',
        description: 'Utilisation des services IA pour des réponses optimales',
        color: 'bg-success text-success-foreground',
        emoji: '🤖'
      };
    } else if (diagnostics.recommendedMode === 'hybrid') {
      return {
        icon: Zap,
        label: 'Mode Hybride',
        description: 'Basculement intelligent entre IA et mode local',
        color: 'bg-warning text-warning-foreground',
        emoji: '🔄'
      };
    } else {
      return {
        icon: Brain,
        label: 'Assistant Local',
        description: 'Réponses intelligentes basées sur notre base de connaissances',
        color: 'bg-primary text-primary-foreground',
        emoji: '💡'
      };
    }
  };

  const modeConfig = getModeConfig();
  const IconComponent = modeConfig.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="secondary" 
              className={`${modeConfig.color} text-xs px-2 py-1 flex items-center gap-1`}
            >
              <IconComponent className="h-3 w-3" />
              {modeConfig.label}
            </Badge>
            {!isHealthy && (
              <HelpCircle className="h-3 w-3 text-muted-foreground opacity-60" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{modeConfig.emoji}</span>
              <span className="font-medium">{modeConfig.label}</span>
            </div>
            <p className="text-xs">{modeConfig.description}</p>
            <div className="text-xs text-muted-foreground">
              {diagnostics.isOnline ? (
                <span>🌐 Connecté • Dernière vérif: {diagnostics.systemStatus.lastChecked.toLocaleTimeString()}</span>
              ) : (
                <span>📴 Mode hors ligne • Fonctionnement local garanti</span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ChatModeIndicator;