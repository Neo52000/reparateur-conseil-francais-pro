import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Quote,
  Package,
  Heart,
  Tag,
  Megaphone,
  BarChart3,
  Bot,
  Search,
  Zap,
  Globe,
  Settings,
  TestTube,
  ChevronDown,
  CreditCard,
  Store
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
  isPro?: boolean;
}

interface HorizontalAdminNavProps {
  className?: string;
}

const HorizontalAdminNav: React.FC<HorizontalAdminNavProps> = ({ className }) => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Navigation items principales (toujours visibles)
  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'repairers',
      label: 'Réparateurs',
      icon: <Users className="w-4 h-4" />,
      badge: 47
    },
    {
      id: 'quotes',
      label: 'Devis',
      icon: <Quote className="w-4 h-4" />,
      badge: 12
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'advertising-ai',
      label: 'Pub IA',
      icon: <Megaphone className="w-4 h-4" />,
      isNew: true
    }
  ];

  // Navigation items pour les outils (dropdown)
  const toolsItems: NavItem[] = [
    {
      id: 'catalog',
      label: 'Catalogue',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'interest',
      label: 'Demandes d\'intérêt',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'promocodes',
      label: 'Codes Promo',
      icon: <Tag className="w-4 h-4" />,
    },
    {
      id: 'scraping',
      label: 'Scraping',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'automation',
      label: 'Automation',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'blog',
      label: 'Blog & Contenu',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'chatbot',
      label: 'Chatbot',
      icon: <Bot className="w-4 h-4" />,
    }
  ];

  // Navigation items pour les interfaces (dropdown)
  const interfacesItems: NavItem[] = [
    {
      id: 'pos-admin',
      label: 'Administration POS',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'ecommerce-admin',
      label: 'E-commerce',
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: 'dashboard-tester',
      label: 'Test Dashboard',
      icon: <TestTube className="w-4 h-4" />,
    },
    {
      id: 'pos-tester',
      label: 'Test POS',
      icon: <TestTube className="w-4 h-4" />,
    },
    {
      id: 'plans-tester',
      label: 'Test Plans',
      icon: <TestTube className="w-4 h-4" />,
    }
  ];

  // Navigation items pour la configuration (dropdown)
  const configItems: NavItem[] = [
    {
      id: 'subscriptions',
      label: 'Abonnements',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'subdomains',
      label: 'Sous-domaines',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'landing-pages',
      label: 'Landing Pages',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'features-manager',
      label: 'Gestion Fonctionnalités',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: <Settings className="w-4 h-4" />,
    }
  ];

  const NavButton: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => (
    <NavLink to={`/admin?tab=${item.id}`}>
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        className={`
          relative gap-2 h-9 px-3
          ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}
          transition-all duration-200
        `}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
        
        {/* Badge */}
        {item.badge && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 px-1.5 text-xs bg-admin-orange text-white"
          >
            {item.badge}
          </Badge>
        )}
        
        {/* New indicator */}
        {item.isNew && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 px-1.5 text-xs bg-admin-green text-white"
          >
            NEW
          </Badge>
        )}
        
        {/* Pro indicator */}
        {item.isPro && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 px-1.5 text-xs bg-admin-purple text-white"
          >
            PRO
          </Badge>
        )}
      </Button>
    </NavLink>
  );

  const DropdownNavMenu: React.FC<{ 
    label: string; 
    items: NavItem[]; 
    icon: React.ReactNode;
    hasActiveItem: boolean;
  }> = ({ label, items, icon, hasActiveItem }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasActiveItem ? "default" : "ghost"}
          size="sm"
          className={`
            gap-2 h-9 px-3
            ${hasActiveItem ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}
            transition-all duration-200
          `}
        >
          {icon}
          <span className="font-medium">{label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.id} asChild>
            <NavLink 
              to={`/admin?tab=${item.id}`}
              className={`
                flex items-center gap-3 px-3 py-2 w-full cursor-pointer
                ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}
              `}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
              {item.isNew && (
                <Badge className="h-5 px-1.5 text-xs bg-admin-green text-white">
                  NEW
                </Badge>
              )}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className={`bg-card border-b border-border/60 px-6 py-3 ${className}`}>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Navigation principale */}
        {mainNavItems.map((item) => (
          <NavButton 
            key={item.id} 
            item={item} 
            isActive={activeTab === item.id} 
          />
        ))}
        
        <div className="h-6 w-px bg-border mx-2" />
        
        {/* Menus déroulants */}
        <DropdownNavMenu 
          label="Outils"
          icon={<Settings className="w-4 h-4" />}
          items={toolsItems}
          hasActiveItem={toolsItems.some(item => item.id === activeTab)}
        />
        
        <DropdownNavMenu 
          label="Interfaces"
          icon={<TestTube className="w-4 h-4" />}
          items={interfacesItems}
          hasActiveItem={interfacesItems.some(item => item.id === activeTab)}
        />
        
        <DropdownNavMenu 
          label="Config"
          icon={<Settings className="w-4 h-4" />}
          items={configItems}
          hasActiveItem={configItems.some(item => item.id === activeTab)}
        />
      </div>
    </nav>
  );
};

export default HorizontalAdminNav;