import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Star, 
  Heart,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import QuoteForm from './QuoteForm';
import AppointmentBooking from './AppointmentBooking';
import ChatInterface from './ChatInterface';
import RepairTracking from './RepairTracking';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Erreur de déconnexion",
          description: "Une erreur s'est produite lors de la déconnexion",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès"
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const handleCloseAccount = async () => {
    // Ici on pourrait implémenter la suppression du compte
    // Pour l'instant, on affiche juste un message
    toast({
      title: "Fermeture de compte",
      description: "Cette fonctionnalité sera bientôt disponible. Contactez le support pour fermer votre compte.",
      variant: "default"
    });
  };

  // Données mockées pour la démo
  const clientData = {
    profile: {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      memberSince: '2024-01-15'
    },
    stats: {
      totalRepairs: 8,
      totalSpent: 450,
      loyaltyPoints: 120,
      avgRating: 4.8
    },
    recentRepairs: [
      {
        id: '1',
        device: 'iPhone 14 Pro',
        issue: 'Écran cassé',
        repairer: 'TechRepair Pro',
        date: '2024-12-10',
        status: 'Terminé',
        rating: 5
      },
      {
        id: '2',
        device: 'Samsung Galaxy S23',
        issue: 'Batterie',
        repairer: 'Phone Fix Express',
        date: '2024-11-25',
        status: 'Terminé',
        rating: 4
      }
    ],
    appointments: [
      {
        id: '1',
        repairer: 'TechRepair Pro',
        date: '2024-12-20',
        time: '14:00',
        service: 'Diagnostic',
        status: 'Confirmé'
      }
    ],
    favorites: [
      {
        id: '1',
        name: 'TechRepair Pro',
        rating: 4.9,
        specialty: 'iPhone'
      },
      {
        id: '2',
        name: 'Phone Fix Express',
        rating: 4.7,
        specialty: 'Samsung'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Espace Client</h1>
          <p className="text-gray-600 mt-2">Gérez vos réparations et votre profil</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Réparations</p>
                  <p className="text-2xl font-bold text-gray-900">{clientData.stats.totalRepairs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                  <p className="text-2xl font-bold text-gray-900">{clientData.stats.totalSpent}€</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points fidélité</p>
                  <p className="text-2xl font-bold text-gray-900">{clientData.stats.loyaltyPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{clientData.stats.avgRating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="repairs">Réparations</TabsTrigger>
            <TabsTrigger value="appointments">RDV</TabsTrigger>
            <TabsTrigger value="quote">Devis</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nom complet</label>
                    <p className="text-gray-900">{clientData.profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{clientData.profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="text-gray-900">{clientData.profile.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Adresse</label>
                    <p className="text-gray-900">{clientData.profile.address}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Modifier le profil
                  </Button>
                  
                  <Button onClick={handleSignOut} variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Fermer mon compte
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                          Fermer définitivement votre compte ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Toutes vos données, historiques de réparations, 
                          points de fidélité et informations personnelles seront définitivement supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCloseAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Fermer mon compte
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repairs">
            <Card>
              <CardHeader>
                <CardTitle>Historique des réparations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.recentRepairs.map((repair) => (
                    <div key={repair.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{repair.device}</h3>
                        <p className="text-sm text-gray-600">{repair.issue} • {repair.repairer}</p>
                        <p className="text-sm text-gray-500">{repair.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={repair.status === 'Terminé' ? 'default' : 'secondary'}>
                          {repair.status}
                        </Badge>
                        <div className="flex items-center mt-1">
                          {[...Array(repair.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rendez-vous à venir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientData.appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{appointment.repairer}</h3>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <p className="text-sm text-gray-500">{appointment.date} à {appointment.time}</p>
                        </div>
                        <Badge>{appointment.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <AppointmentBooking 
                repairerId="demo-repairer"
                onSuccess={() => console.log('Appointment booked')} 
              />
            </div>
          </TabsContent>

          <TabsContent value="quote">
            <QuoteForm onSuccess={() => console.log('Quote requested')} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface 
              conversationId="client-conversation"
              userType="user"
              subscription="premium"
            />
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Réparateurs favoris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.favorites.map((favorite) => (
                    <div key={favorite.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{favorite.name}</h3>
                        <p className="text-sm text-gray-600">Spécialité: {favorite.specialty}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">{favorite.rating}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Contacter
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <CardTitle>Programme de fidélité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-600">{clientData.stats.loyaltyPoints} points</h3>
                    <p className="text-gray-600">Votre solde actuel</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Comment gagner des points :</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 1 point = 1€ dépensé</li>
                      <li>• +10 points pour chaque avis laissé</li>
                      <li>• +20 points pour un parrainage</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Récompenses disponibles :</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Réduction 5€</span>
                        <span className="text-sm font-medium">50 points</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Réduction 10€</span>
                        <span className="text-sm font-medium">100 points</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Diagnostic gratuit</span>
                        <span className="text-sm font-medium">75 points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
