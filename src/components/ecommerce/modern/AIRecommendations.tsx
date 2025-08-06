import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
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

interface AIRecommendationsProps {
  currentProduct?: Product;
  viewedProducts: Product[];
  onQuickView: (product: Product) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  currentProduct,
  viewedProducts,
  onQuickView
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Mock AI recommendations
  const mockRecommendations: Product[] = [
    {
      id: 'rec1',
      name: 'Écran iPhone 14 OLED Premium',
      price: 139.99,
      originalPrice: 169.99,
      images: ['/api/placeholder/300/300'],
      rating: 4.9,
      reviewCount: 156,
      description: 'Écran OLED de qualité premium',
      category: 'ecrans',
      brand: 'Premium Parts',
      isOnSale: true,
      isFreeShipping: true,
      stock: 8,
      sku: 'IPH14-OLED-001',
      tags: ['garantie-12mois', 'qualite-premium']
    },
    {
      id: 'rec2',
      name: 'Outil de réparation Pro Kit',
      price: 24.99,
      images: ['/api/placeholder/300/300'],
      rating: 4.7,
      reviewCount: 89,
      description: 'Kit d\'outils professionnel complet',
      category: 'outils',
      brand: 'RepairTools',
      isOnSale: false,
      isFreeShipping: false,
      stock: 15,
      sku: 'TOOL-KIT-001',
      tags: ['professionnel', 'complet']
    }
  ];

  useEffect(() => {
    // Simuler l'IA qui analyse les produits vus et recommande
    setRecommendations(mockRecommendations);
  }, [currentProduct, viewedProducts]);

  if (recommendations.length === 0) return null;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Vous pourriez aimer
          <span className="text-sm font-normal text-muted-foreground ml-2">
            Sélection IA personnalisée
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map(product => (
            <WayfairProductCard
              key={product.id}
              product={product}
              viewMode="grid"
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;