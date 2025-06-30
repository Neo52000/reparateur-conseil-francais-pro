
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client";
import AdBannerDisplay from "@/components/advertising/AdBannerDisplay";
import ChatbotWidget from '@/components/ChatbotWidget';
import HeroSectionSimplified from '@/components/sections/HeroSectionSimplified';
import { useRepairersData } from "@/hooks/useRepairersData";

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

const Index = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { repairers } = useRepairersData();

  const handleQuickSearch = (searchCriteria: SearchCriteria) => {
    // Naviguer vers la page de recherche avec les critères
    const searchParams = new URLSearchParams({
      deviceType: searchCriteria.deviceType,
      brand: searchCriteria.brand,
      model: searchCriteria.model,
      repairType: searchCriteria.repairType,
      city: searchCriteria.city,
      postalCode: searchCriteria.postalCode
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleMapSearch = () => {
    navigate('/search?mode=map');
  };

  const handleDemoRequest = async () => {
    setIsDemoLoading(true);
    try {
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
        setDemoEmail("");
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

      <main>
        <HeroSectionSimplified 
          onQuickSearch={handleQuickSearch}
          onMapSearch={handleMapSearch}
        />

        <div className="container mx-auto px-4 py-8">
          <section className="mb-12">
            <AdBannerDisplay placement="homepage_carousel" />
          </section>

          <section className="mb-12 text-center">
            <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
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

          <section className="mb-12">
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
        </div>
      </main>
      
      <ChatbotWidget />
    </div>
  );
};

export default Index;
