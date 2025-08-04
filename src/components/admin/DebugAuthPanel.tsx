import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Shield, Settings } from 'lucide-react';

/**
 * Panneau de debug pour l'authentification - à utiliser en développement
 */
export const DebugAuthPanel: React.FC = () => {
  const { 
    user, 
    profile, 
    session, 
    loading, 
    isAdmin, 
    canAccessClient, 
    canAccessRepairer, 
    canAccessAdmin,
    refreshProfile 
  } = useAuth();

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Panneau de Debug - Authentification
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshProfile}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État de chargement */}
        <div className="flex items-center gap-2">
          <span className="font-medium">État de chargement:</span>
          <Badge variant={loading ? "secondary" : "outline"}>
            {loading ? "En cours..." : "Terminé"}
          </Badge>
        </div>

        {/* Utilisateur */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">Utilisateur:</span>
            <Badge variant={user ? "default" : "destructive"}>
              {user ? "Connecté" : "Non connecté"}
            </Badge>
          </div>
          {user && (
            <div className="ml-6 text-sm text-muted-foreground">
              <p>ID: {user.id}</p>
              <p>Email: {user.email}</p>
              <p>Métadonnées: {JSON.stringify(user.user_metadata, null, 2)}</p>
            </div>
          )}
        </div>

        {/* Profil */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Profil:</span>
            <Badge variant={profile ? "default" : "destructive"}>
              {profile ? "Chargé" : "Non chargé"}
            </Badge>
          </div>
          {profile && (
            <div className="ml-6 text-sm text-muted-foreground">
              <p>ID: {profile.id}</p>
              <p>Email: {profile.email}</p>
              <p>Prénom: {profile.first_name || 'Non défini'}</p>
              <p>Nom: {profile.last_name || 'Non défini'}</p>
              <p>Rôle: {profile.role || 'Non défini'}</p>
            </div>
          )}
        </div>

        {/* Session */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Session:</span>
            <Badge variant={session ? "default" : "destructive"}>
              {session ? "Active" : "Inactive"}
            </Badge>
          </div>
          {session && (
            <div className="ml-6 text-sm text-muted-foreground">
              <p>Expiration: {new Date(session.expires_at || '').toLocaleString()}</p>
              <p>Token: {session.access_token ? `${session.access_token.substring(0, 20)}...` : 'Non disponible'}</p>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <span className="font-medium">Permissions:</span>
          <div className="flex flex-wrap gap-2 ml-6">
            <Badge variant={isAdmin ? "default" : "secondary"}>
              Admin: {isAdmin ? "✓" : "✗"}
            </Badge>
            <Badge variant={canAccessClient ? "default" : "secondary"}>
              Client: {canAccessClient ? "✓" : "✗"}
            </Badge>
            <Badge variant={canAccessRepairer ? "default" : "secondary"}>
              Réparateur: {canAccessRepairer ? "✓" : "✗"}
            </Badge>
            <Badge variant={canAccessAdmin ? "default" : "secondary"}>
              Admin Panel: {canAccessAdmin ? "✓" : "✗"}
            </Badge>
          </div>
        </div>

        {/* Diagnostic */}
        <div className="bg-muted p-3 rounded text-sm">
          <p className="font-medium mb-2">Diagnostic:</p>
          {!user && <p className="text-destructive">• Aucun utilisateur connecté</p>}
          {user && !profile && <p className="text-warning">• Utilisateur connecté mais profil non chargé</p>}
          {user && profile && !isAdmin && (
            <p className="text-warning">• Utilisateur connecté mais pas administrateur</p>
          )}
          {user && profile && isAdmin && (
            <p className="text-green-600">• Tout est correct - Accès admin accordé</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};