import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Users, 
  History,
  Package, 
  BarChart3,
  Settings,
  Wrench,
  Euro,
  AlertTriangle,
  Smartphone,
  Zap,
  Brain
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

interface CompactPOSNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const CompactPOSNav: React.FC<CompactPOSNavProps> = ({ 
  activeTab, 
  onTabChange, 
  className 
}) => {
  // Navigation principale POS
  const mainNavItems: NavItem[] = [
    {
      id: 'sale',
      label: 'Vente',
      icon: <CreditCard className="w-4 h-4" />,
      variant: 'primary'
    },
    {
      id: 'customers',
      label: 'Clients',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'Historique',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Stock',
      icon: <Package className="w-4 h-4" />,
      badge: 3,
      variant: 'warning'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <BarChart3 className="w-4 h-4" />,
    }
  ];

  // Navigation modules spécialisés
  const moduleNavItems: NavItem[] = [
    {
      id: 'repairs',
      label: 'Réparations',
      icon: <Wrench className="w-4 h-4" />,
      badge: 5,
      variant: 'success'
    },
    {
      id: 'buyback',
      label: 'Rachat',
      icon: <Euro className="w-4 h-4" />,
      isNew: true
    },
    {
      id: 'alerts',
      label: 'Alertes',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: 2,
      variant: 'warning'
    },
    {
      id: 'mobile',
      label: 'Mobile',
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: 'integrations',
      label: 'Intégrations',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'business',
      label: 'Business',
      icon: <Brain className="w-4 h-4" />,
      isNew: true
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-4 h-4" />,
    }
  ];

  const getButtonVariant = (item: NavItem, isActive: boolean) => {
    if (isActive) {
      switch (item.variant) {
        case 'primary':
          return 'bg-admin-blue text-white hover:bg-admin-blue/90';
        case 'success':
          return 'bg-admin-green text-white hover:bg-admin-green/90';
        case 'warning':
          return 'bg-admin-orange text-white hover:bg-admin-orange/90';
        case 'secondary':
          return 'bg-admin-purple text-white hover:bg-admin-purple/90';
        default:
          return 'bg-primary text-primary-foreground hover:bg-primary/90';
      }
    }
    return 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground';
  };

  const getBadgeColor = (variant?: string) => {
    switch (variant) {
      case 'warning':
        return 'bg-admin-orange text-white';
      case 'success':
        return 'bg-admin-green text-white';
      case 'primary':
        return 'bg-admin-blue text-white';
      default:
        return 'bg-admin-purple text-white';
    }
  };

  const NavButton: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => (
    <Button
      onClick={() => onTabChange(item.id)}
      size="sm"
      className={`
        relative gap-2 h-10 px-4 transition-all duration-200 rounded-lg
        ${getButtonVariant(item, isActive)}
        shadow-sm hover:shadow-md
      `}
    >
      {item.icon}
      <span className="font-medium text-sm">{item.label}</span>
      
      {/* Badge */}
      {item.badge && (
        <Badge 
          className={`ml-1 h-5 px-1.5 text-xs ${getBadgeColor(item.variant)}`}
        >
          {item.badge}
        </Badge>
      )}
      
      {/* New indicator */}
      {item.isNew && (
        <Badge className="ml-1 h-5 px-1.5 text-xs bg-admin-green text-white animate-pulse">
          NEW
        </Badge>
      )}
    </Button>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Navigation principale */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {mainNavItems.map((item) => (
            <NavButton 
              key={item.id} 
              item={item} 
              isActive={activeTab === item.id} 
            />
          ))}
        </div>
      </div>

      {/* Navigation modules */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-4">
        <div className="text-xs font-medium text-muted-foreground mb-3 text-center">
          MODULES SPÉCIALISÉS
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {moduleNavItems.map((item) => (
            <NavButton 
              key={item.id} 
              item={item} 
              isActive={activeTab === item.id} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompactPOSNav;