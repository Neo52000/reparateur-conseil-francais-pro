import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Upload, 
  FileSpreadsheet, 
  MapPin, 
  Users,
  ArrowRight 
} from 'lucide-react';
import ImportRepairersPage from '@/pages/admin/ImportRepairersPage';

const AdminImportDashboard: React.FC = () => {
  const location = useLocation();

  if (location.pathname !== '/admin/import') {
    return (
      <Routes>
        <Route path="/repairers" element={<ImportRepairersPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Centre d'import de données
          </h1>
          <p className="text-muted-foreground">
            Gestion centralisée des imports de données pour la plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Import Réparateurs */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Réparateurs
                </CardTitle>
                <Badge variant="default">Prêt</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Import de la base de données des réparateurs avec géocodage automatique
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">67 entrées</div>
                  <div className="text-muted-foreground">Grand Est</div>
                </div>
                <div>
                  <div className="font-medium">Auto-géocodage</div>
                  <div className="text-muted-foreground">Coordonnées GPS</div>
                </div>
              </div>
              
              <Link to="/admin/import/repairers">
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Lancer l'import
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Import CSV Générique */}
          <Card className="hover:shadow-lg transition-shadow opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  Import CSV
                </CardTitle>
                <Badge variant="outline">Bientôt</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Import générique de fichiers CSV avec mapping automatique des colonnes
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Flexible</div>
                  <div className="text-muted-foreground">Tout format</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Validation</div>
                  <div className="text-muted-foreground">Automatique</div>
                </div>
              </div>
              
              <Button className="w-full" disabled>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                En développement
              </Button>
            </CardContent>
          </Card>

          {/* Géocodage en lot */}
          <Card className="hover:shadow-lg transition-shadow opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Géocodage
                </CardTitle>
                <Badge variant="outline">Bientôt</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Géocodage en lot des adresses existantes sans coordonnées
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">API Multiple</div>
                  <div className="text-muted-foreground">Fallback</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Précision</div>
                  <div className="text-muted-foreground">Haute qualité</div>
                </div>
              </div>
              
              <Button className="w-full" disabled>
                <MapPin className="h-4 w-4 mr-2" />
                En développement
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques globales */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques d'import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Imports aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Réparateurs ajoutés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Erreurs résolues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Taux de réussite</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📋 Préparation des données</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Vérifiez le format des données</li>
                  <li>• Éliminez les doublons</li>
                  <li>• Validez les champs obligatoires</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🚀 Processus d'import</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Import automatique avec validation</li>
                  <li>• Géocodage des adresses</li>
                  <li>• Classification IA appliquée</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔍 Contrôle qualité</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Déduplication automatique</li>
                  <li>• Validation des formats</li>
                  <li>• Rapports d'erreurs détaillés</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📊 Suivi et monitoring</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Logs détaillés en temps réel</li>
                  <li>• Métriques de performance</li>
                  <li>• Notifications d'achèvement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminImportPage: React.FC = () => {
  return <AdminImportDashboard />;
};

export default AdminImportPage;