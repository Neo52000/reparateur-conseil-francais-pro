import { supabase } from '@/integrations/supabase/client';

export interface RepairerSeoPage {
  id: string;
  repairer_id: string;
  slug: string;
  url_path: string;
  title: string;
  meta_description: string;
  h1_title: string;
  intro_paragraph: string;
  services_description: string;
  why_choose_us: string;
  structured_data: any;
  is_published: boolean;
  page_views: number;
  last_generated_at: string;
  sitemap_submitted_at?: string;
  google_indexed_at?: string;
  created_at: string;
  updated_at: string;
}

class RepairerSeoService {
  /**
   * Génère ou régénère une page SEO pour un réparateur
   */
  async generatePage(repairerId: string): Promise<{ success: boolean; message: string; url_path?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-repairer-seo-page', {
        body: { repairer_id: repairerId }
      });

      if (error) {
        console.error('❌ Erreur génération page SEO:', error);
        return {
          success: false,
          message: `Erreur: ${error.message}`
        };
      }

      if (data?.success) {
        return {
          success: true,
          message: data.message,
          url_path: data.url_path
        };
      }

      return {
        success: false,
        message: data?.error || 'Échec de la génération'
      };
    } catch (err) {
      console.error('❌ Erreur génération page SEO:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Récupère toutes les pages SEO des réparateurs
   */
  async getAllPages(): Promise<RepairerSeoPage[]> {
    try {
      const { data, error } = await supabase
        .from('repairer_seo_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('❌ Erreur récupération pages SEO:', err);
      return [];
    }
  }

  /**
   * Récupère une page SEO par son slug
   */
  async getPageBySlug(slug: string): Promise<RepairerSeoPage | null> {
    try {
      const { data, error } = await supabase
        .from('repairer_seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('❌ Erreur récupération page:', err);
      return null;
    }
  }

  /**
   * Récupère la page SEO d'un réparateur par son ID
   */
  async getPageByRepairerId(repairerId: string): Promise<RepairerSeoPage | null> {
    try {
      const { data, error } = await supabase
        .from('repairer_seo_pages')
        .select('*')
        .eq('repairer_id', repairerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('❌ Erreur récupération page par repairer_id:', err);
      return null;
    }
  }

  /**
   * Publie ou dépublie une page SEO
   */
  async togglePublish(pageId: string, isPublished: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('repairer_seo_pages')
        .update({ is_published: isPublished })
        .eq('id', pageId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Erreur mise à jour publication:', err);
      return false;
    }
  }

  /**
   * Supprime une page SEO
   */
  async deletePage(pageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('repairer_seo_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Erreur suppression page:', err);
      return false;
    }
  }

  /**
   * Génère des pages SEO pour tous les réparateurs payants qui n'en ont pas
   */
  async generateForAllPaidRepairers(): Promise<{
    total: number;
    success: number;
    failed: number;
    results: Array<{ repairer_id: string; business_name: string; success: boolean; message: string }>;
  }> {
    try {
      // Récupérer tous les réparateurs avec souscription active (non gratuite)
      const { data: subscriptions, error: subError } = await supabase
        .from('repairer_subscriptions')
        .select('repairer_id, subscription_tier')
        .eq('subscribed', true)
        .neq('subscription_tier', 'free');

      if (subError) throw subError;

      if (!subscriptions || subscriptions.length === 0) {
        return {
          total: 0,
          success: 0,
          failed: 0,
          results: []
        };
      }

      // Récupérer les infos des réparateurs
      const repairerIds = subscriptions.map(s => s.repairer_id);
      const { data: repairers, error: repError } = await supabase
        .from('repairers')
        .select('id, name')
        .in('id', repairerIds);

      if (repError) throw repError;

      // Vérifier quels réparateurs ont déjà une page SEO
      const { data: existingPages } = await supabase
        .from('repairer_seo_pages')
        .select('repairer_id')
        .in('repairer_id', repairerIds);

      const existingRepairerIds = new Set(existingPages?.map(p => p.repairer_id) || []);
      const repairersToGenerate = (repairers || []).filter(r => !existingRepairerIds.has(r.id));

      const results = [];
      let successCount = 0;
      let failedCount = 0;

      for (const repairer of repairersToGenerate) {
        const result = await this.generatePage(repairer.id);
        
        results.push({
          repairer_id: repairer.id,
          business_name: repairer.name,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }

        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        total: repairersToGenerate.length,
        success: successCount,
        failed: failedCount,
        results
      };
    } catch (err) {
      console.error('❌ Erreur génération batch:', err);
      throw err;
    }
  }

  /**
   * Obtient les statistiques globales
   */
  async getGlobalStats(): Promise<{
    totalPages: number;
    publishedPages: number;
    totalViews: number;
    averageViews: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('repairer_seo_pages')
        .select('page_views, is_published');

      if (error) throw error;

      const totalPages = data?.length || 0;
      const publishedPages = data?.filter(p => p.is_published).length || 0;
      const totalViews = data?.reduce((sum, p) => sum + (p.page_views || 0), 0) || 0;
      const averageViews = totalPages > 0 ? Math.round(totalViews / totalPages) : 0;

      return {
        totalPages,
        publishedPages,
        totalViews,
        averageViews
      };
    } catch (err) {
      console.error('❌ Erreur statistiques:', err);
      return {
        totalPages: 0,
        publishedPages: 0,
        totalViews: 0,
        averageViews: 0
      };
    }
  }
}

export const repairerSeoService = new RepairerSeoService();
