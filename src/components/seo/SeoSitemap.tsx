import React, { useEffect, useState } from 'react';
import { localSeoService } from '@/services/localSeoService';

const SeoSitemap = () => {
  const [sitemap, setSitemap] = useState<string>('');

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      const sitemapContent = await localSeoService.generateSitemap();
      setSitemap(sitemapContent);
    } catch (error) {
      console.error('Erreur génération sitemap:', error);
      setSitemap(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${window.location.origin}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
    }
  };

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {sitemap}
    </div>
  );
};

export default SeoSitemap;