import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  Eye, 
  ShoppingCart,
  Truck,
  Shield,
  Zap
} from 'lucide-react';

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

interface WayfairProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onQuickView: (product: Product) => void;
}

const WayfairProductCard: React.FC<WayfairProductCardProps> = ({
  product,
  viewMode,
  onQuickView
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleMouseEnter = () => {
    if (product.images.length > 1 && viewMode === 'grid') {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    if (product.images.length > 1 && viewMode === 'grid') {
      setCurrentImageIndex(0);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={product.images[0] || '/api/placeholder/200/200'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Badges overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isOnSale && (
                  <Badge variant="destructive" className="text-xs">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.isFreeShipping && (
                  <Badge variant="secondary" className="text-xs">
                    Livraison gratuite
                  </Badge>
                )}
              </div>

              {/* Bouton favoris */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </Button>
            </div>

            {/* Informations */}
            <div className="flex-1 space-y-2">
              <div>
                <Badge variant="outline" className="text-xs mb-1">
                  {product.brand}
                </Badge>
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </div>

              {/* Description courte */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} avis)
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
              </div>

              {/* Prix et actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {product.originalPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {product.isFreeShipping && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Livraison gratuite</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Garanti</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickView(product)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button size="sm">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vue grille
  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0">
        {/* Image avec overlay */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[currentImageIndex] || '/api/placeholder/300/300'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isOnSale && (
              <Badge variant="destructive" className="text-xs font-bold">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isFreeShipping && (
              <Badge className="bg-green-600 text-xs">
                <Truck className="h-3 w-3 mr-1" />
                Gratuit
              </Badge>
            )}
            {product.tags.includes('express') && (
              <Badge className="bg-orange-600 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Express
              </Badge>
            )}
          </div>

          {/* Actions overlay - apparaît au hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onQuickView(product)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              Aperçu rapide
            </Button>
          </div>

          {/* Bouton favoris */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </Button>

          {/* Indicateur stock faible */}
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="destructive" className="text-xs">
                Plus que {product.stock} en stock
              </Badge>
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="p-4 space-y-3">
          {/* Marque */}
          <Badge variant="outline" className="text-xs">
            {product.brand}
          </Badge>

          {/* Nom du produit */}
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Prix */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
                {product.price.toFixed(2)}€
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.originalPrice.toFixed(2)}€
                </span>
              )}
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {product.isFreeShipping && (
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                <span>Livraison gratuite</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Garantie incluse</span>
            </div>
          </div>

          {/* Bouton d'achat */}
          <Button 
            className="w-full group-hover:bg-primary-600 transition-colors"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WayfairProductCard;