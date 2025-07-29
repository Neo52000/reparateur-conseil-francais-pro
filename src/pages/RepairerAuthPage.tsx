import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Users, Wrench, Smartphone, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RepairerAuthForm from '@/components/RepairerAuthForm';
import { Helmet } from 'react-helmet-async';
const RepairerAuthPage = () => {
  return <>
      <Helmet>
        <title>Inscription Réparateur - TopRéparateurs.fr</title>
        <meta name="description" content="Rejoignez le réseau TopRéparateurs.fr et développez votre activité de réparation. Inscription gratuite, outils professionnels inclus." />
        <meta name="keywords" content="inscription réparateur, devenir réparateur, TopRéparateurs, réseau réparation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            {/* Section informative */}
            

            {/* Formulaire d'inscription */}
            <div className="flex flex-col justify-center">
              <RepairerAuthForm />
              
              <div className="mt-6 text-center text-sm text-gray-600">
                En vous inscrivant, vous acceptez nos{' '}
                <Link to="/conditions-generales" className="text-orange-600 hover:underline">
                  conditions générales
                </Link>{' '}
                et notre{' '}
                <Link to="/politique-confidentialite" className="text-orange-600 hover:underline">
                  politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>;
};
export default RepairerAuthPage;