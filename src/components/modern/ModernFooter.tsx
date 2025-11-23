import { Link } from 'react-router-dom';

const ModernFooter = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-heading">TopRéparateurs</h3>
            <p className="text-white/70 text-sm">
              La plateforme de référence pour trouver les meilleurs réparateurs près de chez vous.
            </p>
          </div>

          {/* Liens */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/mentions-legales" className="text-white/70 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="text-white/70 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="text-white/70 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Pro */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Espace professionnel</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/inscription-pro" className="text-white/70 hover:text-white transition-colors">
                  Inscription réparateur
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors">
                  Connexion pro
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} TopRéparateurs. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
