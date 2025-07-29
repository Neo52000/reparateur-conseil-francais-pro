import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Phone, Mail } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
  onContactSupport: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted, onContactSupport }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-electric-blue via-electric-blue-dark to-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Rejoignez dès aujourd'hui la communauté des réparateurs qui digitalisent leur activité
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Plus de 2500 réparateurs font déjà confiance à TopRéparateurs pour développer leur business. 
              Commencez votre transformation digitale en 5 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-electric-blue hover:bg-electric-blue-dark text-white px-8 py-4 text-lg font-semibold group min-w-[250px]"
              >
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="border-t pt-8 mt-8">
              <p className="text-muted-foreground mb-6">
                Besoin d'aide pour choisir ? Nos experts sont là pour vous conseiller
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={onContactSupport}
                  variant="outline"
                  className="flex items-center gap-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
                >
                  <Phone className="w-4 h-4" />
                  Parler à un conseiller
                </Button>
                
                <a 
                  href="mailto:support@topreparateurs.fr"
                  className="flex items-center gap-2 text-electric-blue hover:text-electric-blue-dark"
                >
                  <Mail className="w-4 h-4" />
                  support@topreparateurs.fr
                </a>
              </div>
            </div>
            
            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue">7 jours</div>
                <div className="text-sm text-muted-foreground">Essai gratuit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue">0€</div>
                <div className="text-sm text-muted-foreground">Frais d'installation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue">NF525</div>
                <div className="text-sm text-muted-foreground">Certifié</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue">24h</div>
                <div className="text-sm text-muted-foreground">Mise en ligne</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FinalCTA;