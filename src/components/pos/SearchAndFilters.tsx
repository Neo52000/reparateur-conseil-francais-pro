import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ScanLine, Filter, Tag } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onScanProduct: () => void;
  totalProducts: number;
  filteredCount: number;
}

const categories = [
  { value: 'all', label: 'Toutes catégories', color: 'bg-slate-100' },
  { value: 'écrans', label: 'Écrans', color: 'bg-blue-100 text-blue-800' },
  { value: 'batteries', label: 'Batteries', color: 'bg-green-100 text-green-800' },
  { value: 'accessoires', label: 'Accessoires', color: 'bg-purple-100 text-purple-800' },
  { value: 'services', label: 'Services', color: 'bg-orange-100 text-orange-800' },
];

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onScanProduct,
  totalProducts,
  filteredCount
}) => {
  const currentCategory = categories.find(cat => cat.value === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Rechercher un produit, SKU... (F3)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 text-lg border-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              ×
            </Button>
          )}
        </div>
        
        {/* Filtre par catégorie */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-64 h-12 border-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Bouton scan */}
        <Button 
          variant="outline" 
          onClick={onScanProduct}
          className="h-12 px-6 border-2 hover:border-primary hover:bg-primary/5"
        >
          <ScanLine className="w-5 h-5 mr-2" />
          Scanner (F4)
        </Button>
      </div>

      {/* Indicateurs actifs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Filtre actif */}
          {selectedCategory !== 'all' && currentCategory && (
            <Badge 
              variant="secondary" 
              className={`${currentCategory.color} border`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {currentCategory.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCategoryChange('all')}
                className="ml-2 h-4 w-4 p-0 hover:bg-white/50"
              >
                ×
              </Button>
            </Badge>
          )}
          
          {/* Terme de recherche actif */}
          {searchTerm && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Search className="w-3 h-3 mr-1" />
              "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="ml-2 h-4 w-4 p-0 hover:bg-blue-100"
              >
                ×
              </Button>
            </Badge>
          )}
        </div>

        {/* Compteur de résultats */}
        <div className="text-sm text-slate-600">
          <span className="font-medium">{filteredCount}</span>
          {filteredCount !== totalProducts && (
            <span> sur {totalProducts}</span>
          )}
          <span> produit{filteredCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;