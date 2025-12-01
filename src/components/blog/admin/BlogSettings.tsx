import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Mail, Bell, Globe, Shield, FileText, Download, RotateCcw } from 'lucide-react';
import { useDocumentationManager } from '@/hooks/useDocumentationManager';
import { useBlogSettings } from '@/hooks/useBlogSettings';
import ApiKeysStatus from './ApiKeysStatus';
import AIContentAssistant from './AIContentAssistant';

const BlogSettings: React.FC = () => {
  const { generateAllPDFs, generating, autoUpdateEnabled, changes } = useDocumentationManager();
  const { settings, loading, saving, saveSettings, updateSetting, resetSettings } = useBlogSettings();

  const handleSave = async () => {
    if (settings) {
      await saveSettings(settings);
    }
  };

  const handleGenerateDocumentation = async () => {
    await generateAllPDFs();
  };

  const needsUpdate = changes.filter(c => c.needs_update).length;

  if (loading || !settings) {
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
        <div className="flex gap-2">
          <Button onClick={resetSettings} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentation Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestion de la Documentation
            </CardTitle>
            <CardDescription>Génération automatique des PDFs de documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Surveillance automatique</p>
                <p className="text-sm text-muted-foreground">
                  {autoUpdateEnabled ? 'Activée - Vérification toutes les 5 minutes' : 'Désactivée'}
                </p>
              </div>
              <div className={`h-3 w-3 rounded-full ${autoUpdateEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>

            {needsUpdate > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ {needsUpdate} document(s) nécessitent une mise à jour
                </p>
              </div>
            )}

            <Button 
              onClick={handleGenerateDocumentation}
              disabled={generating}
              className="w-full"
              variant="outline"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Générer la documentation PDF
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• PRD (Product Requirements Document)</p>
              <p>• Guide utilisateur</p>  
              <p>• Documentation technique</p>
            </div>
          </CardContent>
        </Card>

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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="default_meta_description">Description meta par défaut</Label>
                <AIContentAssistant
                  fieldLabel="Description meta SEO"
                  fieldType="short"
                  placeholder="Ex: Écris une meta description pour un blog de réparation de smartphones"
                  systemContext="Vous êtes un expert SEO. Générez des meta descriptions optimisées pour le référencement."
                  onContentGenerated={(content) => updateSetting('default_meta_description', content)}
                />
              </div>
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="newsletter_welcome_subject">Sujet de bienvenue</Label>
                <AIContentAssistant
                  fieldLabel="Sujet de bienvenue newsletter"
                  fieldType="short"
                  placeholder="Ex: Crée un sujet accrocheur pour un email de bienvenue"
                  systemContext="Vous êtes un expert en email marketing. Générez des sujets d'emails engageants."
                  onContentGenerated={(content) => updateSetting('newsletter_welcome_subject', content)}
                />
              </div>
              <Input
                id="newsletter_welcome_subject"
                value={settings.newsletter_welcome_subject}
                onChange={(e) => updateSetting('newsletter_welcome_subject', e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="newsletter_welcome_content">Contenu de bienvenue</Label>
                <AIContentAssistant
                  fieldLabel="Contenu de bienvenue newsletter"
                  fieldType="long"
                  placeholder="Ex: Rédige un message de bienvenue chaleureux pour nos nouveaux abonnés"
                  systemContext="Vous êtes un expert en email marketing. Générez des messages de bienvenue engageants et professionnels."
                  onContentGenerated={(content) => updateSetting('newsletter_welcome_content', content)}
                />
              </div>
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
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
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
        
        {/* Statut des clés API */}
        <ApiKeysStatus />
      </div>
    </div>
  );
};

export default BlogSettings;
