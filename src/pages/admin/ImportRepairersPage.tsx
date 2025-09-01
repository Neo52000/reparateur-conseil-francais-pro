import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, MapPin, Phone, Mail } from 'lucide-react';
import ImportRepairersButton from '@/components/admin/ImportRepairersButton';

const ImportRepairersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Import des réparateurs
          </h1>
          <p className="text-muted-foreground">
            Intégration de la base de données des réparateurs de la région Grand Est
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">67</div>
              <div className="text-sm text-muted-foreground">Réparateurs</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Phone className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">Avec téléphone</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Avec email</div>
            </CardContent>
          </Card>
        </div>

        <ImportRepairersButton />

        <Card>
          <CardHeader>
            <CardTitle>Couverture géographique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-semibold">Vosges (88)</div>
                <div className="text-sm text-muted-foreground">16 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Bas-Rhin (67)</div>
                <div className="text-sm text-muted-foreground">8 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Moselle (57)</div>
                <div className="text-sm text-muted-foreground">8 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Meurthe-et-Moselle (54)</div>
                <div className="text-sm text-muted-foreground">7 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Marne (51)</div>
                <div className="text-sm text-muted-foreground">7 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Haut-Rhin (68)</div>
                <div className="text-sm text-muted-foreground">5 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Haute-Marne (52)</div>
                <div className="text-sm text-muted-foreground">5 réparateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Autres</div>
                <div className="text-sm text-muted-foreground">11 réparateurs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <strong>Source:</strong> Base de données fournisseur 2025
            </div>
            <div className="text-sm">
              <strong>Format:</strong> CSV avec géocodage automatique
            </div>
            <div className="text-sm">
              <strong>Traitement:</strong> Déduplication automatique et validation des données
            </div>
            <div className="text-sm">
              <strong>Classification IA:</strong> Sera appliquée après l'import
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportRepairersPage;