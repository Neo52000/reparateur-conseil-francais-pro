import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MapWithFiltersProps {
  onBack?: () => void;
}

const MapWithFilters: React.FC<MapWithFiltersProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Résultats de recherche</h1>
        </div>

        {/* Zone de résultats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des résultats */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Réparateurs trouvés</h3>
              <p className="text-muted-foreground">
                La fonctionnalité de recherche sera bientôt disponible.
              </p>
              <div className="mt-4 space-y-2">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Réparateur Exemple 1</h4>
                  <p className="text-sm text-muted-foreground">Spécialiste smartphones - 5★</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Réparateur Exemple 2</h4>
                  <p className="text-sm text-muted-foreground">Réparation tablettes - 4.8★</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Zone carte */}
          <div>
            <Card className="p-6 h-96">
              <h3 className="text-lg font-semibold mb-4">Carte interactive</h3>
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Carte géolocalisée à venir</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapWithFilters;