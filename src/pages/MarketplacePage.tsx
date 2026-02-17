import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Search, Star, Truck, Shield, Filter } from 'lucide-react';

interface AccessoryProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  image: string;
  inStock: boolean;
  freeShipping: boolean;
  warranty: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'coques', label: 'Coques & Étuis' },
  { id: 'protections', label: 'Protections écran' },
  { id: 'batteries', label: 'Batteries' },
  { id: 'chargeurs', label: 'Chargeurs' },
  { id: 'accessoires', label: 'Accessoires' },
];

const MOCK_PRODUCTS: AccessoryProduct[] = [
  { id: '1', name: 'Coque iPhone 15 Pro Max Silicone', price: 19.99, originalPrice: 29.99, category: 'coques', brand: 'Apple', rating: 4.7, reviewCount: 234, image: '📱', inStock: true, freeShipping: true, warranty: '1 an' },
  { id: '2', name: 'Protection écran Samsung Galaxy S24 Ultra', price: 12.99, category: 'protections', brand: 'Samsung', rating: 4.5, reviewCount: 189, image: '🛡️', inStock: true, freeShipping: false, warranty: '6 mois' },
  { id: '3', name: 'Batterie iPhone 14 - Qualité OEM', price: 34.99, originalPrice: 49.99, category: 'batteries', brand: 'Apple', rating: 4.8, reviewCount: 312, image: '🔋', inStock: true, freeShipping: true, warranty: '2 ans' },
  { id: '4', name: 'Chargeur MagSafe compatible', price: 24.99, category: 'chargeurs', brand: 'Universel', rating: 4.3, reviewCount: 156, image: '🔌', inStock: true, freeShipping: true, warranty: '1 an' },
  { id: '5', name: 'Étui Xiaomi Redmi Note 13 Pro', price: 14.99, category: 'coques', brand: 'Xiaomi', rating: 4.4, reviewCount: 87, image: '📱', inStock: true, freeShipping: false, warranty: '6 mois' },
  { id: '6', name: 'Kit réparation écran universel', price: 29.99, category: 'accessoires', brand: 'RepairKit', rating: 4.6, reviewCount: 445, image: '🔧', inStock: true, freeShipping: true, warranty: '1 an' },
  { id: '7', name: 'Batterie Samsung Galaxy S23', price: 29.99, category: 'batteries', brand: 'Samsung', rating: 4.7, reviewCount: 201, image: '🔋', inStock: false, freeShipping: true, warranty: '2 ans' },
  { id: '8', name: 'Câble USB-C tressé 2m', price: 9.99, category: 'chargeurs', brand: 'Universel', rating: 4.2, reviewCount: 678, image: '🔌', inStock: true, freeShipping: false, warranty: '1 an' },
];

const MarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Helmet>
        <title>Marketplace Accessoires - TopRéparateurs</title>
        <meta name="description" content="Achetez coques, protections écran, batteries et accessoires pour smartphones. Livraison rapide et garantie." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Marketplace Accessoires</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Coques, protections, batteries et accessoires de qualité pour votre smartphone. Sélectionnés par nos réparateurs experts.
            </p>

            {/* Search */}
            <div className="mt-6 max-w-lg relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit, une marque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Shield, text: 'Garantie incluse' },
              { icon: Truck, text: 'Livraison rapide' },
              { icon: Star, text: 'Qualité certifiée' },
              { icon: ShoppingBag, text: 'Paiement sécurisé' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Categories */}
          <Tabs value={category} onValueChange={setCategory} className="mb-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Image placeholder */}
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-5xl mb-4">
                    {product.image}
                  </div>

                  {/* Badges */}
                  <div className="flex gap-1.5 mb-2">
                    {product.originalPrice && (
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    {product.freeShipping && (
                      <Badge variant="secondary" className="text-xs">
                        <Truck className="h-3 w-3 mr-1" />
                        Gratuit
                      </Badge>
                    )}
                    {!product.inStock && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Rupture
                      </Badge>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.brand} · Garantie {product.warranty}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">{product.price.toFixed(2)}€</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {product.originalPrice.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    <Button size="sm" disabled={!product.inStock}>
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
            </div>
          )}

          {/* Cross-sell CTA */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Besoin d'une réparation ?</h2>
              <p className="text-muted-foreground mb-4">
                Nos réparateurs certifiés sont là pour vous. Trouvez le meilleur réparateur près de chez vous.
              </p>
              <Button asChild>
                <a href="/ai-search">Trouver un réparateur</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MarketplacePage;
