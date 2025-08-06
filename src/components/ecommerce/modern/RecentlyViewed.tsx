import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface RecentlyViewedProps {
  onProductClick: (product: Product) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick }) => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  // Mock data - remplacer par localStorage
  const mockRecentProducts: Product[] = [
    {
      id: '1',
      name: 'Écran iPhone 13 Pro OLED',
      price: 129.99,
      images: ['/api/placeholder/150/150'],
      rating: 4.8,
      reviewCount: 127,
      description: 'Écran OLED de remplacement haute qualité',
      category: 'ecrans',
      brand: 'Premium Parts',
      isOnSale: true,
      isFreeShipping: true,
      stock: 15,
      sku: 'IPH13P-OLED-001',
      tags: ['garantie-6mois']
    },
    {
      id: '2',
      name: 'Batterie Samsung S22 Ultra',
      price: 45.99,
      images: ['/api/placeholder/150/150'],
      rating: 4.6,
      reviewCount: 89,
      description: 'Batterie lithium-ion de remplacement',
      category: 'batteries',
      brand: 'Samsung',
      isOnSale: false,
      isFreeShipping: false,
      stock: 23,
      sku: 'SGS22U-BAT-001',
      tags: ['garantie-12mois']
    },
    {
      id: '3',
      name: 'Coque iPhone 14 Protection',
      price: 19.99,
      images: ['/api/placeholder/150/150'],
      rating: 4.7,
      reviewCount: 65,
      description: 'Coque de protection résistante',
      category: 'accessoires',
      brand: 'SafeCase',
      isOnSale: false,
      isFreeShipping: true,
      stock: 42,
      sku: 'IPH14-CASE-001',
      tags: ['protection']
    }
  ];

  useEffect(() => {
    setRecentProducts(mockRecentProducts);
  }, []);

  if (recentProducts.length === 0) return null;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Récemment consultés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recentProducts.map(product => (
            <div
              key={product.id}
              className="flex-shrink-0 w-48 cursor-pointer group"
              onClick={() => onProductClick(product)}
            >
              <div className="border rounded-lg p-3 hover:shadow-md transition-all group-hover:border-primary">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded mb-3"
                />
                <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary">
                  {product.name}
                </h4>
                <p className="text-primary font-bold">{product.price.toFixed(2)}€</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentlyViewed;