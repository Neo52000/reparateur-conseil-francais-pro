import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import WayfairProductCard from './WayfairProductCard';

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

interface WayfairProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading: boolean;
  onQuickView: (product: Product) => void;
}

const WayfairProductGrid: React.FC<WayfairProductGridProps> = ({
  products,
  viewMode,
  loading,
  onQuickView
}) => {
  if (loading) {
    return (
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {Array.from({ length: 12 }, (_, i) => (
          <ProductCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
          <p className="text-muted-foreground mb-6">
            Essayez de modifier vos critères de recherche ou supprimez certains filtres.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>💡 Suggestions :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Vérifiez l'orthographe des mots-clés</li>
              <li>Utilisez des termes plus génériques</li>
              <li>Supprimez certains filtres</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
    }`}>
      {products.map(product => (
        <WayfairProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

const ProductCardSkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex gap-4">
          <Skeleton className="w-32 h-32 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};

export default WayfairProductGrid;