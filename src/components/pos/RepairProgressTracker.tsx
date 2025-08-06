import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Wrench, 
  Package, 
  TestTube, 
  ShoppingBag,
  Truck,
  XCircle,
  Shield,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import { RepairOrder } from '@/hooks/useRepairManagement';

interface RepairProgressTrackerProps {
  repairOrder: RepairOrder;
  onStatusUpdate?: (status: string) => void;
}

const RepairProgressTracker: React.FC<RepairProgressTrackerProps> = ({ 
  repairOrder, 
  onStatusUpdate 
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const steps = [
    { 
      id: 'diagnostic', 
      label: 'Diagnostic', 
      icon: FileText, 
      color: 'bg-blue-500',
      description: 'Analyse du problème'
    },
    { 
      id: 'quote_pending', 
      label: 'Devis en attente', 
      icon: Clock, 
      color: 'bg-yellow-500',
      description: 'Devis généré et envoyé'
    },
    { 
      id: 'quote_accepted', 
      label: 'Devis accepté', 
      icon: CheckCircle, 
      color: 'bg-orange-500',
      description: 'Client a validé le devis'
    },
    { 
      id: 'in_progress', 
      label: 'En cours', 
      icon: Wrench, 
      color: 'bg-purple-500',
      description: 'Réparation en cours'
    },
    { 
      id: 'waiting_parts', 
      label: 'Attente pièces', 
      icon: Package, 
      color: 'bg-red-500',
      description: 'En attente de pièces'
    },
    { 
      id: 'testing', 
      label: 'Tests', 
      icon: TestTube, 
      color: 'bg-indigo-500',
      description: 'Vérification finale'
    },
    { 
      id: 'completed', 
      label: 'Terminé', 
      icon: CheckCircle, 
      color: 'bg-green-500',
      description: 'Réparation terminée'
    },
    { 
      id: 'ready_pickup', 
      label: 'Prêt à récupérer', 
      icon: ShoppingBag, 
      color: 'bg-emerald-500',
      description: 'Disponible pour retrait'
    },
    { 
      id: 'delivered', 
      label: 'Livré', 
      icon: Truck, 
      color: 'bg-gray-500',
      description: 'Remis au client'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === repairOrder.status);
  const completedSteps = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;
  
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getProgressPercentage = () => {
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Déclencher une animation quand le statut change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [repairOrder.status]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* En-tête avec progression globale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Progression de la réparation</h3>
              <Badge variant="outline" className="text-sm">
                {getProgressPercentage()}% terminé
              </Badge>
            </div>
            
            {/* Barre de progression globale */}
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                key={`progress-${animationKey}`}
                className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-1000 ease-out animate-scale-in"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}
              />
            </div>
          </div>

          {/* Timeline des étapes */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const Icon = step.icon;
              
              return (
                <div 
                  key={step.id} 
                  className={`relative flex items-start space-x-4 animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Ligne de connexion animée */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-12">
                      <div 
                        className={`w-full transition-all duration-500 ease-out ${
                          status === 'completed' 
                            ? 'h-full bg-gradient-to-b from-primary to-primary-glow' 
                            : 'h-0 bg-muted'
                        }`}
                        style={{ 
                          animationDelay: status === 'completed' ? `${index * 200}ms` : '0ms'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Icône de l'étape avec animations avancées */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 hover-scale ${
                    status === 'completed' 
                      ? 'bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-elegant scale-110 animate-scale-in' 
                      : status === 'current' 
                        ? `${step.color} text-white shadow-glow scale-110 animate-pulse`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}>
                    <Icon className={`transition-all duration-300 ${
                      status === 'current' ? 'w-6 h-6' : 'w-5 h-5'
                    }`} />
                    
                    {/* Indicateur de progression pour l'étape courante */}
                    {status === 'current' && (
                      <div className="absolute -inset-1 rounded-full border-2 border-white/30 animate-spin" 
                           style={{ animationDuration: '3s' }} />
                    )}
                    
                    {/* Badge de validation pour les étapes terminées */}
                    {status === 'completed' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center animate-scale-in">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu de l'étape avec animations */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className={`text-sm font-medium transition-all duration-300 ${
                          status === 'current' ? 'text-primary animate-fade-in' : 
                          status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                          {status === 'current' && (
                            <PlayCircle className="inline-block w-4 h-4 ml-2 animate-bounce" />
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                        
                        {/* Temps estimé pour l'étape courante */}
                        {status === 'current' && (
                          <div className="flex items-center gap-1 text-xs text-primary animate-fade-in">
                            <Clock className="w-3 h-3" />
                            <span>Temps estimé: 2-4h</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Badges de statut avec animations */}
                      <div className="flex flex-col items-end gap-2">
                        {status === 'current' && (
                          <Badge className="animate-fade-in bg-gradient-to-r from-primary to-primary-glow">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              En cours
                            </div>
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge variant="secondary" className="animate-fade-in bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Terminé
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions pour l'étape courante avec animations */}
                    {status === 'current' && onStatusUpdate && (
                      <div className="mt-4 animate-fade-in">
                        <div className="flex flex-wrap gap-2">
                          {step.id === 'quote_pending' && (
                            <Button
                              size="sm"
                              onClick={() => onStatusUpdate('quote_accepted')}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white animate-scale-in"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Marquer comme accepté
                            </Button>
                          )}
                          
                          {(step.id === 'diagnostic' || step.id === 'in_progress' || step.id === 'testing') && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const nextStep = steps[index + 1];
                                if (nextStep) onStatusUpdate(nextStep.id);
                              }}
                              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 animate-scale-in"
                            >
                              <ChevronRight className="w-4 h-4 mr-1" />
                              Étape suivante
                            </Button>
                          )}
                          
                          {step.id === 'completed' && (
                            <Button
                              size="sm"
                              onClick={() => onStatusUpdate('ready_pickup')}
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white animate-scale-in"
                            >
                              <ShoppingBag className="w-4 h-4 mr-1" />
                              Prêt pour retrait
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informations de la commande */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">N° de commande:</span>
                <p className="font-medium">{repairOrder.order_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Créé le:</span>
                <p className="font-medium">
                  {new Date(repairOrder.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairProgressTracker;