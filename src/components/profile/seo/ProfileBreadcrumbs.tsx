import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface ProfileBreadcrumbsProps {
  city: string;
  businessName: string;
}

const ProfileBreadcrumbs: React.FC<ProfileBreadcrumbsProps> = ({ city, businessName }) => {
  const citySlug = city?.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm">
      <ol className="flex items-center flex-wrap gap-1 text-muted-foreground">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link 
            to="/search" 
            className="hover:text-foreground transition-colors"
          >
            Réparateurs
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link 
            to={`/search?city=${encodeURIComponent(city)}`}
            className="hover:text-foreground transition-colors"
          >
            {city}
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {businessName}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default ProfileBreadcrumbs;
