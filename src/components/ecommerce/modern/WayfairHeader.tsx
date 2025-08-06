import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  Menu,
  ChevronDown,
  Phone,
  MapPin
} from 'lucide-react';

interface WayfairHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const WayfairHeader: React.FC<WayfairHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'ecrans',
      name: 'Écrans',
      icon: '📱',
      subcategories: ['iPhone', 'Samsung', 'Huawei', 'Xiaomi']
    },
    {
      id: 'batteries',
      name: 'Batteries',
      icon: '🔋',
      subcategories: ['iPhone', 'Samsung', 'Universal', 'Powerbank']
    },
    {
      id: 'cameras',
      name: 'Caméras',
      icon: '📷',
      subcategories: ['Arrière', 'Avant', 'Module complet']
    },
    {
      id: 'coques',
      name: 'Coques',
      icon: '🛡️',
      subcategories: ['Protection', 'Étanches', 'Design', 'Personnalisées']
    },
    {
      id: 'accessoires',
      name: 'Accessoires',
      icon: '🔌',
      subcategories: ['Chargeurs', 'Câbles', 'Support', 'Audio']
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Barre supérieure */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>Support: 01 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span>Livraison partout en France</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Mon compte</span>
              <span className="text-gray-600">Suivi commande</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">RepairShop</h1>
          </div>

          {/* Barre de recherche centrale */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher une pièce, un modèle, une marque..."
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-primary rounded-full"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Button 
                size="sm" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-6"
              >
                Rechercher
              </Button>
            </div>
            
            {/* Suggestions de recherche populaire */}
            <div className="mt-2 flex flex-wrap gap-2">
              {['écran iphone 13', 'batterie samsung', 'coque protection'].map(suggestion => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-primary"
                  onClick={() => onSearchChange(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Favoris</span>
              <Badge variant="secondary" className="ml-1">3</Badge>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Panier</span>
              <Badge variant="default" className="ml-1">2</Badge>
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Connexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation par catégories */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            {/* Menu burger mobile */}
            <Button variant="ghost" size="sm" className="lg:hidden mr-4">
              <Menu className="h-5 w-5" />
            </Button>

            {/* Navigation desktop */}
            <nav className="hidden lg:flex items-center space-x-8 py-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => setActiveCategory(category.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {/* Mega menu dropdown */}
                  {activeCategory === category.id && (
                    <div className="absolute top-full left-0 w-64 bg-white border shadow-lg rounded-lg mt-1 p-4 z-10">
                      <div className="grid grid-cols-1 gap-2">
                        {category.subcategories.map(sub => (
                          <Button
                            key={sub}
                            variant="ghost"
                            size="sm"
                            className="justify-start text-left"
                          >
                            {sub}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Liens spéciaux */}
              <div className="flex items-center gap-6 ml-8 pl-8 border-l">
                <Button variant="ghost" size="sm" className="text-red-600 font-medium">
                  🔥 Promos
                </Button>
                <Button variant="ghost" size="sm" className="text-green-600 font-medium">
                  ⚡ Express
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 font-medium">
                  🆕 Nouveautés
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WayfairHeader;