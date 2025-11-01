import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminReauthGateProps {
  children: React.ReactNode;
}

export const AdminReauthGate = ({ children }: AdminReauthGateProps) => {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset verification on mount (force re-auth each session)
  useEffect(() => {
    setVerified(false);
    setPassword('');
    setError('');
  }, []);

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Mot de passe requis');
      return;
    }

    if (!user?.email) {
      setError('Email utilisateur introuvable');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (signInError) {
        console.error('❌ Ré-authentification échouée:', signInError);
        setError('Mot de passe incorrect');
        toast.error('Mot de passe incorrect');
        return;
      }

      console.log('✅ Ré-authentification admin réussie');
      toast.success('Accès admin vérifié');
      setVerified(true);
    } catch (err) {
      console.error('❌ Erreur ré-authentification:', err);
      setError('Erreur lors de la vérification');
      toast.error('Erreur lors de la vérification');
    } finally {
      setLoading(false);
      setPassword(''); // Clear password from memory
    }
  };

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Vérification Admin</CardTitle>
          <CardDescription>
            Veuillez confirmer votre mot de passe pour accéder à l'espace administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReauth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Mot de passe</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Entrez votre mot de passe"
                disabled={loading}
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password.trim()}
            >
              {loading ? 'Vérification...' : 'Vérifier et Accéder'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
