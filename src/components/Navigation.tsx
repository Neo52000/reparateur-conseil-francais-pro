import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/native-dropdown';
import { Avatar, AvatarFallback } from '@/components/ui/native-avatar';
import { LogOut, Settings, User, Shield } from 'lucide-react';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  
  // Safe auth hook usage with fallback
  let user = null;
  let profile = null;
  let signOut = async () => ({ error: null });
  let loading = true;
  
  try {
    const auth = useAuth();
    user = auth.user;
    profile = auth.profile;
    signOut = auth.signOut;
    loading = auth.loading;
  } catch (error) {
    console.warn('Navigation: Auth context not available:', error);
  }

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
                    
                    <Button variant="ghost" onClick={() => navigate('/weather')}>
                      Météo
                    </Button>
                    
                    {profile?.role === 'repairer' && (
                      <Button variant="ghost" onClick={() => navigate('/repairer-dashboard')}>
                        Dashboard
                      </Button>
                    )}
                    
                    {profile?.role === 'admin' && (
                      <Button variant="ghost" onClick={() => navigate('/admin')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Paramètres</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Déconnexion</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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