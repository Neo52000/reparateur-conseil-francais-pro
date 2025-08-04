import React from 'react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { Navigate } from 'react-router-dom';
import SimpleNavigation from '@/components/SimpleNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Search, 
  MessageSquare,
  Star,
  Calendar,
  Settings,
  FileText
} from 'lucide-react';

const SimpleClientDashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de votre espace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-auth" replace />;
  }

  const mockData = {
    activeRepairs: 2,
    completedRepairs: 8,
    savedRepairers: 5,
    nextAppointment: {
      date: "2024-08-06",
      time: "14:30",
      repairer: "TechFix Pro",
      service: "Réparation écran iPhone"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigation />
      
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenue {profile?.first_name || 'Utilisateur'} !
            </h1>
            <p className="text-muted-foreground">
              Gérez vos réparations et trouvez les meilleurs réparateurs
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réparations en cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.activeRepairs}</div>
              <Badge variant="default" className="mt-2">En cours</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réparations terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.completedRepairs}</div>
              <Badge variant="secondary" className="mt-2">Terminées</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réparateurs favoris</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.savedRepairers}</div>
              <Badge variant="outline" className="mt-2">Sauvegardés</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <Progress value={96} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prochain RDV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Prochain Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{mockData.nextAppointment.repairer}</h3>
                      <p className="text-sm text-muted-foreground">{mockData.nextAppointment.service}</p>
                      <p className="text-sm">
                        {mockData.nextAppointment.date} à {mockData.nextAppointment.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="default" className="h-20 flex-col">
                    <Search className="w-6 h-6 mb-2" />
                    Trouver un Réparateur
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Mes Messages
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    Mes Devis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Star className="w-6 h-6 mb-2" />
                    Mes Favoris
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Historique récent */}
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Devis accepté", repairer: "Mobile Fix", date: "Il y a 2 heures", status: "success" },
                    { action: "Recherche effectuée", service: "Réparation batterie", date: "Hier", status: "info" },
                    { action: "Réparation terminée", repairer: "Quick Repair", date: "Il y a 3 jours", status: "success" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.repairer || item.service}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Mon Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge variant="default">Client Actif</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Modifier le profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card>
              <CardHeader>
                <CardTitle>Conseils du jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">
                      💡 Astuce
                    </h4>
                    <p className="text-sm text-blue-700">
                      Demandez toujours un devis avant toute réparation pour éviter les mauvaises surprises.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contacter le support
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Centre d'aide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientDashboard;