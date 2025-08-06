import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  brand: string;
  isOnSale: boolean;
}

interface ProductComparatorProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

const ProductComparator: React.FC<ProductComparatorProps> = ({
  products,
  onRemoveProduct,
  onClearAll
}) => {
  if (products.length === 0) return null;

  return (
    <Card className="sticky bottom-4 mx-4 shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Comparateur ({products.length}/4)</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Vider tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 p-1 h-6 w-6 bg-destructive text-white hover:bg-destructive/80 rounded-full z-10"
                onClick={() => onRemoveProduct(product.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <img
                  src={product.images[0] || '/api/placeholder/100/100'}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded mb-2"
                />
                <h4 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h4>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{product.rating}</span>
                </div>
                <p className="text-sm font-bold text-primary">{product.price.toFixed(2)}€</p>
              </div>
            </div>
          ))}
        </div>
        
        {products.length >= 2 && (
          <Button className="w-full mt-4">
            Comparer ces produits
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductComparator;