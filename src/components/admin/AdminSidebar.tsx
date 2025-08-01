
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ShoppingCart,
  Search,
  MapPin,
  Smartphone,
  BookOpen,
  Gauge,
  Zap,
  Flag,
  Settings,
  Globe,
  Layout,
  Monitor
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
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
    
    // Technical
    { path: '/admin?tab=scraping', icon: Database, label: 'Scraping Réel', tab: 'scraping', category: 'Technical' },
    { path: '/admin?tab=automation', icon: Zap, label: 'Relances Automatiques', tab: 'automation', category: 'Technical' },
    { path: '/admin?tab=monitoring', icon: Gauge, label: 'Monitoring', tab: 'monitoring', category: 'Technical' },
    { path: '/admin?tab=system-optimization', icon: Zap, label: 'Optimisation Système', tab: 'system-optimization', category: 'Technical' },
    { path: '/admin?tab=chatbot', icon: Bot, label: 'Chatbot IA', tab: 'chatbot', category: 'Technical' },
    { path: '/admin?tab=documentation', icon: BookOpen, label: 'Documentation', tab: 'documentation', category: 'Technical' },
    { path: '/admin?tab=static-pages', icon: FileText, label: 'Pages Statiques', tab: 'static-pages', category: 'Technical' },
    
    { path: '/admin?tab=features-manager', icon: Settings, label: 'Gestion Fonctionnalités', tab: 'features-manager', category: 'Technical' },
    { path: '/admin?tab=plans-tester', icon: Layout, label: 'Test Plans UI', tab: 'plans-tester', category: 'Technical' },
    { path: '/admin?tab=dashboard-tester', icon: Monitor, label: 'Test Interface Réparateur', tab: 'dashboard-tester', category: 'Technical' },
    { path: '/admin?tab=pos-tester', icon: CreditCard, label: 'Test Interface POS', tab: 'pos-tester', category: 'Technical' },
    { path: '/admin?tab=pos-admin', icon: CreditCard, label: 'POS Admin', tab: 'pos-admin', category: 'Technical' },
    { path: '/admin?tab=ecommerce-admin', icon: ShoppingCart, label: 'E-commerce Admin', tab: 'ecommerce-admin', category: 'Technical' },
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

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Header du sidebar */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Administration</h2>
        <p className="text-sm text-muted-foreground">RepairHub</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = getCurrentTab() === item.tab;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
