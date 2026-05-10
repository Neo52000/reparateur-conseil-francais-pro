import { describe, it, expect, vi, afterEach } from 'vitest';
import { slugify, entriesToXml, indexXml } from './generate-sitemap';

afterEach(() => {
  vi.useRealTimers();
});

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Paris 1er')).toBe('paris-1er');
  });

  it('strips French diacritics', () => {
    expect(slugify('Saint-Étienne')).toBe('saint-etienne');
    expect(slugify('Évry-Courcouronnes')).toBe('evry-courcouronnes');
  });

  it('drops non-alphanumeric characters', () => {
    expect(slugify("L'Île-d'Olonne")).toBe('lile-dolonne');
  });

  it('collapses repeated whitespace and trims', () => {
    expect(slugify('  Aix   en   Provence  ')).toBe('aix-en-provence');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('Foo--Bar')).toBe('foo-bar');
  });

  it('returns an empty string for input made of only stripped chars', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('entriesToXml', () => {
  it('produces a valid urlset wrapper', () => {
    const xml = entriesToXml([{ loc: '/' }]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('</urlset>');
  });

  it('prepends the configured base URL to relative paths', () => {
    const xml = entriesToXml([{ loc: '/search' }]);
    // BASE_URL defaults to https://topreparateurs.fr in this env.
    expect(xml).toContain('<loc>https://topreparateurs.fr/search</loc>');
  });

  it('keeps absolute URLs as-is', () => {
    const xml = entriesToXml([{ loc: 'https://example.com/page' }]);
    expect(xml).toContain('<loc>https://example.com/page</loc>');
  });

  it('emits optional metadata only when provided', () => {
    const xml = entriesToXml([
      { loc: '/a', changefreq: 'weekly', priority: 0.7 },
      { loc: '/b' },
    ]);
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml).toContain('<priority>0.7</priority>');
    // The bare entry must not pollute its own block with empty tags
    const bBlock = xml.split('<loc>https://topreparateurs.fr/b</loc>')[1].split('</url>')[0];
    expect(bBlock).not.toContain('<changefreq>');
    expect(bBlock).not.toContain('<priority>');
  });

  it('truncates lastmod to YYYY-MM-DD', () => {
    const xml = entriesToXml([{ loc: '/x', lastmod: '2026-05-07T12:34:56.789Z' }]);
    expect(xml).toContain('<lastmod>2026-05-07</lastmod>');
    expect(xml).not.toContain('12:34:56');
  });
});

describe('indexXml', () => {
  it('produces a valid sitemapindex wrapper', () => {
    const xml = indexXml(['static']);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('</sitemapindex>');
  });

  it('emits one <sitemap> entry per name', () => {
    const xml = indexXml(['static', 'repairers', 'cities', 'blog']);
    expect((xml.match(/<sitemap>/g) || []).length).toBe(4);
    expect(xml).toContain('<loc>https://topreparateurs.fr/sitemap-static.xml</loc>');
    expect(xml).toContain('<loc>https://topreparateurs.fr/sitemap-blog.xml</loc>');
  });

  it('stamps the entries with today’s date', () => {
    // Mock the system clock so the assertion is deterministic — without
    // this the test could flake if midnight UTC ticks between indexXml()
    // and the local `new Date()` below.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-07T12:00:00Z'));

    const xml = indexXml(['static']);
    expect(xml).toContain('<lastmod>2026-05-07</lastmod>');
  });
});
