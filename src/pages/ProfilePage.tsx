import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos données de profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          {profile?.first_name && (
            <div>
              <label className="text-sm font-medium">Prénom</label>
              <p className="text-sm text-muted-foreground">{profile.first_name}</p>
            </div>
          )}
          
          {profile?.last_name && (
            <div>
              <label className="text-sm font-medium">Nom</label>
              <p className="text-sm text-muted-foreground">{profile.last_name}</p>
            </div>
          )}
          
          {profile?.role && (
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
          )}

          <div className="pt-4">
            <Button variant="destructive" onClick={handleSignOut}>
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;