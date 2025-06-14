
import React from 'react';

interface AuthenticationStatusProps {
  authLoading: boolean;
  user: any;
  isAdmin: boolean;
  profile: any;
}

const AuthenticationStatus = ({ authLoading, user, isAdmin, profile }: AuthenticationStatusProps) => {
  if (authLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Vérification des permissions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette section.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Accès réservé aux administrateurs.</p>
        <p className="text-sm text-gray-500">
          Profil actuel: {profile?.role || 'non défini'} | Email: {profile?.email}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <p className="text-sm text-green-800">
        ✅ Connecté en tant qu'administrateur : {profile?.email}
      </p>
    </div>
  );
};

export default AuthenticationStatus;
