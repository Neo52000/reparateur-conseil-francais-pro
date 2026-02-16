import { supabase } from '@/integrations/supabase/client';

/**
 * Interface pour une entrée de sitemap
 */
export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Générateur de sitemap XML dynamique
 */
class SitemapGenerator {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://topreparateurs.fr';
  }

  /**
   * Génère le sitemap principal (index)
   */
  async generateSitemapIndex(): Promise<string> {
    const sitemaps = [
      { name: 'pages', lastmod: new Date().toISOString() },
      { name: 'repairers', lastmod: new Date().toISOString() },
      { name: 'cities', lastmod: new Date().toISOString() },
      { name: 'models', lastmod: new Date().toISOString() },
      { name: 'symptoms', lastmod: new Date().toISOString() },
      { name: 'blog', lastmod: new Date().toISOString() }
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>
    <loc>${this.baseUrl}/sitemap-${s.name}.xml</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return xml;
  }

  /**
   * Génère le sitemap des pages statiques
   */
  async generatePagesSitemap(): Promise<string> {
    const staticPages: SitemapEntry[] = [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/recherche', changefreq: 'daily', priority: 0.9 },
      { loc: '/comment-ca-marche', changefreq: 'monthly', priority: 0.7 },
      { loc: '/a-propos', changefreq: 'monthly', priority: 0.6 },
      { loc: '/garantie', changefreq: 'monthly', priority: 0.6 },
      { loc: '/guide-choix-reparateur', changefreq: 'monthly', priority: 0.7 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.5 },
      { loc: '/cgv', changefreq: 'yearly', priority: 0.3 },
      { loc: '/politique-confidentialite', changefreq: 'yearly', priority: 0.3 },
      { loc: '/mentions-legales', changefreq: 'yearly', priority: 0.3 }
    ];

    return this.generateSitemapXml(staticPages);
  }

  /**
   * Génère le sitemap des réparateurs
   */
  async generateRepairersSitemap(): Promise<string> {
    // Utiliser la table 'repairers' qui a is_verified
    const { data: repairers } = await supabase
      .from('repairers')
      .select('id, name, city, updated_at')
      .eq('is_verified', true)
      .order('updated_at', { ascending: false });

    if (!repairers) return this.generateSitemapXml([]);

    // Générer un slug à partir du nom et de la ville
    const entries: SitemapEntry[] = repairers.map(r => {
      const slug = this.slugify(`${r.name}-${r.city}`);
      return {
        loc: `/reparateur/${r.id}`,
        lastmod: r.updated_at,
        changefreq: 'weekly' as const,
        priority: 0.8
      };
    });

    return this.generateSitemapXml(entries);
  }

  /**
   * Génère un slug à partir d'une chaîne
   */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Génère le sitemap des pages villes (hub)
   */
  async generateCitiesSitemap(): Promise<string> {
    const { data: pages } = await supabase
      .from('seo_programmatic_pages')
      .select('slug, updated_at, repairers_count')
      .eq('page_type', 'hub_city')
      .eq('is_published', true)
      .order('repairers_count', { ascending: false });

    if (!pages) return this.generateSitemapXml([]);

    const entries: SitemapEntry[] = pages.map(p => ({
      loc: `/${p.slug}`,
      lastmod: p.updated_at,
      changefreq: 'weekly' as const,
      priority: Math.min(0.9, 0.5 + (p.repairers_count || 0) * 0.01)
    }));

    return this.generateSitemapXml(entries);
  }

  /**
   * Génère le sitemap des pages modèles+villes et marques+villes
   */
  async generateModelsSitemap(): Promise<string> {
    const { data: pages } = await supabase
      .from('seo_programmatic_pages')
      .select('slug, updated_at, repairers_count')
      .in('page_type', ['model_city', 'brand_city'])
      .eq('is_published', true)
      .order('repairers_count', { ascending: false });

    if (!pages) return this.generateSitemapXml([]);

    const entries: SitemapEntry[] = pages.map(p => ({
      loc: `/${p.slug}`,
      lastmod: p.updated_at,
      changefreq: 'weekly' as const,
      priority: Math.min(0.8, 0.4 + (p.repairers_count || 0) * 0.01)
    }));

    return this.generateSitemapXml(entries);
  }

  /**
   * Génère le sitemap des pages symptômes
   */
  async generateSymptomsSitemap(): Promise<string> {
    const { data: pages } = await supabase
      .from('seo_programmatic_pages')
      .select('slug, updated_at')
      .eq('page_type', 'symptom')
      .eq('is_published', true);

    if (!pages) return this.generateSitemapXml([]);

    const entries: SitemapEntry[] = pages.map(p => ({
      loc: `/${p.slug}`,
      lastmod: p.updated_at,
      changefreq: 'monthly' as const,
      priority: 0.6
    }));

    return this.generateSitemapXml(entries);
  }

  /**
   * Génère le sitemap du blog
   */
  async generateBlogSitemap(): Promise<string> {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (!posts) return this.generateSitemapXml([]);

    const entries: SitemapEntry[] = [
      { loc: '/blog', changefreq: 'daily', priority: 0.8 },
      ...posts.map(p => ({
        loc: `/blog/${p.slug}`,
        lastmod: p.updated_at,
        changefreq: 'monthly' as const,
        priority: 0.7
      }))
    ];

    return this.generateSitemapXml(entries);
  }

  /**
   * Génère le XML du sitemap à partir des entrées
   */
  private generateSitemapXml(entries: SitemapEntry[]): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${this.baseUrl}${e.loc}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}
    ${e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ''}
    ${e.priority ? `<priority>${e.priority.toFixed(1)}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  /**
   * Génère tous les sitemaps et retourne un objet avec les contenus
   */
  async generateAllSitemaps(): Promise<Record<string, string>> {
    const [index, pages, repairers, cities, models, symptoms, blog] = await Promise.all([
      this.generateSitemapIndex(),
      this.generatePagesSitemap(),
      this.generateRepairersSitemap(),
      this.generateCitiesSitemap(),
      this.generateModelsSitemap(),
      this.generateSymptomsSitemap(),
      this.generateBlogSitemap()
    ]);

    return {
      'sitemap.xml': index,
      'sitemap-pages.xml': pages,
      'sitemap-repairers.xml': repairers,
      'sitemap-cities.xml': cities,
      'sitemap-models.xml': models,
      'sitemap-symptoms.xml': symptoms,
      'sitemap-blog.xml': blog
    };
  }

  /**
   * Compte le nombre total d'URLs dans tous les sitemaps
   */
  async countTotalUrls(): Promise<number> {
    // Compter les réparateurs depuis la table 'repairers'
    const repairersResult = await supabase
      .from('repairers')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', true);
    
    const seoPagesResult = await supabase
      .from('seo_programmatic_pages')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true);
    
    const blogPostsResult = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    const staticPages = 8; // Pages statiques
    
    return (
      staticPages +
      (repairersResult.count || 0) +
      (seoPagesResult.count || 0) +
      (blogPostsResult.count || 0) +
      1 // Page blog index
    );
  }
}

export const sitemapGenerator = new SitemapGenerator();
export default sitemapGenerator;
