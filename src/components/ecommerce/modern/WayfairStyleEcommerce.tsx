import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Grid3X3, 
  List, 
  Filter, 
  Star, 
  Heart,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Truck,
  Shield,
  ArrowUpDown
} from 'lucide-react';
import WayfairHeader from './WayfairHeader';
import WayfairSidebar from './WayfairSidebar';
import WayfairProductGrid from './WayfairProductGrid';
import WayfairQuickView from './WayfairQuickView';
import WayfairBreadcrumbs from './WayfairBreadcrumbs';
import ProductComparator from './ProductComparator';
import RecentlyViewed from './RecentlyViewed';
import AIRecommendations from './AIRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  category: string;
  brand: string;
  isOnSale: boolean;
  isFreeShipping: boolean;
  stock: number;
  sku: string;
  tags: string[];
}

interface Filters {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  rating: number;
  features: string[];
  shipping: string[];
}

const WayfairStyleEcommerce: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: [],
    priceRange: [0, 1000],
    brands: [],
    rating: 0,
    features: [],
    shipping: []
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  // Mock data - remplacer par des vraies données Supabase
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Écran iPhone 13 Pro OLED Premium',
      price: 129.99,
      originalPrice: 159.99,
      images: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
      rating: 4.8,
      reviewCount: 247,
      description: 'Écran OLED de remplacement haute qualité pour iPhone 13 Pro avec tous les outils inclus.',
      category: 'ecrans',
      brand: 'Premium Parts',
      isOnSale: true,
      isFreeShipping: true,
      stock: 15,
      sku: 'IPH13P-OLED-001',
      tags: ['garantie-6mois', 'installation-incluse', 'qualite-premium']
    },
    {
      id: '2', 
      name: 'Batterie Samsung Galaxy S22 Ultra',
      price: 45.99,
      images: ['/api/placeholder/400/400'],
      rating: 4.6,
      reviewCount: 189,
      description: 'Batterie lithium-ion de remplacement 5000mAh pour Samsung Galaxy S22 Ultra.',
      category: 'batteries',
      brand: 'Samsung Original',
      isOnSale: false,
      isFreeShipping: false,
      stock: 23,
      sku: 'SGS22U-BAT-001',
      tags: ['garantie-12mois', 'capacite-originale']
    },
    // Ajouter plus de produits mock...
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Load products from Supabase ecommerce_products table
      const { data, error } = await supabase
        .from('ecommerce_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform Supabase data to match Product interface
      const transformedProducts = (data || []).map(product => ({
        ...product,
        images: product.gallery_images || [product.featured_image_url],
        rating: 4.5, // Default rating
        reviewCount: 0, // Default review count
        brand: product.brand || 'Unknown',
        colors: [],
        sizes: [],
        materials: []
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Appliquer la recherche
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Appliquer les filtres
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => filters.category.includes(product.category));
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Appliquer le tri
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Simuler tri par date
        break;
      default:
        // Featured - ordre par défaut
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/boutique' },
    { label: 'Pièces détachées' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Wayfair */}
      <WayfairHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Slider promotionnel sous header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            🚚 Livraison GRATUITE dès 50€ d'achat • 📱 Installation sur RDV disponible
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <WayfairBreadcrumbs items={breadcrumbItems} />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar des filtres */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <WayfairSidebar
              filters={filters}
              onFiltersChange={setFilters}
              productCount={filteredProducts.length}
            />
          </div>

          {/* Zone principale des produits */}
          <div className="flex-1 space-y-6">
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Pièces détachées</h1>
                <Badge variant="secondary" className="text-sm">
                  {filteredProducts.length} produits
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Tri */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm"
                  >
                    <option value="featured">Recommandés</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="rating">Mieux notés</option>
                    <option value="newest">Nouveautés</option>
                  </select>
                </div>

                {/* Vue */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filtres mobile */}
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>

            {/* Grille des produits */}
            <WayfairProductGrid
              products={currentProducts}
              viewMode={viewMode}
              loading={loading}
              onQuickView={setQuickViewProduct}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Précédent
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Suivant
                </Button>
              </div>
            )}

            {/* Recently Viewed */}
            <RecentlyViewed onProductClick={(product) => setQuickViewProduct(product)} />

            {/* AI Recommendations */}
            <AIRecommendations 
              currentProduct={quickViewProduct || undefined}
              viewedProducts={viewedProducts}
              onQuickView={setQuickViewProduct}
            />
          </div>
        </div>
      </div>

      {/* Product Comparator - Sticky Bottom */}
      <ProductComparator
        products={compareProducts}
        onRemoveProduct={(id) => setCompareProducts(prev => prev.filter(p => p.id !== id))}
        onClearAll={() => setCompareProducts([])}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <WayfairQuickView
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};

export default WayfairStyleEcommerce;