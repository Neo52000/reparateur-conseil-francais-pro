import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Wrench, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
  requiresAuth?: boolean;
  role?: 'client' | 'repairer' | 'admin';
}

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, canAccessClient, canAccessRepairer, canAccessAdmin } = useAuth();

  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { icon: Home, label: 'Accueil', path: '/' },
      { icon: Search, label: 'Rechercher', path: '/search' },
    ];

    if (user) {
      if (canAccessClient) {
        items.push({ icon: User, label: 'Client', path: '/client', role: 'client' });
      }
      if (canAccessRepairer) {
        items.push({ icon: Wrench, label: 'Réparateur', path: '/repairer', role: 'repairer', badge: 3 });
      }
      if (canAccessAdmin) {
        items.push({ icon: Shield, label: 'Admin', path: '/admin', role: 'admin' });
      }
    } else {
      items.push({ icon: User, label: 'Connexion', path: '/client-auth' });
    }

    return items;
  };

  const navItems = getNavItems();
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon avec badge */}
              <div className="relative">
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {item.label}
              </span>

              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-lg"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};
