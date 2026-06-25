import { supabase } from '@/integrations/supabase/client';

export interface LocalSeoPage {
  id: string;
  slug: string;
  city: string;
  city_slug: string;
  service_type: string;
  title: string;
  meta_description: string;
  h1_title: string;
  content_paragraph_1: string;
  content_paragraph_2: string;
  cta_text: string;
  map_embed_url?: string;
  repairer_count: number;
  average_rating: number;
  sample_testimonials: any;
  is_published: boolean;
  seo_score: number;
  page_views: number;
  click_through_rate: number;
  generated_by_ai: boolean;
  ai_model?: string;
  generation_prompt?: string;
  last_updated_content: string;
  created_at: string;
  updated_at: string;
}

export interface LocalSeoTemplate {
  id: string;
  name: string;
  service_type: string;
  content_template: string;
  title_template: string;
  meta_description_template: string;
  h1_template: string;
  cta_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocalSeoPageInsert {
  slug: string;
  city: string;
  city_slug: string;
  service_type: string;
  title: string;
  meta_description: string;
  h1_title: string;
  content_paragraph_1: string;
  content_paragraph_2: string;
  cta_text: string;
  map_embed_url?: string;
  repairer_count?: number;
  average_rating?: number;
  sample_testimonials?: any;
  is_published?: boolean;
  generated_by_ai?: boolean;
  ai_model?: string;
  generation_prompt?: string;
}

export interface LocalSeoPageUpdate {
  slug?: string;
  city?: string;
  city_slug?: string;
  service_type?: string;
  title?: string;
  meta_description?: string;
  h1_title?: string;
  content_paragraph_1?: string;
  content_paragraph_2?: string;
  cta_text?: string;
  map_embed_url?: string;
  repairer_count?: number;
  average_rating?: number;
  sample_testimonials?: any;
  is_published?: boolean;
  seo_score?: number;
  page_views?: number;
  click_through_rate?: number;
  generated_by_ai?: boolean;
  ai_model?: string;
  generation_prompt?: string;
  last_updated_content?: string;
}

export interface SeoMetrics {
  id: string;
  page_id: string;
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  average_position: number;
  bounce_rate: number;
  time_on_page: number;
  conversions: number;
  created_at: string;
}

class LocalSeoService {
  // Vérifier l'accès aux fonctionnalités SEO Local
  async hasAccess(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Check admin role from user metadata instead of profiles.role
      const role = user.user.user_metadata?.role;
      if (role === 'admin') return true;

      // Check if user has a repairer subscription
      const { data: subscription } = await supabase
        .from('repairer_subscriptions')
        .select('subscription_tier')
        .eq('repairer_id', user.user.id)
        .eq('subscribed', true)
        .maybeSingle();

      if (subscription && ['visibility', 'pro', 'premium'].includes(subscription.subscription_tier || '')) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur vérification accès SEO:', error);
      return false;
    }
  }

  // Récupérer toutes les pages SEO
  async getPages(): Promise<LocalSeoPage[]> {
    try {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération pages SEO:', error);
      return [];
    }
  }

  // Récupérer une page par slug
  async getPageBySlug(slug: string): Promise<LocalSeoPage | null> {
    try {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération page par slug:', error);
      return null;
    }
  }

