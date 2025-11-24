import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ModernHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-emerald-600 font-heading">
              topreparateurs.fr
            </span>
          </Link>

          {/* Navigation centrale */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/reparateur" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Réparateur
            </Link>
            <Link to="/reparations" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Réparations
            </Link>
            <Link to="/particuliers" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Particuliers
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Connexion
            </Link>
          </nav>

          {/* CTA */}
          <Button 
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Link to="/inscription-pro">
              S'inscrire
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
