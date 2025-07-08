import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield,
  Plus,
  Minus,
  Zap,
  X
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

interface WayfairQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const WayfairQuickView: React.FC<WayfairQuickViewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!product) return null;

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const totalPrice = product.price * quantity;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Aperçu rapide du produit</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Image principale */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex] || '/api/placeholder/500/500'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isOnSale && (
                  <Badge variant="destructive" className="font-bold">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.isFreeShipping && (
                  <Badge className="bg-green-600">
                    <Truck className="h-3 w-3 mr-1" />
                    Livraison gratuite
                  </Badge>
                )}
                {product.tags.includes('express') && (
                  <Badge className="bg-orange-600">
                    <Zap className="h-3 w-3 mr-1" />
                    Express 24h
                  </Badge>
                )}
              </div>

              {/* Bouton favoris */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </Button>
            </div>

            {/* Miniatures */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image || '/api/placeholder/100/100'}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="space-y-6">
            {/* En-tête */}
            <div className="space-y-3">
              <Badge variant="outline">{product.brand}</Badge>
              <h2 className="text-2xl font-bold leading-tight">{product.name}</h2>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
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
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} avis)
                </span>
              </div>
            </div>

            <Separator />

            {/* Prix */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toFixed(2)}€
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPrice.toFixed(2)}€
                  </span>
                )}
                {product.isOnSale && (
                  <Badge variant="destructive">
                    Économisez {(product.originalPrice! - product.price).toFixed(2)}€
                  </Badge>
                )}
              </div>
              
              {quantity > 1 && (
                <p className="text-lg font-medium">
                  Total: <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                </p>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="space-y-3">
              <h3 className="font-semibold">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Garantie incluse</span>
                </div>
                {product.isFreeShipping && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>Livraison gratuite</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">SKU:</span>
                  <span className="text-muted-foreground">{product.sku}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Stock:</span>
                  <span className={`${product.stock < 5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {product.stock} disponible{product.stock > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Avantages</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Actions d'achat */}
            <div className="space-y-4">
              {/* Sélecteur de quantité */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantité:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </Button>
                <Button variant="outline" size="lg">
                  Acheter maintenant
                </Button>
              </div>

              {/* Informations livraison */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Livraison:</span>
                  <span className="text-muted-foreground">
                    {product.isFreeShipping ? 'Gratuite' : 'À partir de 5.99€'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Express:</span>
                  <span className="text-muted-foreground">
                    Livraison en 24h (+9.99€)
                  </span>
                </div>
              </div>

              {/* Stock faible */}
              {product.stock < 5 && product.stock > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    ⚠️ Attention! Il ne reste plus que {product.stock} produit{product.stock > 1 ? 's' : ''} en stock.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WayfairQuickView;