  // Créer une nouvelle page SEO
  async createPage(pageData: LocalSeoPageInsert): Promise<LocalSeoPage | null> {
    try {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .insert(pageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création page SEO:', error);
      return null;
    }
  }

  // Mettre à jour une page SEO
  async updatePage(id: string, updates: LocalSeoPageUpdate): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('local_seo_pages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur mise à jour page SEO:', error);
      return false;
    }
  }

  // Publier/dépublier une page
  async togglePublish(id: string, isPublished: boolean): Promise<boolean> {
    return this.updatePage(id, { is_published: isPublished });
  }

  // Supprimer une page SEO
  async deletePage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('local_seo_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression page SEO:', error);
      return false;
    }
  }

  // Générer le contenu avec IA
  async generateContent(params: {
    city: string;
    serviceType: string;
    repairerCount: number;
    averageRating: number;
    existingContent?: string;
    regenerate?: boolean;
  }): Promise<any> {
    try {
      console.log('🔄 Appel à la fonction edge generate-local-seo-content avec params:', params);
      
      const { data, error } = await supabase.functions.invoke('generate-local-seo-content-v2', {
        body: params
      });

      console.log('📤 Réponse de la fonction edge:', { data, error });

      if (error) {
        console.error('❌ Erreur de la fonction edge:', error);
        throw new Error(`Erreur fonction edge: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée par la fonction edge');
      }

      if (!data.success) {
        const errorMsg = data.error || 'Échec de la génération IA';
        const errorDetails = data.details ? ` - ${data.details}` : '';
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur génération contenu IA:', error);
      
      // Améliorer les messages d'erreur
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Erreur de connexion à l\'API IA - Vérifiez votre connexion internet', { cause: error });
        }
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new Error('Aucune clé API IA configurée (MISTRAL_API_KEY ou OPENAI_API_KEY)', { cause: error });
        }
        if (error.message.includes('429')) {
          throw new Error('Limite de requêtes dépassée - Veuillez réessayer dans quelques minutes', { cause: error });
        }
      }
      
      throw error;
    }
  }

  // Générer et créer une page SEO complète
  async generateAndCreatePage(params: {
    city: string;
    serviceType: string;
    repairerCount: number;
    averageRating: number;
  }): Promise<LocalSeoPage | null> {
    try {
      console.log('🔄 Génération contenu SEO pour:', params.city);
      
      // Générer le contenu avec l'IA
      const aiResult = await this.generateContent(params);
      
      if (!aiResult || !aiResult.success) {
        throw new Error(aiResult?.error || 'Échec de la génération IA');
      }

      const content = aiResult.content;
      console.log('✅ Contenu généré pour:', params.city);

      // Créer le slug de la ville
      const citySlug = params.city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Préparer les données de la page
      const pageData: LocalSeoPageInsert = {
        slug: `reparateur-${params.serviceType}-${citySlug}`,
        city: params.city,
        city_slug: citySlug,
        service_type: params.serviceType,
        title: content.title,
        meta_description: content.metaDescription,
        h1_title: content.h1,
        content_paragraph_1: content.paragraph1,
        content_paragraph_2: content.paragraph2,
        cta_text: 'Obtenez votre devis gratuitement',
        repairer_count: params.repairerCount,
        average_rating: params.averageRating,
        generated_by_ai: true,
        ai_model: aiResult.model,
        generation_prompt: `Génération automatique pour ${params.city}`,
        is_published: false
      };

      // Créer la page dans la base de données
      const createdPage = await this.createPage(pageData);
      
      if (createdPage) {
        console.log('✅ Page SEO créée avec succès:', createdPage.id);
      }
      
      return createdPage;
    } catch (error) {
      console.error('❌ Erreur génération page complète:', error);
      throw error;
    }
  }

  // Actualiser le contenu d'une page avec l'IA
  async refreshPageContent(pageId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('refresh_seo_page_content', {
        page_id: pageId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur actualisation contenu:', error);
      return false;
    }
  }

  // Récupérer les templates
  async getTemplates(): Promise<LocalSeoTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('local_seo_templates')
        .select('*')
        .eq('is_active', true)
        .order('service_type');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération templates:', error);
      return [];
    }
  }

  // Obtenir les métriques d'une page
  async getPageMetrics(pageId: string, days: number = 30): Promise<SeoMetrics[]> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('local_seo_metrics')
        .select('*')
        .eq('page_id', pageId)
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération métriques:', error);
      return [];
    }
  }

  // Enregistrer une vue de page
  async trackPageView(pageId: string): Promise<void> {
    try {
      // Récupérer d'abord la valeur actuelle
      const { data: currentPage } = await supabase
        .from('local_seo_pages')
        .select('page_views')
        .eq('id', pageId)
        .single();

      // Incrémenter le compteur de vues
      const newViewCount = (currentPage?.page_views || 0) + 1;
      const { error } = await supabase
        .from('local_seo_pages')
        .update({ page_views: newViewCount })
        .eq('id', pageId);

      if (error) throw error;

      // Enregistrer la métrique du jour
      const today = new Date().toISOString().split('T')[0];
      const { error: metricsError } = await supabase
        .from('local_seo_metrics')
        .upsert({
          page_id: pageId,
          date: today,
          impressions: 1
        }, {
          onConflict: 'page_id,date'
        });

      if (metricsError) console.error('Erreur enregistrement métrique:', metricsError);
    } catch (error) {
      console.error('Erreur tracking vue:', error);
    }
  }

  // Générer le sitemap XML
  async generateSitemap(): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo-sitemap');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur génération sitemap:', error);
      throw error;
    }
  }

  // Obtenir les statistiques globales
  async getGlobalStats(): Promise<{
    totalPages: number;
    publishedPages: number;
    totalViews: number;
    averageCTR: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('page_views, click_through_rate, is_published');

      if (error) throw error;

      const totalPages = data?.length || 0;
      const publishedPages = data?.filter(p => p.is_published).length || 0;
      const totalViews = data?.reduce((sum, p) => sum + (p.page_views || 0), 0) || 0;
      const averageCTR = data?.length > 0 
        ? data.reduce((sum, p) => sum + (p.click_through_rate || 0), 0) / data.length 
        : 0;

      return {
        totalPages,
        publishedPages,
        totalViews,
        averageCTR: Math.round(averageCTR * 100) / 100
      };
    } catch (error) {
      console.error('Erreur statistiques globales:', error);
      return {
        totalPages: 0,
        publishedPages: 0,
        totalViews: 0,
        averageCTR: 0
      };
    }
  }

  // Générer des suggestions de villes basées sur les réparateurs existants
  async getSuggestedCities(): Promise<Array<{city: string, repairerCount: number}>> {
    try {
      const { data, error } = await supabase
        .from('repairers')
        .select('city')
        .not('city', 'is', null);

      if (error) throw error;

      // Compter les réparateurs par ville
      const cityCount = (data || []).reduce((acc: Record<string, number>, repairer) => {
        const city = repairer.city?.trim();
        if (city) {
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      }, {});

      // Vérifier quelles villes n'ont pas encore de page SEO
      const { data: existingPages } = await supabase
        .from('local_seo_pages')
        .select('city');

      const existingCities = new Set((existingPages || []).map(p => p.city));

      return Object.entries(cityCount)
        .filter(([city]) => !existingCities.has(city))
        .map(([city, count]) => ({ city, repairerCount: count }))
        .sort((a, b) => b.repairerCount - a.repairerCount)
        .slice(0, 20);
    } catch (error) {
      console.error('Erreur suggestions villes:', error);
      return [];
    }
  }
}

export const localSeoService = new LocalSeoService();