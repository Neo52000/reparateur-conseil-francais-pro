import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ModernHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary font-heading">
              TopRéparateurs
            </span>
          </Link>

          {/* CTA */}
          <Button 
            variant="outline" 
            asChild
            className="border-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
          >
            <Link to="/inscription-pro">
              Espace Pro
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
