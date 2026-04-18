import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import NotificationSystem from './NotificationSystem';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import Logo from './Logo';
import { User, Wrench, Shield, Menu, Search, BookOpen, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, isAdmin, signOut, profile, canAccessClient, canAccessRepairer, canAccessAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Déconnexion réussie', description: 'Vous avez été déconnecté avec succès' });
      navigate('/', { replace: true });
    } catch {
      toast({ title: 'Déconnexion effectuée', description: 'Vous avez été déconnecté' });
      navigate('/', { replace: true });
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const publicLinks = [
    { to: '/search', label: 'Trouver un réparateur', icon: Search },
    { to: '/blog', label: 'Blog', icon: BookOpen },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      aria-label="Navigation principale"
    >
      <div className="container">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">
          {/* Left: Logo + primary links (desktop) */}
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/" className="flex items-center shrink-0" aria-label="Accueil TopRéparateurs">
              <Logo variant="compact" size="xxl" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {publicLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/80 hover:text-primary hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user && (canAccessClient || canAccessRepairer || canAccessAdmin) && (
                <span className="mx-2 h-5 w-px bg-border" aria-hidden />
              )}

              {user && canAccessClient && (
                <Link
                  to="/client"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/client') ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-primary hover:bg-muted'
                  }`}
                >
                  <User className="h-4 w-4" aria-hidden />
                  Client
                  {isAdmin && <span className="ml-1 text-xs bg-primary/10 text-primary px-1 rounded">Test</span>}
                </Link>
              )}
              {user && canAccessRepairer && (
                <Link
                  to="/repairer"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/repairer') ? 'text-accent bg-accent/10' : 'text-foreground/80 hover:text-accent hover:bg-muted'
                  }`}
                >
                  <Wrench className="h-4 w-4" aria-hidden />
                  Réparateur
                  {isAdmin && <span className="ml-1 text-xs bg-accent/10 text-accent px-1 rounded">Test</span>}
                </Link>
              )}
              {user && canAccessAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/admin') ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-primary hover:bg-muted'
                  }`}
                >
                  <Shield className="h-4 w-4" aria-hidden />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <OfflineIndicator />
            {user && <NotificationSystem />}

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right leading-tight">
                  <span className="text-sm text-foreground/80">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  {isAdmin && <div className="text-xs text-primary font-medium">Administrateur</div>}
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" aria-hidden />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/client-auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" aria-hidden />
                    Se connecter
                  </Button>
                </Link>
                <Link to="/search">
                  <Button size="sm" className="shadow-elev-1">
                    <Search className="h-4 w-4 mr-2" aria-hidden />
                    Trouver un réparateur
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm">
                <SheetTitle className="sr-only">Menu principal</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <Logo variant="compact" size="xl" />
                  </div>

                  <nav className="flex flex-col gap-1 py-4" aria-label="Menu mobile">
                    {publicLinks.map(link => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={closeMobile}
                          className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                            isActive(link.to)
                              ? 'text-primary bg-primary/10'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                          {link.label}
                        </Link>
                      );
                    })}

                    {user && (canAccessClient || canAccessRepairer || canAccessAdmin) && (
                      <div className="h-px bg-border my-2" aria-hidden />
                    )}

                    {user && canAccessClient && (
                      <Link
                        to="/client"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <User className="h-5 w-5" aria-hidden />
                        Espace client
                      </Link>
                    )}
                    {user && canAccessRepairer && (
                      <Link
                        to="/repairer"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <Wrench className="h-5 w-5" aria-hidden />
                        Espace réparateur
                      </Link>
                    )}
                    {user && canAccessAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <Shield className="h-5 w-5" aria-hidden />
                        Administration
                      </Link>
                    )}
                  </nav>

                  <div className="mt-auto pt-4 border-t border-border space-y-2">
                    {user ? (
                      <>
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Connecté en tant que <span className="font-medium text-foreground">{profile?.first_name} {profile?.last_name}</span>
                        </div>
                        <Button onClick={() => { closeMobile(); handleSignOut(); }} variant="outline" className="w-full">
                          <LogOut className="h-4 w-4 mr-2" aria-hidden />
                          Déconnexion
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/search" onClick={closeMobile} className="block">
                          <Button className="w-full">
                            <Search className="h-4 w-4 mr-2" aria-hidden />
                            Trouver un réparateur
                          </Button>
                        </Link>
                        <Link to="/client-auth" onClick={closeMobile} className="block">
                          <Button variant="outline" className="w-full">
                            <User className="h-4 w-4 mr-2" aria-hidden />
                            Se connecter
                          </Button>
                        </Link>
                        <Link to="/repairer-auth" onClick={closeMobile} className="block">
                          <Button variant="ghost" className="w-full">
                            <Wrench className="h-4 w-4 mr-2" aria-hidden />
                            Je suis réparateur
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
