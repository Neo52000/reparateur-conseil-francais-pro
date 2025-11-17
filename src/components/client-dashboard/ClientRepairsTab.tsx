import React, { useState, useEffect } from 'react';
import { RepairTimeline } from '@/components/repair/RepairTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';
import { Wrench, MessageSquare, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Repair {
  id: string;
  device_brand: string;
  device_model: string;
  status: string;
  created_at: string;
  repairer_name?: string;
}

export const ClientRepairsTab: React.FC = () => {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRepairs();
    }
  }, [user]);

  const loadRepairs = async () => {
    try {
      // Charger les réparations depuis la base (pour l'instant vide)
      setRepairs([]);
    } catch (error) {
      console.error('Erreur chargement réparations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (repairs.length === 0) {
    return (
      <EnhancedEmptyState
        icon={Wrench}
        title="Aucune réparation en cours"
        description="Vos réparations acceptées apparaîtront ici avec un suivi en temps réel"
        suggestions={[
          'Suivez l\'avancement de vos réparations étape par étape',
          'Recevez des notifications à chaque changement de statut',
          'Contactez le réparateur directement depuis cette page'
        ]}
      />
    );
  }

  if (selectedRepair) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedRepair(null)}>
          ← Retour aux réparations
        </Button>
        <RepairTimeline
          repairId={selectedRepair}
          currentStatus="in_progress"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repairs.map((repair) => (
        <Card key={repair.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {repair.device_brand} {repair.device_model}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {repair.repairer_name}
                </p>
              </div>
              <Badge variant="outline" className="bg-status-info/10 text-status-info">
                En cours
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRepair(repair.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir le suivi
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Contacter
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
