import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

/**
 * Composant d'état de l'implémentation
 */
export const ImplementationStatus: React.FC = () => {
  const phases = [
    {
      name: "Phase 1: Stabilisation UI Core",
      status: "completed",
      progress: 100,
      items: [
        "✅ Composants Radix UI corrigés",
        "✅ Imports React fixes",
        "✅ Skeleton et Badge créés",
        "✅ Progress simplifié fonctionnel"
      ]
    },
    {
      name: "Phase 2: AuthStore Zustand",
      status: "completed", 
      progress: 100,
      items: [
        "✅ Intégration avec useAuth",
        "✅ Synchronisation bidirectionnelle",
        "✅ Persistance localStorage",
        "✅ Permissions calculées"
      ]
    },
    {
      name: "Phase 3: Interfaces Principales",
      status: "completed",
      progress: 100,
      items: [
        "✅ Page Index complète restaurée",
        "✅ Navigation fonctionnelle",
        "✅ Pages d'authentification",
        "✅ Hooks corrigés"
      ]
    },
    {
      name: "Phase 4: Modules Administration",
      status: "partial",
      progress: 85,
      items: [
        "✅ Interface admin accessible",
        "✅ Navigation horizontale",
        "✅ Boutons nouveau/visiter",
        "🔄 Modules avancés à vérifier"
      ]
    },
    {
      name: "Phase 5: Tests et Optimisation",
      status: "ready",
      progress: 25,
      items: [
        "✅ Test navigation de base",
        "⏳ Tests fonctionnalités critiques",
        "⏳ Tests tous rôles",
        "⏳ Optimisation performances"
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'ready': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
      case 'partial': return <Badge variant="secondary" className="bg-yellow-500">Partiel</Badge>;
      case 'ready': return <Badge variant="outline">Prêt</Badge>;
      default: return <Badge variant="outline">En attente</Badge>;
    }
  };

  const overallProgress = phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length;

  return (
    <div className="p-6 space-y-6 border rounded-lg bg-card">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">🚀 État de l'Implémentation</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression Globale</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(phase.status)}
                <h4 className="font-medium">{phase.name}</h4>
              </div>
              {getStatusBadge(phase.status)}
            </div>
            
            <Progress value={phase.progress} className="w-full h-2" />
            
            <div className="space-y-1">
              {phase.items.map((item, itemIndex) => (
                <p key={itemIndex} className="text-sm text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">✅ Systèmes Opérationnels</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
          <div>• Navigation complète</div>
          <div>• Authentification</div>
          <div>• Interface admin</div>
          <div>• Zustand stores</div>
          <div>• Composants UI</div>
          <div>• Pages principales</div>
        </div>
      </div>
    </div>
  );
};

export default ImplementationStatus;