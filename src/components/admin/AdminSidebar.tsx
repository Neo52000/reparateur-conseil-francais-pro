import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Heart, 
  Tag, 
  Megaphone, 
  Database, 
  PenTool, 
  Bot,
  FileText,
  ShieldCheck,
  Search,
  MapPin,
  Smartphone,
  BookOpen,
  Gauge,
  Zap,
  Settings,
  Globe,
  Layout,
  Monitor,
  Activity,
  TrendingUp,
  Store,
  ShoppingBag,
  Package,
  Euro,
  Settings2,
  type LucideIcon
} from 'lucide-react';

interface MenuItemType {
  path: string;
  icon: LucideIcon;
  label: string;
  tab: string;
  category: string;
  isNew?: boolean;
  hasAlert?: boolean;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuItemType[] = [
    // Core
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard', category: 'Core' },
    { path: '/admin?tab=subscriptions', icon: CreditCard, label: 'Abonnements', tab: 'subscriptions', category: 'Core' },
    { path: '/admin?tab=repairers', icon: Users, label: 'Réparateurs', tab: 'repairers', category: 'Core' },
    { path: '/admin?tab=quotes', icon: FileText, label: 'Gestion Devis', tab: 'quotes', category: 'Core' },
    { path: '/admin?tab=catalog', icon: Database, label: 'Catalogue Produits', tab: 'catalog', category: 'Core' },
    { path: '/admin?tab=interest', icon: Heart, label: 'Demandes d\'intérêt', tab: 'interest', category: 'Core' },
    { path: '/admin?tab=analytics', icon: Gauge, label: 'Analytics', tab: 'analytics', category: 'Core' },
    
    // SEO & Performance
    { path: '/admin?tab=seo-monitoring', icon: Search, label: 'SEO Monitoring', tab: 'seo-monitoring', category: 'SEO & Performance', hasAlert: true },
    { path: '/admin?tab=local-seo', icon: MapPin, label: 'Local SEO', tab: 'local-seo', category: 'SEO & Performance' },
    { path: '/admin?tab=pagespeed-pro', icon: Gauge, label: 'PageSpeed Pro', tab: 'pagespeed-pro', category: 'SEO & Performance' },
    { path: '/admin?tab=performance', icon: Zap, label: 'Performance', tab: 'performance', category: 'SEO & Performance' },
    
    // Content & Marketing
    { path: '/admin?tab=blog', icon: PenTool, label: 'Blog', tab: 'blog', category: 'Content & Marketing' },
    { path: '/admin?tab=repair-generator', icon: Smartphone, label: 'Générateur Mobile', tab: 'repair-generator', category: 'Content & Marketing' },
    { path: '/admin?tab=subdomains', icon: Globe, label: 'Sous-domaines', tab: 'subdomains', category: 'Content & Marketing' },
    { path: '/admin?tab=landing-pages', icon: Layout, label: 'Landing Pages', tab: 'landing-pages', category: 'Content & Marketing' },
    { path: '/admin?tab=advertising-ai', icon: Megaphone, label: 'Publicité IA', tab: 'advertising-ai', category: 'Content & Marketing' },
    { path: '/admin?tab=promocodes', icon: Tag, label: 'Codes promo', tab: 'promocodes', category: 'Content & Marketing' },
    
    // Shopify Management
  { path: '/admin?tab=shopify-dashboard', icon: Store, label: 'Dashboard Shopify', tab: 'shopify-dashboard', category: 'Shopify Management', isNew: true },
  { path: '/admin?tab=shopify-stores', icon: ShoppingBag, label: 'Boutiques Réparateurs', tab: 'shopify-stores', category: 'Shopify Management', isNew: true },
  { path: '/admin?tab=shopify-orders', icon: Package, label: 'Commandes Globales', tab: 'shopify-orders', category: 'Shopify Management', isNew: true },
  { path: '/admin?tab=shopify-commissions', icon: Euro, label: 'Commissions & Payouts', tab: 'shopify-commissions', category: 'Shopify Management', isNew: true },
  { path: '/admin?tab=shopify-analytics', icon: TrendingUp, label: 'Analytics Shopify', tab: 'shopify-analytics', category: 'Shopify Management', isNew: true },
  { path: '/admin?tab=shopify-settings', icon: Settings2, label: 'Configuration API', tab: 'shopify-settings', category: 'Shopify Management', isNew: true },
    
    // Technical
    { path: '/admin?tab=scraping', icon: Database, label: 'Scraping Réel', tab: 'scraping', category: 'Technical' },
    { path: '/admin?tab=automation', icon: Zap, label: 'Relances Automatiques', tab: 'automation', category: 'Technical' },
    { path: '/admin?tab=monitoring', icon: Gauge, label: 'Monitoring', tab: 'monitoring', category: 'Technical' },
    { path: '/admin?tab=system-optimization', icon: Zap, label: 'Optimisation Système', tab: 'system-optimization', category: 'Technical' },
     { path: '/admin?tab=chatbot', icon: Bot, label: 'Chatbot IA', tab: 'chatbot', category: 'Technical' },
     { path: '/admin?tab=system-diagnostics', icon: Activity, label: 'Diagnostics Système', tab: 'system-diagnostics', category: 'Technical' },
     { path: '/admin?tab=chatbot-performance', icon: TrendingUp, label: 'Performance Chatbot', tab: 'chatbot-performance', category: 'Technical' },
    { path: '/admin?tab=documentation', icon: BookOpen, label: 'Documentation', tab: 'documentation', category: 'Technical' },
    { path: '/admin?tab=static-pages', icon: FileText, label: 'Pages Statiques', tab: 'static-pages', category: 'Technical' },
    
    { path: '/admin?tab=features-manager', icon: Settings, label: 'Gestion Fonctionnalités', tab: 'features-manager', category: 'Technical' },
    { path: '/admin?tab=plans-tester', icon: Layout, label: 'Test Plans UI', tab: 'plans-tester', category: 'Technical' },
     { path: '/admin?tab=dashboard-tester', icon: Monitor, label: 'Test Interface Réparateur', tab: 'dashboard-tester', category: 'Technical' },
    { path: '/admin/audit', icon: ShieldCheck, label: 'Logs d\'audit', tab: 'audit', category: 'Technical' },
    { path: '/admin/audit/dashboard', icon: FileText, label: 'Dashboard d\'audit', tab: 'audit-dashboard', category: 'Technical' }
  ];

  const getCurrentTab = () => {
    if (location.pathname === '/admin/audit') return 'audit';
    if (location.pathname === '/admin/audit/dashboard') return 'audit-dashboard';
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'dashboard';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const categories = [
    'Core',
    'SEO & Performance',
    'Content & Marketing',
    'Shopify Management',
    'Technical'
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Header du sidebar */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Administration</h2>
        <p className="text-sm text-muted-foreground">RepairHub</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {categories.map((category, idx) => {
          const categoryItems = menuItems.filter(item => item.category === category);
          
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="mb-4">
              {/* Category Label */}
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              
              {/* Category Items */}
              <div className="space-y-1">
                {categoryItems.map((item) => {
                  const isActive = getCurrentTab() === item.tab;
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start gap-3 ${
                        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.isNew && (
                        <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0.5">NEW</Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
              
              {/* Separator except after last category */}
              {idx < categories.length - 1 && (
                <div className="h-px bg-border my-3" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
