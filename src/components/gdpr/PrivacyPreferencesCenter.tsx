import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, BarChart3, Cookie } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ConsentPreferences {
  marketing: boolean;
  newsletter: boolean;
  analytics: boolean;
  sms: boolean;
}

const PrivacyPreferencesCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    marketing: false,
    newsletter: false,
    analytics: true,
    sms: false,
  });

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('consent_type, consented')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const latestConsents: Record<string, boolean> = {};
        data.forEach((consent) => {
          if (!latestConsents[consent.consent_type]) {
            latestConsents[consent.consent_type] = consent.consented;
          }
        });

        setPreferences({
          marketing: latestConsents.marketing ?? false,
          newsletter: latestConsents.newsletter ?? false,
          analytics: latestConsents.analytics ?? true,
          sms: latestConsents.sms ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const consents = Object.entries(preferences).map(([type, consented]) => ({
        user_id: user.id,
        consent_type: type,
        consented,
        metadata: {
          source: 'preferences_center',
          version: '1.0',
        },
      }));

      const { error } = await supabase
        .from('user_consents')
        .insert(consents);

      if (error) throw error;

      toast({
        title: 'Préférences enregistrées',
        description: 'Vos préférences de confidentialité ont été mises à jour',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer vos préférences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof ConsentPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Communications marketing
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de communication pour les offres et actualités
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="marketing" className="text-base font-medium">
                Recevoir des offres commerciales
              </Label>
              <p className="text-sm text-muted-foreground">
                Promotions, offres spéciales et actualités de TopRéparateurs
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={() => handleToggle('marketing')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="newsletter" className="text-base font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Newsletter
              </Label>
              <p className="text-sm text-muted-foreground">
                Conseils, guides et articles sur la réparation
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={preferences.newsletter}
              onCheckedChange={() => handleToggle('newsletter')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="sms" className="text-base font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notifications SMS
              </Label>
              <p className="text-sm text-muted-foreground">
                Rappels de rendez-vous et notifications urgentes par SMS
              </p>
            </div>
            <Switch
              id="sms"
              checked={preferences.sms}
              onCheckedChange={() => handleToggle('sms')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Statistiques et analyses
          </CardTitle>
          <CardDescription>
            Aidez-nous à améliorer nos services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <Label htmlFor="analytics" className="text-base font-medium">
                Statistiques d'utilisation
              </Label>
              <p className="text-sm text-muted-foreground">
                Collecte anonyme de données pour améliorer l'expérience utilisateur
              </p>
            </div>
            <Switch
              id="analytics"
              checked={preferences.analytics}
              onCheckedChange={() => handleToggle('analytics')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            Cookies
          </CardTitle>
          <CardDescription>
            Les cookies nécessaires au fonctionnement du site sont toujours activés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pour gérer vos préférences de cookies en détail, consultez notre{' '}
            <a href="/cookies" className="text-primary hover:underline">
              politique de cookies
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSavePreferences} 
          disabled={saving}
          size="lg"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer mes préférences'}
        </Button>
      </div>
    </div>
  );
};

export default PrivacyPreferencesCenter;
