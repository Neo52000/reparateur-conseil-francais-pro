
import React from 'react';
import { Search, Bell, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  onRefresh: () => void;
  title?: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  onRefresh, 
  title = "Dashboard", 
  subtitle = "Vue d'ensemble de la plateforme" 
}) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Title section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        </div>

        {/* Actions section */}
        <div className="flex items-center space-x-3 ml-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 w-64 h-9"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
