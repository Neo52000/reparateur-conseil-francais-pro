import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Shield
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
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Timeline des étapes */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="relative flex items-start space-x-4">
                  {/* Ligne de connexion */}
                  {index < steps.length - 1 && (
                    <div 
                      className={`absolute left-6 top-12 w-0.5 h-8 transition-colors duration-300 ${
                        status === 'completed' ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                  
                  {/* Icône de l'étape */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    status === 'completed' 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                      : status === 'current' 
                        ? `${step.color} text-white shadow-lg scale-110 animate-pulse`
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Contenu de l'étape */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-sm font-medium transition-colors duration-300 ${
                          status === 'current' ? 'text-primary' : 
                          status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Badge de statut */}
                      {status === 'current' && (
                        <Badge className="animate-fade-in">
                          En cours
                        </Badge>
                      )}
                      {status === 'completed' && (
                        <Badge variant="secondary" className="animate-fade-in">
                          ✓ Terminé
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions pour l'étape courante */}
                    {status === 'current' && onStatusUpdate && (
                      <div className="mt-3 space-x-2">
                        {step.id === 'quote_pending' && (
                          <button
                            onClick={() => onStatusUpdate('quote_accepted')}
                            className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90 transition-colors"
                          >
                            Marquer comme accepté
                          </button>
                        )}
                        {(step.id === 'diagnostic' || step.id === 'in_progress' || step.id === 'testing') && (
                          <button
                            onClick={() => {
                              const nextStep = steps[index + 1];
                              if (nextStep) onStatusUpdate(nextStep.id);
                            }}
                            className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90 transition-colors"
                          >
                            Passer à l'étape suivante
                          </button>
                        )}
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