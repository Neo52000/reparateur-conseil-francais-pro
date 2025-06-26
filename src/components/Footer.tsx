
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Linkedin, Twitter, MessageCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

const Footer = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Bonjour, je souhaite des informations sur vos services de réparation.');
    window.open(`https://wa.me/33745062162?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div>
            <div className="mb-4">
              <Logo variant="compact" size="md" className="brightness-0 invert" />
            </div>
            <p className="text-gray-300 mb-4">
              Trouvez rapidement un réparateur qualifié près de chez vous. Réparation téléphone, ordinateur, tablette - Devis gratuit et intervention rapide.
            </p>
          </div>

          {/* Contact et réseaux sociaux */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-gray-300">contact@topreparateurs.fr</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                <button 
                  onClick={handleWhatsApp}
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  07 45 06 21 62 (WhatsApp)
                </button>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4 mb-4">
              <a href="https://facebook.com/topreparateurs.fr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" onClick={handleWhatsApp} className="text-gray-300 hover:text-green-400 transition-colors">
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
            
            {/* Copyright déplacé ici */}
            <p className="text-gray-400 text-sm">
              © 2024 TopRéparateurs.fr. Tous droits réservés.
            </p>
          </div>

          {/* Espace réparateur et inscription */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Réparateurs</h4>
            <div className="space-y-4">
              <Link to="/repairer/auth" className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors">
                Espace Réparateur
              </Link>
              
              <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-lg p-4">
                <h5 className="font-bold text-white mb-2">
                  Vous êtes réparateur ?
                </h5>
                <p className="text-blue-100 text-sm mb-3">
                  Rejoignez notre annuaire et développez votre activité
                </p>
                <Link to="/repairer/plans">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inscrivez-vous gratuitement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

};

export default Footer;
