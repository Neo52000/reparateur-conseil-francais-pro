import { ReactNode } from 'react';
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
  Store,
  ShoppingBag,
  Euro,
  TrendingUp,
  Settings2,
  FileText
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
  icon: ReactNode;
  badge?: string | number;
  isNew?: boolean;
  isPro?: boolean;
  disabled?: boolean;
}

interface HorizontalAdminNavProps {
  className?: string;
}

const HorizontalAdminNav = ({ className }: HorizontalAdminNavProps) => {
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
      badge: 1
    },
    {
      id: 'quotes',
      label: 'Devis',
      icon: <Quote className="w-4 h-4" />,
      badge: 1
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    }
  ];

  // Navigation items pour les outils (dropdown) - TODO: Réactiver selon plan Supabase
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
      label: 'Codes Promo (Bientôt)',
      icon: <Tag className="w-4 h-4" />,
      disabled: true,
    },
    {
      id: 'suppliers',
      label: 'Annuaire Fournisseurs (Bientôt)',
      icon: <Store className="w-4 h-4" />,
      disabled: true,
    },
    {
      id: 'scraping',
      label: 'Scraping',
      icon: <Search className="w-4 h-4" />,
      isNew: true,
    },
    {
      id: 'automation',
      label: 'Automation (Bientôt)',
      icon: <Zap className="w-4 h-4" />,
      disabled: true,
    },
    {
      id: 'blog',
      label: 'Blog & Contenu',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'chatbot',
      label: 'Chatbot (Bientôt)',
      icon: <Bot className="w-4 h-4" />,
      disabled: true,
    }
  ];

  // Documentation (lien externe)
  const documentationItems = [
    {
      id: 'documentation',
      label: 'Documentation & PDFs',
      icon: <FileText className="w-4 h-4" />,
      isNew: true
    }
  ];

  // Navigation items pour Shopify (dropdown) - TODO: Réactiver quand plan Supabase upgradé
  const shopifyItems: NavItem[] = [
    {
      id: 'shopify-dashboard',
      label: 'Dashboard Shopify (Bientôt)',
      icon: <Store className="w-4 h-4" />,
      isNew: true,
      disabled: true,
    },
    {
      id: 'shopify-stores',
      label: 'Boutiques (Bientôt)',
      icon: <ShoppingBag className="w-4 h-4" />,
      isNew: true,
      disabled: true,
    },
    {
      id: 'shopify-orders',
      label: 'Commandes (Bientôt)',
      icon: <Package className="w-4 h-4" />,
      isNew: true,
      disabled: true,
    },
    {
      id: 'shopify-commissions',
      label: 'Commissions (Bientôt)',
      icon: <Euro className="w-4 h-4" />,
      isNew: true,
      disabled: true,
    },
    {
      id: 'shopify-analytics',
      label: 'Analytics (Bientôt)',
      icon: <TrendingUp className="w-4 h-4" />,
      isNew: true,
      disabled: true,
    },
    {
      id: 'shopify-settings',
      label: 'Configuration (Bientôt)',
      icon: <Settings2 className="w-4 h-4" />,
      isNew: true,
      disabled: true,
    }
  ];

  // Navigation items pour le SEO (dropdown)
  const seoItems: NavItem[] = [
    {
      id: 'local-seo',
      label: 'SEO Local',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'repairer-seo',
      label: 'Pages SEO Réparateurs',
      icon: <FileText className="w-4 h-4" />,
      isNew: true
    },
    {
      id: 'seo-tools',
      label: 'Outils SEO',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'seo-monitoring',
      label: 'Monitoring SEO',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'repair-generator',
      label: 'Générateur Contenu',
      icon: <Bot className="w-4 h-4" />,
    }
  ];

  // Navigation items pour les tests (dropdown) - SUPPRIMÉ pour réduire les fonctions
  const testersItems: NavItem[] = [];

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

  const NavButton = ({ item, isActive }: { item: NavItem; isActive: boolean }) => (
    <NavLink to={`/admin?tab=${item.id}`}>
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        className={`
          relative gap-2 h-9 px-2 sm:px-3
          ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}
          transition-all duration-200
        `}
      >
        {item.icon}
        <span className="font-medium hidden sm:inline">{item.label}</span>
        
        {/* Badge - hidden on mobile */}
        {item.badge && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 px-1.5 text-xs bg-admin-orange text-white hidden sm:inline-flex absolute sm:relative -top-1 -right-1 sm:top-auto sm:right-auto"
          >
            {item.badge}
          </Badge>
        )}
        
        {/* New indicator - hidden on mobile */}
        {item.isNew && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 px-1.5 text-xs bg-admin-green text-white hidden sm:inline-flex"
          >
            NEW
          </Badge>
        )}
        
        {/* Pro indicator - hidden on mobile */}
        {item.isPro && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 px-1.5 text-xs bg-admin-purple text-white hidden sm:inline-flex"
          >
            PRO
          </Badge>
        )}
      </Button>
    </NavLink>
  );

  const DropdownNavMenu = ({ label, items, icon, hasActiveItem }: { 
    label: string; 
    items: NavItem[]; 
    icon: ReactNode;
    hasActiveItem: boolean;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasActiveItem ? "default" : "ghost"}
          size="sm"
          className={`
            gap-1 sm:gap-2 h-9 px-2 sm:px-3
            ${hasActiveItem ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}
            transition-all duration-200
          `}
        >
          {icon}
          <span className="font-medium hidden sm:inline">{label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const isDisabled = item.label.includes('(Bientôt)');
          return (
            <DropdownMenuItem key={item.id} asChild disabled={isDisabled}>
              <NavLink 
                to={isDisabled ? '#' : `/admin?tab=${item.id}`}
                onClick={(e) => isDisabled && e.preventDefault()}
                className={`
                  flex items-center gap-3 px-3 py-2 w-full
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className={`bg-card border-b border-border/60 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
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
          label="SEO"
          icon={<Search className="w-4 h-4" />}
          items={seoItems}
          hasActiveItem={seoItems.some(item => item.id === activeTab)}
        />
        
        <DropdownNavMenu 
          label="Shopify"
          icon={<Store className="w-4 h-4" />}
          items={shopifyItems}
          hasActiveItem={shopifyItems.some(item => item.id === activeTab)}
        />
        
        {/* Tests menu supprimé pour réduire les fonctions */}
        
        <DropdownNavMenu 
          label="Config"
          icon={<Settings className="w-4 h-4" />}
          items={configItems}
          hasActiveItem={configItems.some(item => item.id === activeTab)}
        />

        <div className="h-6 w-px bg-border mx-1 sm:mx-2 hidden sm:block" />
        
        {/* Lien direct vers la documentation */}
        <a href="/documentation" target="_blank" rel="noopener noreferrer">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 sm:gap-2 h-9 px-2 sm:px-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Documentation</span>
            <Badge className="ml-1 h-5 px-1.5 text-xs bg-admin-green text-white hidden sm:inline-flex">
              NEW
            </Badge>
          </Button>
        </a>
      </div>
    </nav>
  );
};

export default HorizontalAdminNav;