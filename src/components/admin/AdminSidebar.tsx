
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Heart, 
  BookOpen, 
  Tag, 
  Megaphone, 
  Search, 
  Package,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tab?: string;
  badge?: number;
  children?: SidebarItem[];
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['dashboard', 'gestion']);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isActive = (tab: string) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') === tab || (!searchParams.get('tab') && tab === 'dashboard');
  };

  const getNavLink = (tab: string) => `/admin?tab=${tab}`;

  const sections: SidebarSection[] = [
    {
      title: 'dashboard',
      items: [
        {
          title: 'Dashboard',
          icon: LayoutDashboard,
          tab: 'dashboard'
        }
      ]
    },
    {
      title: 'gestion',
      items: [
        {
          title: 'Réparateurs',
          icon: Users,
          tab: 'repairers'
        },
        {
          title: 'Abonnements',
          icon: UserCheck,
          tab: 'subscriptions'
        },
        {
          title: 'Demandes d\'intérêt',
          icon: Heart,
          tab: 'interest'
        }
      ]
    },
    {
      title: 'contenu',
      items: [
        {
          title: 'Blog',
          icon: BookOpen,
          tab: 'blog'
        },
        {
          title: 'Codes promo',
          icon: Tag,
          tab: 'promocodes'
        },
        {
          title: 'Publicités',
          icon: Megaphone,
          tab: 'advertising'
        }
      ]
    },
    {
      title: 'outils',
      items: [
        {
          title: 'Scraping',
          icon: Search,
          tab: 'scraping'
        },
        {
          title: 'Catalogue',
          icon: Package,
          href: '/admin/catalog'
        },
        {
          title: 'Paramètres',
          icon: Settings,
          href: '/admin/features'
        }
      ]
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
            <p className="text-xs text-gray-500">RepairHub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="capitalize">{section.title}</span>
              {expandedSections.includes(section.title) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes(section.title) && (
              <div className="ml-3 space-y-1">
                {section.items.map((item) => {
                  const isItemActive = item.tab ? isActive(item.tab) : false;
                  
                  if (item.href) {
                    return (
                      <NavLink
                        key={item.title}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors",
                          "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    );
                  }

                  return (
                    <NavLink
                      key={item.title}
                      to={getNavLink(item.tab!)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors",
                        isItemActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500">reine.elie@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
