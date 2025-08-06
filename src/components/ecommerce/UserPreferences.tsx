import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Eye, Bell, Settings, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Phase 11: Gestion des préférences utilisateur
const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<any>({
    favorite_products: [],
    recently_viewed: [],
    preferred_brands: [],
    preferred_categories: [],
    notification_settings: {
      email_notifications: true,
      push_notifications: false,
      marketing_emails: false,
      order_updates: true,
      price_alerts: true
    },
    display_settings: {
      items_per_page: 12,
      grid_view: true,
      currency: 'EUR',
      language: 'fr'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos préférences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...preferences
        });

      if (error) throw error;

      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences ont été mises à jour"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      notification_settings: {
        ...preferences.notification_settings,
        [key]: value
      }
    });
  };

  const updateDisplaySetting = (key: string, value: any) => {
    setPreferences({
      ...preferences,
      display_settings: {
        ...preferences.display_settings,
        [key]: value
      }
    });
  };

  const removeFavorite = (productId: string) => {
    setPreferences({
      ...preferences,
      favorite_products: preferences.favorite_products.filter((id: string) => id !== productId)
    });
  };

  const clearRecentlyViewed = () => {
    setPreferences({
      ...preferences,
      recently_viewed: []
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement de vos préférences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Mes préférences
        </h2>
        <p className="text-muted-foreground">
          Personnalisez votre expérience d'achat
        </p>
      </div>

      {/* Favoris */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Produits favoris ({preferences.favorite_products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preferences.favorite_products?.length > 0 ? (
            <div className="space-y-2">
              {preferences.favorite_products.slice(0, 5).map((productId: string) => (
                <div key={productId} className="flex items-center justify-between p-2 border rounded">
                  <span>Produit {productId.slice(0, 8)}...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {preferences.favorite_products.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  +{preferences.favorite_products.length - 5} autres favoris
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun produit en favori</p>
          )}
        </CardContent>
      </Card>

      {/* Récemment consultés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Récemment consultés ({preferences.recently_viewed?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preferences.recently_viewed?.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {preferences.recently_viewed.slice(0, 5).map((productId: string) => (
                  <Badge key={productId} variant="outline">
                    Produit {productId.slice(0, 8)}...
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearRecentlyViewed}
              >
                Effacer l'historique
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun produit consulté récemment</p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="email_notifications"
              checked={preferences.notification_settings?.email_notifications}
              onCheckedChange={(checked) => updateNotificationSetting('email_notifications', checked)}
            />
            <Label htmlFor="email_notifications">Notifications par email</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="push_notifications"
              checked={preferences.notification_settings?.push_notifications}
              onCheckedChange={(checked) => updateNotificationSetting('push_notifications', checked)}
            />
            <Label htmlFor="push_notifications">Notifications push</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="order_updates"
              checked={preferences.notification_settings?.order_updates}
              onCheckedChange={(checked) => updateNotificationSetting('order_updates', checked)}
            />
            <Label htmlFor="order_updates">Mises à jour des commandes</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="price_alerts"
              checked={preferences.notification_settings?.price_alerts}
              onCheckedChange={(checked) => updateNotificationSetting('price_alerts', checked)}
            />
            <Label htmlFor="price_alerts">Alertes de prix</Label>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Switch
              id="marketing_emails"
              checked={preferences.notification_settings?.marketing_emails}
              onCheckedChange={(checked) => updateNotificationSetting('marketing_emails', checked)}
            />
            <Label htmlFor="marketing_emails">Emails promotionnels</Label>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres d'affichage */}
      <Card>
        <CardHeader>
          <CardTitle>Affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Produits par page</Label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={preferences.display_settings?.items_per_page}
              onChange={(e) => updateDisplaySetting('items_per_page', parseInt(e.target.value))}
            >
              <option value={6}>6 produits</option>
              <option value={12}>12 produits</option>
              <option value={24}>24 produits</option>
              <option value={48}>48 produits</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="grid_view"
              checked={preferences.display_settings?.grid_view}
              onCheckedChange={(checked) => updateDisplaySetting('grid_view', checked)}
            />
            <Label htmlFor="grid_view">Vue en grille (sinon liste)</Label>
          </div>

          <div>
            <Label>Devise</Label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={preferences.display_settings?.currency}
              onChange={(e) => updateDisplaySetting('currency', e.target.value)}
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={savePreferences}
          disabled={saving}
          className="flex-1"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder les préférences"}
        </Button>
        
        <Button 
          variant="outline"
          onClick={fetchUserPreferences}
          disabled={loading}
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default UserPreferences;