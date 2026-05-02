/**
 * Génère sitemap-index.xml + sitemap-{static,repairers,cities,blog}.xml
 * dans public/ avant le build Vite (prebuild npm hook).
 *
 * Variables d'env requises :
 *   SUPABASE_URL ou VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Si l'une manque, le script génère uniquement le sitemap statique
 * (graceful degradation pour CI sans secrets DB).
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const BASE_URL = process.env.PUBLIC_SITE_URL || 'https://topreparateurs.fr';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function entriesToXml(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const lastmod = e.lastmod
        ? `\n    <lastmod>${e.lastmod.split('T')[0]}</lastmod>`
        : '';
      const cf = e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : '';
      const p = e.priority !== undefined ? `\n    <priority>${e.priority}</priority>` : '';
      return `  <url>\n    <loc>${e.loc.startsWith('http') ? e.loc : BASE_URL + e.loc}</loc>${lastmod}${cf}${p}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

function indexXml(names: string[]): string {
  const today = new Date().toISOString().split('T')[0];
  const items = names
    .map(
      (n) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemap-${n}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

function writeXml(filename: string, content: string): void {
  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(join(PUBLIC_DIR, filename), content, 'utf8');
  console.log(`✓ ${filename}`);
}

const STATIC_PAGES: SitemapEntry[] = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/search', changefreq: 'daily', priority: 0.9 },
  { loc: '/blog', changefreq: 'daily', priority: 0.8 },
  { loc: '/reparation-smartphone', changefreq: 'weekly', priority: 0.7 },
  { loc: '/reparation-tablette', changefreq: 'weekly', priority: 0.7 },
  { loc: '/reparation-ordinateur', changefreq: 'weekly', priority: 0.7 },
  { loc: '/reparation-console', changefreq: 'weekly', priority: 0.7 },
  { loc: '/repairer-plans', changefreq: 'monthly', priority: 0.6 },
  { loc: '/repairer-faq', changefreq: 'monthly', priority: 0.5 },
  { loc: '/legal-notice', changefreq: 'yearly', priority: 0.3 },
  { loc: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
];

async function main() {
  console.log(`Generating sitemaps to ${PUBLIC_DIR}`);

  writeXml('sitemap-static.xml', entriesToXml(STATIC_PAGES));

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠ SUPABASE_URL/KEY missing — only static sitemap generated.');
    writeXml('sitemap.xml', entriesToXml(STATIC_PAGES));
    writeXml('sitemap-index.xml', indexXml(['static']));
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: repairers } = await supabase
    .from('repairers')
    .select('name, city, updated_at')
    .eq('is_verified', true)
    .order('updated_at', { ascending: false })
    .limit(5000);

  const repairerEntries: SitemapEntry[] = (repairers || [])
    .filter((r) => r.city && r.name)
    .map((r) => ({
      loc: `/reparateur/${slugify(r.city!)}/${slugify(r.name!)}`,
      lastmod: r.updated_at ?? undefined,
      changefreq: 'weekly',
      priority: 0.8,
    }));
  writeXml('sitemap-repairers.xml', entriesToXml(repairerEntries));
  console.log(`  ${repairerEntries.length} repairers`);

  const { data: cities } = await supabase
    .from('seo_programmatic_pages')
    .select('slug, page_type, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(5000);

  const cityEntries: SitemapEntry[] = (cities || []).map((p) => ({
    loc:
      p.page_type === 'hub_city'
        ? `/reparateurs/${p.slug}`
        : p.page_type === 'symptom'
        ? `/probleme/${p.slug}`
        : `/reparation/${p.slug}`,
    lastmod: p.updated_at ?? undefined,
    changefreq: 'weekly',
    priority: 0.7,
  }));
  writeXml('sitemap-cities.xml', entriesToXml(cityEntries));
  console.log(`  ${cityEntries.length} programmatic pages`);

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5000);

  const blogEntries: SitemapEntry[] = (posts || []).map((p) => ({
    loc: `/blog/${p.slug}`,
    lastmod: p.updated_at ?? undefined,
    changefreq: 'monthly',
    priority: 0.6,
  }));
  writeXml('sitemap-blog.xml', entriesToXml(blogEntries));
  console.log(`  ${blogEntries.length} blog posts`);

  writeXml('sitemap-index.xml', indexXml(['static', 'repairers', 'cities', 'blog']));
  // Fallback : sitemap.xml = sitemap-index.xml pour rétrocompat
  writeXml('sitemap.xml', indexXml(['static', 'repairers', 'cities', 'blog']));
}

main().catch((err) => {
  console.error('Sitemap generation failed:', err);
  // Fallback statique pour ne pas casser le build
  writeXml('sitemap.xml', entriesToXml(STATIC_PAGES));
  process.exit(0);
});
