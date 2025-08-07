import { useState, FormEvent } from 'react';
import { Search, Bell, Settings, User, Globe, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
interface AdminTopBarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}
const AdminTopBar = ({
  userName = "Admin RepairHub",
  userEmail = "admin@repairhub.fr",
  userAvatar,
  notificationCount = 3,
  onSearch,
  onLogout
}: AdminTopBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };
  return <header className="h-8 bg-wp-header border-b border-wp-header/20 sticky top-0 z-50 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side - Logo & Quick Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-wp-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">R</span>
            </div>
            <span className="text-wp-header-foreground font-medium text-sm hidden sm:inline">TopRéparateurs.fr
          </span>
          </div>

          {/* Quick Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 px-2 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Nouveau
            </Button>
            <Button variant="ghost" size="sm" className="text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 px-2 text-xs">
              <Globe className="w-3 h-3 mr-1" />
              Visiter
            </Button>
          </nav>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-wp-header-foreground/40 w-3 h-3" />
            <Input placeholder="Rechercher dans l'admin..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-6 bg-wp-header-foreground/10 border-wp-header-foreground/20 text-wp-header-foreground placeholder:text-wp-header-foreground/40 text-xs focus:bg-wp-header-foreground/20" />
          </form>
        </div>

        {/* Right side - User Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 w-7 p-0">
                <Bell className="w-3 h-3" />
                {notificationCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-admin-red">
                    {notificationCount}
                  </Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-2 text-xs font-medium text-muted-foreground">Notifications récentes</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start gap-2 p-3">
                <div className="w-2 h-2 bg-admin-blue rounded-full mt-1.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-medium">Nouveau réparateur inscrit</div>
                  <div className="text-muted-foreground">Il y a 5 minutes</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start gap-2 p-3">
                <div className="w-2 h-2 bg-admin-green rounded-full mt-1.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-medium">Commande complétée</div>
                  <div className="text-muted-foreground">Il y a 12 minutes</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-wp-header-foreground/70 hover:text-wp-header-foreground hover:bg-wp-header-foreground/10 h-7 px-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="text-[10px] bg-wp-accent text-white">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs hidden sm:inline max-w-20 truncate">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2">
                <div className="text-xs font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <User className="w-3 h-3 mr-2" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <Settings className="w-3 h-3 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive" onClick={onLogout}>
                <LogOut className="w-3 h-3 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
};
export default AdminTopBar;