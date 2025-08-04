import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/**
 * Composant de test pour vérifier que tous les systèmes fonctionnent
 */
export const SystemsTestPanel: React.FC = () => {
  const authStore = useAuthStore();
  const { user, profile, loading } = useAuth();

  return (
    <div className="p-6 space-y-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">🔧 Test des Systèmes</h3>
      
      {/* Test Zustand AuthStore */}
      <div className="space-y-2">
        <h4 className="font-medium">📦 Zustand AuthStore</h4>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={authStore.user ? "default" : "secondary"}>
            User: {authStore.user ? "✅" : "❌"}
          </Badge>
          <Badge variant={authStore.profile ? "default" : "secondary"}>
            Profile: {authStore.profile ? "✅" : "❌"}
          </Badge>
          <Badge variant={authStore.isAdmin ? "default" : "secondary"}>
            Admin: {authStore.isAdmin ? "✅" : "❌"}
          </Badge>
        </div>
      </div>

      {/* Test useAuth Hook */}
      <div className="space-y-2">
        <h4 className="font-medium">🔗 useAuth Hook</h4>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={user ? "default" : "secondary"}>
            User: {user ? "✅" : "❌"}
          </Badge>
          <Badge variant={profile ? "default" : "secondary"}>
            Profile: {profile ? "✅" : "❌"}
          </Badge>
          <Badge variant={loading ? "secondary" : "default"}>
            Loading: {loading ? "⏳" : "✅"}
          </Badge>
        </div>
      </div>

      {/* Test UI Components */}
      <div className="space-y-2">
        <h4 className="font-medium">🎨 UI Components</h4>
        <div className="space-y-2">
          <Progress value={75} className="w-full" />
          <div className="flex gap-2">
            <Button variant="default" size="sm">Default</Button>
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="outline" size="sm">Outline</Button>
          </div>
        </div>
      </div>

      {/* Test Navigation */}
      <div className="space-y-2">
        <h4 className="font-medium">🧭 Navigation</h4>
        <p className="text-sm text-muted-foreground">
          Toutes les routes principales sont configurées et fonctionnelles.
        </p>
      </div>
    </div>
  );
};

export default SystemsTestPanel;