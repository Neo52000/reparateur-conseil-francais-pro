
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/hooks/auth/types';

interface AdminDebugPanelProps {
  user: User;
  profile: Profile | null;
  isAdmin: boolean;
  onRefreshProfile: () => void;
}

/**
 * Panneau de debug pour les problèmes d'accès admin
 * Affiche les informations de connexion et permet de diagnostiquer les problèmes
 */
const AdminDebugPanel: React.FC<AdminDebugPanelProps> = ({
  user,
  profile,
  isAdmin,
  onRefreshProfile
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto border-yellow-200 shadow-lg">
        <CardHeader className="bg-yellow-50 text-center">
          <CardTitle className="flex items-center justify-center text-yellow-800">
            <Shield className="h-6 w-6 mr-2" />
            Problème d'accès admin
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-6 space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>Utilisateur:</strong> {user.email}</p>
            <p><strong>Profil chargé:</strong> {profile ? 'Oui' : 'Non'}</p>
            <p><strong>Admin (via user_roles):</strong> {isAdmin ? 'Oui' : 'Non'}</p>
            <p><strong>Admin:</strong> {isAdmin ? 'Oui' : 'Non'}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={onRefreshProfile} 
              className="w-full" 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser le profil
            </Button>
            
            <Button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full" 
              variant="destructive"
            >
              Réinitialiser et recharger
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDebugPanel;
