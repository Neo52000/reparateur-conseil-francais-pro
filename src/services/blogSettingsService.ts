
import { supabase } from '@/integrations/supabase/client';

export interface BlogSettings {
  site_title: string;
  site_description: string;
  posts_per_page: number;
  allow_comments: boolean;
  moderate_comments: boolean;
  default_meta_description: string;
  google_analytics_id: string;
  sitemap_enabled: boolean;
  newsletter_enabled: boolean;
  newsletter_welcome_subject: string;
  newsletter_welcome_content: string;
  notify_new_comment: boolean;
  notify_new_subscriber: boolean;
  admin_email: string;
  ai_auto_generate: boolean;
  ai_default_model: string;
  ai_content_length: string;
  header_image_url?: string;
}

export class BlogSettingsService {
  private static readonly SETTINGS_KEY = 'blog_settings';

  /**
   * Charge les paramètres du blog
   */
  static async loadSettings(): Promise<BlogSettings> {
    try {
      // Pour l'instant, on utilise localStorage
      // Plus tard, on pourra migrer vers une table Supabase
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }

    // Paramètres par défaut
    return {
      site_title: 'Blog RepairHub',
      site_description: 'Le blog de référence pour les réparateurs de smartphones',
      posts_per_page: 10,
      allow_comments: true,
      moderate_comments: true,
      default_meta_description: '',
      google_analytics_id: 'G-NH6F3RVC9G',
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
    };
  }

  /**
   * Sauvegarde les paramètres du blog
   */
  static async saveSettings(settings: BlogSettings): Promise<void> {
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      
      // Ici on pourrait aussi sauvegarder dans Supabase si nécessaire
      console.log('Paramètres sauvegardés:', settings);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      throw error;
    }
  }

  /**
   * Réinitialise les paramètres aux valeurs par défaut
   */
  static async resetSettings(): Promise<BlogSettings> {
    try {
      localStorage.removeItem(this.SETTINGS_KEY);
      return await this.loadSettings();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Met à jour un paramètre spécifique
   */
  static async updateSetting<K extends keyof BlogSettings>(
    key: K, 
    value: BlogSettings[K]
  ): Promise<void> {
    try {
      const settings = await this.loadSettings();
      settings[key] = value;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paramètre:', error);
      throw error;
    }
  }
}
