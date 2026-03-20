/**
 * SEO Internal Linking Mesh Service
 * Implements SEO Machine's internal linking strategy for semantic authority
 */

import { supabase } from '@/integrations/supabase/client';

export interface InternalLink {
  from: string;
  to: string;
  anchor: string;
  type: 'contextual' | 'navigational' | 'footer' | 'sidebar';
  relevanceScore: number;
}

export interface LinkingMeshEntry {
  slug: string;
  title: string;
  city?: string;
  serviceType?: string;
  pageType: 'local_seo' | 'programmatic' | 'blog' | 'service' | 'static';
  relatedLinks: InternalLink[];
}

/**
 * Service de maillage interne SEO Machine
 */
class SeoInternalLinkingService {
  /**
   * Génère le maillage interne pour une page donnée
   */
  async generateLinksForPage(params: {
    slug: string;
    city?: string;
    serviceType?: string;
    pageType: string;
  }): Promise<InternalLink[]> {
    const links: InternalLink[] = [];

    // Fetch related pages in parallel
    const [localSeoPages, programmaticPages, blogPosts] = await Promise.all([
      this.fetchLocalSeoPages(),
      this.fetchProgrammaticPages(),
      this.fetchBlogPosts()
    ]);

    // Generate contextual links based on proximity
    const allPages = [
      ...localSeoPages.map(p => ({ ...p, pageType: 'local_seo' as const })),
      ...programmaticPages.map(p => ({ ...p, pageType: 'programmatic' as const })),
      ...blogPosts.map(p => ({ ...p, pageType: 'blog' as const }))
    ];

    allPages.forEach(page => {
      if (page.slug === params.slug) return;

      let relevance = 0;
      let linkType: InternalLink['type'] = 'contextual';

      // Same city
      if (params.city && page.city?.toLowerCase() === params.city.toLowerCase()) {
        relevance += 40;
      }
      
      // Same service type
      if (params.serviceType && page.serviceType === params.serviceType) {
        relevance += 30;
      }

      // Hub pages (high authority)
      if (page.pageType === 'programmatic' && page.slug.includes('reparateurs-')) {
        relevance += 20;
        linkType = 'navigational';
      }

      // Blog supporting content
      if (page.pageType === 'blog' && params.serviceType && 
          page.title.toLowerCase().includes(params.serviceType)) {
        relevance += 25;
      }

      // Local SEO sibling pages
      if (page.pageType === 'local_seo' && params.pageType === 'local_seo') {
        relevance += 15;
      }

      if (relevance >= 15) {
        links.push({
          from: `/${params.slug}`,
          to: page.pageType === 'blog' ? `/blog/${page.slug}` : `/${page.slug}`,
          anchor: page.title,
          type: linkType,
          relevanceScore: relevance
        });
      }
    });

    // Sort by relevance and limit
    return links
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  /**
   * Génère le réseau complet de maillage interne pour le site
   */
  async generateFullMesh(): Promise<LinkingMeshEntry[]> {
    const [localSeoPages, programmaticPages, blogPosts] = await Promise.all([
      this.fetchLocalSeoPages(),
      this.fetchProgrammaticPages(),
      this.fetchBlogPosts()
    ]);

    const mesh: LinkingMeshEntry[] = [];

    // Process local SEO pages
    for (const page of localSeoPages.slice(0, 50)) {
      const links = await this.generateLinksForPage({
        slug: page.slug,
        city: page.city,
        serviceType: page.serviceType,
        pageType: 'local_seo'
      });

      mesh.push({
        slug: page.slug,
        title: page.title,
        city: page.city,
        serviceType: page.serviceType,
        pageType: 'local_seo',
        relatedLinks: links
      });
    }

    return mesh;
  }

  /**
   * Calcule les statistiques du maillage interne
   */
  async getMeshStats(): Promise<{
    totalPages: number;
    totalLinks: number;
    avgLinksPerPage: number;
    orphanPages: number;
    topLinkedPages: { slug: string; title: string; incomingLinks: number }[];
  }> {
    const [localSeo, programmatic, blog] = await Promise.all([
      this.fetchLocalSeoPages(),
      this.fetchProgrammaticPages(),
      this.fetchBlogPosts()
    ]);

    const totalPages = localSeo.length + programmatic.length + blog.length;
    
    // Estimate links based on internal_links arrays
    let totalLinks = 0;
    const incomingLinkCount = new Map<string, { title: string; count: number }>();

    programmatic.forEach(p => {
      const linkCount = p.internalLinks?.length || 0;
      totalLinks += linkCount;
      (p.internalLinks || []).forEach((link: string) => {
        const existing = incomingLinkCount.get(link) || { title: link, count: 0 };
        existing.count++;
        incomingLinkCount.set(link, existing);
      });
    });

    const topLinked = Array.from(incomingLinkCount.entries())
      .map(([slug, data]) => ({ slug, title: data.title, incomingLinks: data.count }))
      .sort((a, b) => b.incomingLinks - a.incomingLinks)
      .slice(0, 10);

    return {
      totalPages,
      totalLinks,
      avgLinksPerPage: totalPages > 0 ? Math.round(totalLinks / totalPages * 10) / 10 : 0,
      orphanPages: totalPages - incomingLinkCount.size,
      topLinkedPages: topLinked
    };
  }

  private async fetchLocalSeoPages() {
    const { data } = await supabase
      .from('local_seo_pages')
      .select('slug, city, service_type, title, h1_title')
      .eq('is_published', true)
      .limit(200);

    return (data || []).map(p => ({
      slug: p.slug,
      city: p.city,
      serviceType: p.service_type,
      title: p.title
    }));
  }

  private async fetchProgrammaticPages() {
    const { data } = await supabase
      .from('seo_programmatic_pages')
      .select('slug, title, content, internal_links')
      .eq('is_published', true)
      .limit(200);

    return (data || []).map(p => {
      const content = p.content as Record<string, unknown> | null;
      return {
        slug: p.slug,
        title: p.title,
        city: content?.city as string | undefined,
        serviceType: content?.model as string | undefined,
        internalLinks: p.internal_links as string[] | undefined
      };
    });
  }

  private async fetchBlogPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, keywords')
      .eq('status', 'published')
      .limit(100);

    return (data || []).map(p => ({
      slug: p.slug,
      city: undefined as string | undefined,
      serviceType: undefined as string | undefined,
      title: p.title
    }));
  }
}

export const seoInternalLinking = new SeoInternalLinkingService();
export default seoInternalLinking;
