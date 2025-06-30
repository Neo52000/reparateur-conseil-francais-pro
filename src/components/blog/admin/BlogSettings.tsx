
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Mail, Bell, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BlogSettingsData {
  // Paramètres généraux
  site_title: string;
  site_description: string;
  posts_per_page: number;
  allow_comments: boolean;
  moderate_comments: boolean;
  
  // SEO
  default_meta_description: string;
  google_analytics_id: string;
  sitemap_enabled: boolean;
  
  // Newsletter
  newsletter_enabled: boolean;
  newsletter_welcome_subject: string;
  newsletter_welcome_content: string;
  
  // Notifications
  notify_new_comment: boolean;
  notify_new_subscriber: boolean;
  admin_email: string;
  
  // IA
  ai_auto_generate: boolean;
  ai_default_model: string;
  ai_content_length: string;
}

const BlogSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BlogSettingsData>({
    site_title: 'Blog RepairHub',
    site_description: 'Le blog de référence pour les réparateurs de smartphones',
    posts_per_page: 10,
    allow_comments: true,
    moderate_comments: true,
    default_meta_description: '',
    google_analytics_id: '',
    sitemap_enabled: true,
    newsletter_enabled: true,
    newsletter_welcome_subject: 'Bienvenue sur notre newsletter !',
    newsletter_welcome_content: 'Merci de vous être abonné à notre newsletter. Vous recevrez nos derniers articles et conseils.',
    notify_new_comment: true,
    notify_new_subscriber: true,
    admin_email: '',
    ai_auto_generate: false,
    ai_default_model: 'mistral',
    ai_content_length: 'medium'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // En attendant une vraie table de settings, on utilise des valeurs par défaut
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Ici on sauvegarderait normalement dans une table blog_settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof BlogSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement des paramètres...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres du Blog</h2>
          <p className="text-muted-foreground">Configuration générale du système de blog</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Paramètres généraux
            </CardTitle>
            <CardDescription>Configuration de base du blog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site_title">Titre du site</Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) => updateSetting('site_title', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="site_description">Description du site</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="posts_per_page">Articles par page</Label>
              <Input
                id="posts_per_page"
                type="number"
                min="1"
                max="50"
                value={settings.posts_per_page}
                onChange={(e) => updateSetting('posts_per_page', parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="allow_comments"
                checked={settings.allow_comments}
                onCheckedChange={(checked) => updateSetting('allow_comments', checked)}
              />
              <Label htmlFor="allow_comments">Autoriser les commentaires</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="moderate_comments"
                checked={settings.moderate_comments}
                onCheckedChange={(checked) => updateSetting('moderate_comments', checked)}
              />
              <Label htmlFor="moderate_comments">Modérer les commentaires</Label>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO et Analytics</CardTitle>
            <CardDescription>Optimisation pour les moteurs de recherche</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="default_meta_description">Description meta par défaut</Label>
              <Textarea
                id="default_meta_description"
                value={settings.default_meta_description}
                onChange={(e) => updateSetting('default_meta_description', e.target.value)}
                placeholder="Description utilisée si aucune n'est spécifiée"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="google_analytics_id">ID Google Analytics</Label>
              <Input
                id="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="sitemap_enabled"
                checked={settings.sitemap_enabled}
                onCheckedChange={(checked) => updateSetting('sitemap_enabled', checked)}
              />
              <Label htmlFor="sitemap_enabled">Générer un sitemap XML</Label>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Newsletter
            </CardTitle>
            <CardDescription>Configuration de la newsletter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="newsletter_enabled"
                checked={settings.newsletter_enabled}
                onCheckedChange={(checked) => updateSetting('newsletter_enabled', checked)}
              />
              <Label htmlFor="newsletter_enabled">Activer la newsletter</Label>
            </div>
            
            <div>
              <Label htmlFor="newsletter_welcome_subject">Sujet de bienvenue</Label>
              <Input
                id="newsletter_welcome_subject"
                value={settings.newsletter_welcome_subject}
                onChange={(e) => updateSetting('newsletter_welcome_subject', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="newsletter_welcome_content">Contenu de bienvenue</Label>
              <Textarea
                id="newsletter_welcome_content"
                value={settings.newsletter_welcome_content}
                onChange={(e) => updateSetting('newsletter_welcome_content', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Paramètres de notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin_email">Email administrateur</Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => updateSetting('admin_email', e.target.value)}
                placeholder="admin@repairhub.fr"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="notify_new_comment"
                checked={settings.notify_new_comment}
                onCheckedChange={(checked) => updateSetting('notify_new_comment', checked)}
              />
              <Label htmlFor="notify_new_comment">Notifier les nouveaux commentaires</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="notify_new_subscriber"
                checked={settings.notify_new_subscriber}
                onCheckedChange={(checked) => updateSetting('notify_new_subscriber', checked)}
              />
              <Label htmlFor="notify_new_subscriber">Notifier les nouveaux abonnés</Label>
            </div>
          </CardContent>
        </Card>

        {/* IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Intelligence Artificielle
            </CardTitle>
            <CardDescription>Configuration de la génération automatique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="ai_auto_generate"
                checked={settings.ai_auto_generate}
                onCheckedChange={(checked) => updateSetting('ai_auto_generate', checked)}
              />
              <Label htmlFor="ai_auto_generate">Génération automatique activée</Label>
            </div>
            
            <div>
              <Label htmlFor="ai_default_model">Modèle IA par défaut</Label>
              <Select 
                value={settings.ai_default_model} 
                onValueChange={(value) => updateSetting('ai_default_model', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mistral">Mistral</SelectItem>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ai_content_length">Longueur de contenu par défaut</Label>
              <Select 
                value={settings.ai_content_length} 
                onValueChange={(value) => updateSetting('ai_content_length', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Court (300-500 mots)</SelectItem>
                  <SelectItem value="medium">Moyen (800-1200 mots)</SelectItem>
                  <SelectItem value="long">Long (1500-2000 mots)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion Newsletter</CardTitle>
            <CardDescription>Système de newsletter intégré</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Abonnés actifs</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-muted-foreground">Emails envoyés</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Gérer les abonnés
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Créer une campagne
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogSettings;
