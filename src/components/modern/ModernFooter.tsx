import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const ModernFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-3 font-heading">
              topreparateurs.fr
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              La plateforme n°1 de mise en relation avec des réparateurs certifiés en France.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Partout en France</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/reparation-smartphone" className="hover:text-emerald-400 transition-colors">Réparation Smartphone</Link></li>
              <li><Link to="/reparation-tablette" className="hover:text-emerald-400 transition-colors">Réparation Tablette</Link></li>
              <li><Link to="/reparation-ordinateur" className="hover:text-emerald-400 transition-colors">Réparation Ordinateur</Link></li>
              <li><Link to="/reparation-console" className="hover:text-emerald-400 transition-colors">Réparation Console</Link></li>
            </ul>
          </div>

          {/* Professionnel */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Professionnel</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/repairer-plans" className="hover:text-emerald-400 transition-colors">Devenir réparateur</Link></li>
              <li><Link to="/repairer-auth" className="hover:text-emerald-400 transition-colors">Espace Pro</Link></li>
              <li><Link to="/repairer-dashboard" className="hover:text-emerald-400 transition-colors">Tableau de bord</Link></li>
              <li><Link to="/documentation" className="hover:text-emerald-400 transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Légal & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Informations</h4>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              <li><Link to="/legal-notice" className="hover:text-emerald-400 transition-colors">Mentions légales</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">CGU</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Confidentialité</Link></li>
              <li><Link to="/terms-of-sale" className="hover:text-emerald-400 transition-colors">CGV</Link></li>
            </ul>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@topreparateurs.fr" className="hover:text-emerald-400 transition-colors">
                  contact@topreparateurs.fr
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>Service client disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              © {currentYear} TopRéparateurs - Tous droits réservés
            </p>
            <p className="text-xs">
              Plateforme française de mise en relation avec des professionnels de la réparation
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
