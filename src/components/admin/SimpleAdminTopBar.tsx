import React from 'react';
import { Search, Bell, Settings, User, Globe, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SimpleAdminTopBarProps {
  userName?: string;
  userEmail?: string;
  notificationCount?: number;
  onLogout?: () => void;
  onNewAction?: () => void;
  onVisitAction?: () => void;
  showNewButton?: boolean;
  showVisitButton?: boolean;
}

const SimpleAdminTopBar: React.FC<SimpleAdminTopBarProps> = ({
  userName = "Admin RepairHub",
  userEmail = "admin@repairhub.fr",
  notificationCount = 3,
  onLogout,
  onNewAction,
  onVisitAction,
  showNewButton = true,
  showVisitButton = true
}) => {
  return (
    <header className="h-8 bg-wp-header border-b border-wp-header/20 sticky top-0 z-50 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side - Logo & Quick Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-wp-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">R</span>
            </div>
            <span className="text-wp-header-foreground font-medium text-sm hidden sm:inline">
              TopRéparateurs.fr
            </span>
          </div>

          {/* Quick Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {showNewButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNewAction} 
                className="text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Nouveau
              </Button>
            )}
            {showVisitButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onVisitAction} 
                className="text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 px-2 text-xs"
              >
                <Globe className="w-3 h-3 mr-1" />
                Visiter
              </Button>
            )}
          </nav>
        </div>

        {/* Center - Search (simplified without state) */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-wp-header-foreground/40 w-3 h-3" />
            <Input 
              placeholder="Rechercher dans l'admin..." 
              className="pl-7 h-6 bg-wp-header-foreground/10 border-wp-header-foreground/20 text-wp-header-foreground placeholder:text-wp-header-foreground/40 text-xs focus:bg-wp-header-foreground/20" 
            />
          </div>
        </div>

        {/* Right side - User Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 w-7 p-0"
          >
            <Bell className="w-3 h-3" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-admin-red"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-wp-header-foreground">{userName}</p>
              <p className="text-xs text-wp-header-foreground/70">{userEmail}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLogout}
              className="text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleAdminTopBar;