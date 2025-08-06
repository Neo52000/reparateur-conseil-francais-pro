import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Smartphone, Battery, Wrench, Shield } from 'lucide-react';

interface POSItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface ProductGridProps {
  items: POSItem[];
  onAddToCart: (item: POSItem) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'écrans':
      return <Smartphone className="w-8 h-8 text-blue-500" />;
    case 'batteries':
      return <Battery className="w-8 h-8 text-green-500" />;
    case 'services':
      return <Wrench className="w-8 h-8 text-orange-500" />;
    case 'accessoires':
      return <Shield className="w-8 h-8 text-purple-500" />;
    default:
      return <Package className="w-8 h-8 text-slate-400" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'écrans':
      return 'from-blue-50 to-blue-100 border-blue-200';
    case 'batteries':
      return 'from-green-50 to-green-100 border-green-200';
    case 'services':
      return 'from-orange-50 to-orange-100 border-orange-200';
    case 'accessoires':
      return 'from-purple-50 to-purple-100 border-purple-200';
    default:
      return 'from-slate-50 to-slate-100 border-slate-200';
  }
};

const ProductGrid: React.FC<ProductGridProps> = ({ items, onAddToCart }) => {
  const playAddSound = () => {
    // Son de validation tactile
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmMcBDWH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OGYTwwOUarm7blgGgU7k9n0unYrBSF1xe/eizEHHmq+8OScTg0PVqzl77JfGgc9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgU9mtvyxHcnBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgc9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgU9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgc9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgU9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgc9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgU9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ0PVqzl77JfGgc9mtvyxHcpBSh9y/HajDwIF2K37OKXTgwOUarm7rhiGgU6kdj0u3csBSJ2xu/eizAIHWq98OScTQ==');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors silently
  };

  const handleAddToCart = (item: POSItem) => {
    playAddSound();
    onAddToCart(item);
  };

  return (
    <div className="grid grid-cols-4 gap-4 overflow-y-auto h-[calc(100vh-280px)] pr-2">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className={`cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br ${getCategoryColor(item.category)} hover:from-primary/5 hover:to-primary/10`}
          onClick={() => handleAddToCart(item)}
        >
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              {/* Icône de catégorie améliorée */}
              <div className="w-full h-20 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                {getCategoryIcon(item.category)}
              </div>
              
              {/* Nom du produit */}
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-slate-800">
                {item.name}
              </h3>
              
              {/* SKU */}
              <p className="text-xs text-slate-500 font-mono bg-white/50 px-2 py-1 rounded">
                {item.sku}
              </p>
              
              {/* Prix et stock */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg text-primary">
                  {item.price.toFixed(2)}€
                </span>
                <Badge 
                  variant={item.stock > 10 ? "default" : item.stock > 5 ? "secondary" : item.stock > 0 ? "destructive" : "outline"} 
                  className="text-xs font-semibold"
                >
                  {item.stock > 0 ? `${item.stock} en stock` : 'Rupture'}
                </Badge>
              </div>
              
              {/* Catégorie */}
              <div className="pt-2 border-t border-white/30">
                <span className="text-xs text-slate-600 font-medium">
                  {item.category}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {items.length === 0 && (
        <div className="col-span-4 text-center py-16 text-slate-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">Aucun produit trouvé</p>
          <p className="text-sm">Modifiez votre recherche ou ajoutez des produits à l'inventaire</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;