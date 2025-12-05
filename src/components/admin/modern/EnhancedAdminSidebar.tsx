import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  LayoutDashboard, Users, Settings, BarChart3, Megaphone, 
  Bot, ShoppingCart, Wrench, FileText, Globe, ChevronDown,
  Star, Zap, Rocket, Shield, Database, Activity, Clock,
  Package, Receipt, MessageSquare, Building2, Map
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  isNew?: boolean;
  isPro?: boolean;
  children?: MenuItem[];
}

interface EnhancedAdminSidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

const EnhancedAdminSidebar: React.FC<EnhancedAdminSidebarProps> = ({ onCollapse }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [openSections, setOpenSections] = React.useState<string[]>(['dashboard', 'management']);

  const menuItems: MenuItem[] = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/admin?tab=analytics',
      icon: BarChart3,
      label: 'Analytics',
      children: [
        { path: '/admin?tab=analytics', icon: Activity, label: 'Vue d\'ensemble' },
        { path: '/admin?tab=performance', icon: Zap, label: 'Performance' },
        { path: '/admin?tab=seo-monitoring', icon: Globe, label: 'SEO Monitoring' },
      ]
    },
    {
      path: '/admin?tab=repairers',
      icon: Users,
      label: 'Réparateurs',
      badge: '1',
      children: [
        { path: '/admin?tab=repairers', icon: Users, label: 'Liste des réparateurs' },
        { path: '/admin?tab=subscriptions', icon: Star, label: 'Abonnements' },
        { path: '/admin?tab=dashboard-tester', icon: LayoutDashboard, label: 'Interface Réparateur', isNew: true },
      ]
    },
    {
      path: '/admin?tab=quotes',
      icon: Receipt,
      label: 'Devis & Commandes',
      badge: '1',
      children: [
        { path: '/admin?tab=quotes', icon: Receipt, label: 'Gestion des devis' },
        { path: '/admin?tab=interest', icon: MessageSquare, label: 'Demandes d\'intérêt' },
        { path: '/admin?tab=pos-tester', icon: ShoppingCart, label: 'Interface POS', isNew: true },
      ]
    },
    {
      path: '/admin?tab=catalog',
      icon: Package,
      label: 'Catalogue',
      children: [
        { path: '/admin?tab=catalog', icon: Package, label: 'Produits & Services' },
      ]
    },
    {
      path: '/admin?tab=marketing',
      icon: Megaphone,
      label: 'Marketing',
      isPro: true,
      children: [
        { path: '/admin?tab=advertising', icon: Megaphone, label: 'Publicités' },
        { path: '/admin?tab=advertising-ai', icon: Bot, label: 'Publicité IA', isPro: true },
        { path: '/admin?tab=blog', icon: FileText, label: 'Blog & Contenu' },
        { path: '/admin?tab=local-seo', icon: Map, label: 'SEO Local' },
      ]
    },
    {
      path: '/admin?tab=tools',
      icon: Wrench,
      label: 'Outils',
      children: [
        { path: '/admin?tab=scraping', icon: Database, label: 'Scraping' },
        { path: '/admin?tab=automation', icon: Rocket, label: 'Automatisation' },
        { path: '/admin?tab=chatbot', icon: Bot, label: 'Chatbot' },
        { path: '/admin?tab=suppliers', icon: Users, label: 'Annuaire Fournisseurs' },
        { path: '/admin?tab=monitoring', icon: Shield, label: 'Monitoring' },
      ]
    },
    {
      path: '/admin?tab=content',
      icon: Globe,
      label: 'Contenu',
      children: [
        { path: '/admin?tab=landing-pages', icon: Globe, label: 'Landing Pages' },
        { path: '/admin?tab=subdomains', icon: Building2, label: 'Sous-domaines' },
        { path: '/admin?tab=static-pages', icon: FileText, label: 'Pages statiques' },
      ]
    },
    {
      path: '/admin?tab=configuration',
      icon: Settings,
      label: 'Configuration',
      children: [
        { path: '/admin?tab=configuration', icon: Settings, label: 'Paramètres généraux' },
        { path: '/admin?tab=features-manager', icon: Zap, label: 'Gestion fonctionnalités' },
        { path: '/admin?tab=documentation', icon: FileText, label: 'Documentation' },
      ]
    },
  ];

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  const toggleSection = (sectionPath: string) => {
    setOpenSections(prev => 
      prev.includes(sectionPath) 
        ? prev.filter(p => p !== sectionPath)
        : [...prev, sectionPath]
    );
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' && !location.search;
    }
    return location.pathname + location.search === path;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.includes(item.path);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <Collapsible key={item.path} open={isOpen} onOpenChange={() => toggleSection(item.path)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between text-left font-normal",
                level === 0 ? "px-3 py-2 h-9" : "px-6 py-1.5 h-8 text-sm",
                active && "bg-wp-accent text-white hover:bg-wp-accent-hover",
                !active && "text-wp-sidebar-foreground hover:bg-muted",
                collapsed && level === 0 && "px-2"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("flex-shrink-0", level === 0 ? "w-4 h-4" : "w-3 h-3")} />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant={typeof item.badge === 'string' ? 'secondary' : 'default'} 
                        className="h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.isNew && (
                      <Badge variant="destructive" className="h-4 px-1 text-[10px]">NEW</Badge>
                    )}
                    {item.isPro && (
                      <Badge className="h-4 px-1 text-[10px] bg-admin-purple">PRO</Badge>
                    )}
                  </>
                )}
              </div>
              {!collapsed && <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />}
            </Button>
          </CollapsibleTrigger>
          {!collapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive: navIsActive }) =>
          cn(
            "flex items-center gap-3 w-full text-left font-normal transition-colors",
            level === 0 ? "px-3 py-2 h-9 rounded-md" : "px-6 py-1.5 h-8 text-sm rounded-md ml-3",
            (navIsActive || active) && "bg-wp-accent text-white hover:bg-wp-accent-hover",
            !(navIsActive || active) && "text-wp-sidebar-foreground hover:bg-muted",
            collapsed && level === 0 && "px-2 justify-center"
          )
        }
      >
        <item.icon className={cn("flex-shrink-0", level === 0 ? "w-4 h-4" : "w-3 h-3")} />
        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <Badge 
                variant={typeof item.badge === 'string' ? 'secondary' : 'default'} 
                className="h-5 px-1.5 text-xs ml-auto"
              >
                {item.badge}
              </Badge>
            )}
            {item.isNew && (
              <Badge variant="destructive" className="h-4 px-1 text-[10px] ml-auto">NEW</Badge>
            )}
            {item.isPro && (
              <Badge className="h-4 px-1 text-[10px] bg-admin-purple ml-auto">PRO</Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside 
      className={cn(
        "bg-wp-sidebar border-r border-border transition-all duration-300 sticky top-8 h-[calc(100vh-2rem)] flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="w-full justify-start text-wp-sidebar-foreground hover:bg-muted"
        >
          <LayoutDashboard className="w-4 h-4" />
          {!collapsed && <span className="ml-3">Réduire le menu</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            RepairHub Admin v2.0
          </div>
        </div>
      )}
    </aside>
  );
};

export default EnhancedAdminSidebar;