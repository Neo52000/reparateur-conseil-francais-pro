import { Link } from 'react-router-dom';

const ModernFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-emerald-400 font-heading">
              topreparateurs.fr
            </h3>
            <p className="text-sm text-gray-400">
              Le Doctolib de la réparation
            </p>
          </div>

          {/* Liens */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/mentions-legales" className="hover:text-emerald-400 transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="hover:text-emerald-400 transition-colors">
                  CGU
                </Link>
              </li>
            </ul>
          </div>

          {/* Pro */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Professionnel</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/inscription-pro" className="hover:text-emerald-400 transition-colors">
                  Inscription pro
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-sm text-gray-400">
              contact@topreparateurs.fr
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TopRéparateurs - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
