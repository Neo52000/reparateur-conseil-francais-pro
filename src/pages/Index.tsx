
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { DistanceCalculator } from "@/utils/geolocation/distanceCalculator";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client";
import AdBannerDisplay from "@/components/advertising/AdBannerDisplay";
import ChatbotWidget from '@/components/ChatbotWidget';

const Index = () => {
  const [city, setCity] = useState("");
  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userLocation: geoLocation, getUserLocation } = useGeolocation();

  useEffect(() => {
    if (geoLocation) {
      setUserLocation([geoLocation[1], geoLocation[0]]);
    }
  }, [geoLocation]);

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("repairers")
        .select("*")
        .eq("is_verified", true);

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la recherche de réparateurs.",
          variant: "destructive",
        });
      } else {
        if (userLocation) {
          const filteredRepairers = DistanceCalculator.filterByDistance(
            data,
            userLocation,
            maxDistance
          );
          setRepairers(filteredRepairers);
        } else {
          setRepairers(data);
        }

        if (data && data.length === 0) {
          toast({
            title: "Aucun réparateur trouvé",
            description: "Aucun réparateur n'a été trouvé dans la zone spécifiée.",
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRequest = async () => {
    setIsDemoLoading(true);
    try {
      // Simuler une insertion de démo en utilisant les notifications
      const { error } = await supabase.from("notifications").insert({ 
        title: "Demande de démo",
        message: `Demande de démo reçue pour: ${demoEmail}`,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        type: 'info'
      });

      if (error) {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la demande de démo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demande envoyée",
          description: "Votre demande de démo a été envoyée avec succès.",
        });
        setIsDemoModalOpen(false);
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGeolocation = async () => {
    setLocationError(null);
    try {
      await getUserLocation();
      if (!geoLocation) {
        setLocationError("Impossible de récupérer votre position.");
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible de récupérer votre position. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setLocationError(error.message);
      toast({
        title: "Erreur de géolocalisation",
        description: "Une erreur s'est produite lors de la géolocalisation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-muted py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              TopRéparateurs.fr
            </Link>
            <div>
              {user ? (
                <Button onClick={() => navigate("/account")}>Mon compte</Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Se connecter
                  </Button>
                  <Button onClick={() => navigate("/register")}>S'inscrire</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-extrabold text-center mb-4">
            Trouvez le meilleur réparateur près de chez vous
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Des milliers de réparateurs de confiance à portée de main.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Entrez votre ville"
                value={city}
                onChange={handleCityChange}
                className="pr-12"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Rechercher
            </Button>
            <Button variant="secondary" onClick={handleGeolocation} disabled={loading}>
              <MapPin className="mr-2 h-4 w-4" />
              Autour de moi
            </Button>
          </div>

          {locationError && (
            <div className="mt-4 text-red-500 text-center">
              <AlertTriangle className="inline-block mr-1" />
              {locationError}
            </div>
          )}
        </section>

        <section>
          {error && (
            <div className="text-red-500 text-center">
              <AlertTriangle className="inline-block mr-1" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-5 w-40" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repairers.map((repairer) => (
                <Card key={repairer.id}>
                  <CardHeader>
                    <CardTitle>{repairer.name}</CardTitle>
                    <CardDescription>{repairer.city}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {repairer.description}
                    </p>
                    <Link to={`/repairer/${repairer.id}`}>
                      <Button variant="secondary">
                        Voir le profil
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <AdBannerDisplay placement="homepage_carousel" />
        </section>

        <section className="mt-12 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Demander une démo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Demander une démo</DialogTitle>
                <DialogDescription>
                  Entrez votre adresse e-mail et nous vous contacterons pour organiser une
                  démonstration personnalisée.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    className="col-span-3"
                    type="email"
                  />
                </div>
              </div>
              <Button type="submit" onClick={handleDemoRequest} disabled={isDemoLoading}>
                {isDemoLoading ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </DialogContent>
          </Dialog>
        </section>

        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Vous êtes réparateur ?</CardTitle>
              <CardDescription>
                Rejoignez notre plateforme et développez votre activité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Inscrivez-vous dès maintenant et bénéficiez d'une visibilité accrue auprès de
                milliers de clients potentiels.
              </p>
              <Button onClick={() => navigate("/register")}>Devenir réparateur</Button>
            </CardContent>
          </Card>
        </section>
      </main>
      
      {/* Chat Widget - ajouté à la fin */}
      <ChatbotWidget />
    </div>
  );
};

export default Index;
