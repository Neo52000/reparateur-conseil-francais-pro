
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
  ShieldCheck
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
    { path: '/admin/audit', icon: ShieldCheck, label: 'Logs d\'audit', tab: 'audit' }
  ];

  const getCurrentTab = () => {
    if (location.pathname === '/admin/audit') return 'audit';
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'dashboard';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Administration</h2>
      </div>
      
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = getCurrentTab() === item.tab;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
