
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
  ShoppingCart
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard' },
    { path: '/admin?tab=subscriptions', icon: CreditCard, label: 'Abonnements', tab: 'subscriptions' },
    { path: '/admin?tab=repairers', icon: Users, label: 'Réparateurs', tab: 'repairers' },
    { path: '/admin?tab=interest', icon: Heart, label: 'Demandes d\'intérêt', tab: 'interest' },
    { path: '/admin?tab=promocodes', icon: Tag, label: 'Codes promo', tab: 'promocodes' },
    { path: '/admin?tab=advertising', icon: Megaphone, label: 'Publicités', tab: 'advertising' },
    { path: '/admin?tab=scraping', icon: Database, label: 'Scraping', tab: 'scraping' },
    { path: '/admin?tab=blog', icon: PenTool, label: 'Blog', tab: 'blog' },
    { path: '/admin?tab=chatbot', icon: Bot, label: 'Chatbot IA', tab: 'chatbot' },
    { path: '/admin?tab=pos-admin', icon: CreditCard, label: 'POS Admin', tab: 'pos-admin' },
    { path: '/admin?tab=ecommerce-admin', icon: ShoppingCart, label: 'E-commerce Admin', tab: 'ecommerce-admin' },
    { path: '/admin/audit', icon: ShieldCheck, label: 'Logs d\'audit', tab: 'audit' },
    { path: '/admin/audit/dashboard', icon: FileText, label: 'Dashboard d\'audit', tab: 'audit-dashboard' }
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
