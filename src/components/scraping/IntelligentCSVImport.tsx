import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Database, 
  MapPin, 
  AlertCircle,
  Zap
} from 'lucide-react';

interface BusinessCategory {
  id: string;
  name: string;
}

interface IntelligentCSVImportProps {
  selectedCategory: BusinessCategory;
  onImportComplete?: () => void;
}

const IntelligentCSVImport: React.FC<IntelligentCSVImportProps> = ({
  selectedCategory,
  onImportComplete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-muted-foreground" />
          Import Intelligent - Fonction à venir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-muted/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <AlertDescription>
            <strong>Fonction temporairement désactivée</strong><br />
            L'import intelligent CSV est désactivé pour optimiser le plan Supabase gratuit. 
            Utilisez l'import CSV classique pour ajouter des réparateurs.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 opacity-50">
          <div>
            <h4 className="font-semibold mb-2 text-muted-foreground">Aperçu (non disponible)</h4>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <div className="p-8 text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Fonctionnalité temporairement indisponible</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">IA Enhancement</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Géocodage Auto</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Parse Intelligent</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentCSVImport;
