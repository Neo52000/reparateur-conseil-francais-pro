import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity,
  Search,
  Brain,
  MapPin
} from 'lucide-react';

interface ScrapingStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ReactNode;
  message?: string;
}

interface ProgressStepsProps {
  steps: ScrapingStep[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-admin-blue animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-admin-red" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-admin-blue text-white';
      case 'completed':
        return 'bg-admin-green text-white';
      case 'error':
        return 'bg-admin-red text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'running':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border">
          <div className="flex-shrink-0">
            {getStatusIcon(step.status)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{step.name}</h4>
              <Badge variant="secondary" className={getStatusColor(step.status)}>
                {getStatusText(step.status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {step.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;