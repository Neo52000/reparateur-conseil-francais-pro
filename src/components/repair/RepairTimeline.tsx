import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, AlertCircle, Package, Wrench, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRepairTimeline } from '@/hooks/useRepairTimeline';

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
  quoteId: string;
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
  quoteId
}) => {
  const { events, loading } = useRepairTimeline(quoteId);
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
          <Badge variant="outline">#{quoteId.slice(0, 8)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun événement pour le moment
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => {
              const isLastEvent = index === events.length - 1;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline line */}
                  {!isLastEvent && (
                    <div className="absolute left-5 top-12 w-0.5 h-full bg-border" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{event.event_title}</h4>
                        {event.event_description && (
                          <p className="text-sm text-muted-foreground">{event.event_description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {event.event_type}
                      </Badge>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(event.created_at), 'PPp', { locale: fr })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
