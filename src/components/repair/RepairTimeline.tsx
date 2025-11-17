import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, AlertCircle, Package, Wrench, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  timestamp?: string;
  estimatedTime?: string;
  icon: React.ElementType;
}

interface RepairTimelineProps {
  repairId: string;
  currentStatus: string;
  steps?: TimelineStep[];
}

const defaultSteps: TimelineStep[] = [
  {
    id: '1',
    title: 'Demande reçue',
    description: 'Votre demande de réparation a été enregistrée',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    icon: Package
  },
  {
    id: '2',
    title: 'Devis accepté',
    description: 'Le devis a été validé et le paiement effectué',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    icon: CheckCircle2
  },
  {
    id: '3',
    title: 'Diagnostic en cours',
    description: 'Notre technicien examine votre appareil',
    status: 'in_progress',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    estimatedTime: '1-2 heures',
    icon: AlertCircle
  },
  {
    id: '4',
    title: 'Réparation',
    description: 'Remplacement des pièces défectueuses',
    status: 'pending',
    estimatedTime: '2-3 heures',
    icon: Wrench
  },
  {
    id: '5',
    title: 'Tests et vérification',
    description: 'Contrôle qualité et tests fonctionnels',
    status: 'pending',
    estimatedTime: '30 minutes',
    icon: CheckCircle2
  },
  {
    id: '6',
    title: 'Prêt pour retrait',
    description: 'Votre appareil est réparé et vous attend',
    status: 'pending',
    icon: Truck
  }
];

export const RepairTimeline: React.FC<RepairTimelineProps> = ({
  repairId,
  currentStatus,
  steps = defaultSteps
}) => {
  const getStatusIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in_progress':
        return Clock;
      case 'cancelled':
        return AlertCircle;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-status-success bg-status-success/10';
      case 'in_progress':
        return 'text-status-info bg-status-info/10';
      case 'cancelled':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusBadge = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">Terminé</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-status-info/10 text-status-info border-status-info/20">En cours</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Suivi de réparation</CardTitle>
          <Badge variant="outline">#{repairId.slice(0, 8)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex gap-4">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Icon */}
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    step.status === 'completed' ? 'border-status-success bg-status-success/10' :
                    step.status === 'in_progress' ? 'border-status-info bg-status-info/10' :
                    'border-border bg-background'
                  }`}>
                    <StepIcon className={`h-5 w-5 ${
                      step.status === 'completed' ? 'text-status-success' :
                      step.status === 'in_progress' ? 'text-status-info' :
                      'text-muted-foreground'
                    }`} />
                    {step.status === 'in_progress' && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-status-info"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{step.title}</h4>
                          {getStatusBadge(step.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {step.timestamp && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(step.timestamp), 'dd MMM à HH:mm', { locale: fr })}
                            </div>
                          )}
                          {step.estimatedTime && step.status !== 'completed' && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Durée estimée : {step.estimatedTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
