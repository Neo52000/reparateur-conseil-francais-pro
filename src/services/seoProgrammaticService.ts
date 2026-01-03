import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SeoProgrammaticPage {
  id: string;
  page_type: 'model_city' | 'symptom' | 'hub_city' | 'brand_city';
  slug: string;
  title: string;
  h1_title: string | null;
  meta_description: string | null;
  content: Record<string, unknown>;
  schema_org: Record<string, unknown>;
  internal_links: string[];
  repairers_count: number;
  average_rating: number | null;
  is_indexed: boolean;
  is_published: boolean;
  generated_at: string;
  updated_at: string;
}

export interface CreateSeoPageInput {
  page_type: SeoProgrammaticPage['page_type'];
  slug: string;
  title: string;
  h1_title?: string;
  meta_description?: string;
  content?: Json;
  schema_org?: Json;
  internal_links?: string[];
  repairers_count?: number;
  average_rating?: number;
  is_published?: boolean;
}

class SeoProgrammaticService {
  /**
   * Récupère une page SEO par son slug
   */
  async getPageBySlug(slug: string): Promise<SeoProgrammaticPage | null> {
    const { data, error } = await supabase
      .from('seo_programmatic_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Erreur récupération page SEO:', error);
      return null;
    }

    return data as SeoProgrammaticPage;
  }

  /**
   * Récupère toutes les pages SEO d'un type donné
   */
  async getPagesByType(pageType: SeoProgrammaticPage['page_type'], limit = 50): Promise<SeoProgrammaticPage[]> {
    const { data, error } = await supabase
      .from('seo_programmatic_pages')
      .select('*')
      .eq('page_type', pageType)
      .eq('is_published', true)
      .order('repairers_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur récupération pages SEO:', error);
      return [];
    }

    return (data || []) as SeoProgrammaticPage[];
  }

  /**
   * Crée une nouvelle page SEO
   */
  async createPage(input: CreateSeoPageInput): Promise<SeoProgrammaticPage | null> {
    const insertData = {
      page_type: input.page_type,
      slug: input.slug,
      title: input.title,
      h1_title: input.h1_title,
      meta_description: input.meta_description,
      content: input.content || {},
      schema_org: input.schema_org || {},
      internal_links: input.internal_links || [],
      repairers_count: input.repairers_count || 0,
      average_rating: input.average_rating,
      is_published: input.is_published || false,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('seo_programmatic_pages')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Erreur création page SEO:', error);
      return null;
    }

    return data as SeoProgrammaticPage;
  }

  /**
   * Met à jour une page SEO existante
   */
  async updatePage(id: string, updates: Partial<CreateSeoPageInput>): Promise<boolean> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (updates.page_type) updateData.page_type = updates.page_type;
    if (updates.slug) updateData.slug = updates.slug;
    if (updates.title) updateData.title = updates.title;
    if (updates.h1_title !== undefined) updateData.h1_title = updates.h1_title;
    if (updates.meta_description !== undefined) updateData.meta_description = updates.meta_description;
    if (updates.content) updateData.content = updates.content;
    if (updates.schema_org) updateData.schema_org = updates.schema_org;
    if (updates.internal_links) updateData.internal_links = updates.internal_links;
    if (updates.repairers_count !== undefined) updateData.repairers_count = updates.repairers_count;
    if (updates.average_rating !== undefined) updateData.average_rating = updates.average_rating;
    if (updates.is_published !== undefined) updateData.is_published = updates.is_published;

    const { error } = await supabase
      .from('seo_programmatic_pages')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erreur mise à jour page SEO:', error);
      return false;
    }

    return true;
  }

  /**
   * Supprime une page SEO
   */
  async deletePage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('seo_programmatic_pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression page SEO:', error);
      return false;
    }

    return true;
  }

  /**
   * Génère le slug pour une page modèle+ville
   */
  generateModelCitySlug(model: string, city: string): string {
    const normalize = (str: string) => 
      str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return `reparation-${normalize(model)}-${normalize(city)}`;
  }

  /**
   * Génère le slug pour une page symptôme
   */
  generateSymptomSlug(symptom: string, city?: string): string {
    const normalize = (str: string) => 
      str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const base = normalize(symptom);
    return city ? `${base}-${normalize(city)}` : base;
  }

  /**
   * Génère le Schema.org pour une page
   */
  generateSchemaOrg(page: SeoProgrammaticPage, baseUrl: string): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.meta_description,
      url: `${baseUrl}/${page.slug}`
    };

    if (page.page_type === 'hub_city') {
      schema['@type'] = 'CollectionPage';
      schema.numberOfItems = page.repairers_count;
    }

    if (page.average_rating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: page.average_rating,
        bestRating: 5,
        worstRating: 1
      };
    }

    return schema;
  }

  /**
   * Récupère les statistiques des pages SEO
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    byType: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('seo_programmatic_pages')
      .select('page_type, is_published');

    if (error) {
      console.error('Erreur stats pages SEO:', error);
      return { total: 0, published: 0, byType: {} };
    }

    const pages = data || [];
    const byType: Record<string, number> = {};

    pages.forEach(p => {
      byType[p.page_type] = (byType[p.page_type] || 0) + 1;
    });

    return {
      total: pages.length,
      published: pages.filter(p => p.is_published).length,
      byType
    };
  }
}

export const seoProgrammaticService = new SeoProgrammaticService();
export default seoProgrammaticService;
