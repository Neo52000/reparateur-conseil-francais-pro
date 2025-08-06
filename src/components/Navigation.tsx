import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  SimpleDropdownMenu,
  SimpleDropdownMenuContent,
  SimpleDropdownMenuItem,
  SimpleDropdownMenuTrigger,
} from '@/components/ui/simple-dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User, Shield } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="text-xl font-bold text-primary cursor-pointer"
          >
            RepairHub
          </button>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/search')}>
                      Rechercher
                    </Button>
                    
                    {profile?.role === 'repairer' && (
                      <Button variant="ghost" onClick={() => navigate('/repairer/dashboard')}>
                        Dashboard
                      </Button>
                    )}
                    
                    {profile?.role === 'admin' && (
                      <Button variant="ghost" onClick={() => navigate('/admin')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    )}

                    <SimpleDropdownMenu>
                      <SimpleDropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </SimpleDropdownMenuTrigger>
                      <SimpleDropdownMenuContent className="w-56" align="end">
                        <SimpleDropdownMenuItem onClick={() => navigate('/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </SimpleDropdownMenuItem>
                        <SimpleDropdownMenuItem onClick={() => navigate('/settings')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Paramètres</span>
                        </SimpleDropdownMenuItem>
                        <SimpleDropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Déconnexion</span>
                        </SimpleDropdownMenuItem>
                      </SimpleDropdownMenuContent>
                    </SimpleDropdownMenu>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/auth')}>
                      Connexion
                    </Button>
                    <Button onClick={() => navigate('/auth?tab=signup')}>
                      S'inscrire
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;