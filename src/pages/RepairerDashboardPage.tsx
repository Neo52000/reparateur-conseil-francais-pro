import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const RepairerDashboardPage: React.FC = () => {
  const { user, canAccessRepairer } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!canAccessRepairer) {
    navigate('/');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord réparateur</h1>
        <p className="text-muted-foreground">
          Gérez votre activité de réparation
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Demandes de devis</CardTitle>
            <CardDescription>
              Nouvelles demandes en attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">
              Aucune demande en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous</CardTitle>
            <CardDescription>
              Prochains rendez-vous programmés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">
              Aucun rendez-vous programmé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenus du mois</CardTitle>
            <CardDescription>
              Chiffre d'affaires mensuel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 €</p>
            <p className="text-sm text-muted-foreground">
              Aucune transaction ce mois
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RepairerDashboardPage;