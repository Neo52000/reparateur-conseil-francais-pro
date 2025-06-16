
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Linkedin, Twitter, Send, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo variant="compact" size="md" className="brightness-0 invert" />
            </div>
            <p className="text-gray-300 mb-4">
              Votre plateforme de réparation connectant clients et réparateurs pour un service optimal.
            </p>
            <Link to="/repairer/auth" className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors">
              Espace Réparateur
            </Link>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-gray-300">contact@topreparateurs.fr</span>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Send className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Section d'inscription à l'annuaire */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h4 className="text-xl font-bold text-white mb-2">
                  Vous êtes réparateur ?
                </h4>
                <p className="text-blue-100">
                  Rejoignez notre annuaire et développez votre activité avec TopRéparateurs.fr
                </p>
              </div>
              <Link to="/repairer/plans">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inscrivez-vous gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400">
            © 2024 TopRéparateurs.fr. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
