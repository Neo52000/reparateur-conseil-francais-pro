import { LocalSeoPage } from '@/services/localSeoService';

export interface StructuredDataProps {
  page: LocalSeoPage;
  url: string;
}

export const generateStructuredData = ({ page, url }: StructuredDataProps) => {
  const serviceTypeLabels = {
    smartphone: 'Smartphone',
    tablette: 'Tablette', 
    ordinateur: 'Ordinateur'
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${url}#business`,
        "name": `Réparation ${serviceTypeLabels[page.service_type as keyof typeof serviceTypeLabels]} ${page.city}`,
        "description": page.meta_description,
        "url": url,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": page.city,
          "addressCountry": "FR"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": page.average_rating,
          "reviewCount": page.repairer_count * 5,
          "bestRating": 5,
          "worstRating": 1
        },
        "priceRange": "€€",
        "telephone": "+33-1-XX-XX-XX-XX",
        "openingHours": "Mo-Sa 09:00-19:00",
        "serviceArea": {
          "@type": "City",
          "name": page.city
        }
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": page.title,
        "description": page.meta_description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "/#website"
        },
        "about": {
          "@id": `${url}#business`
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/repair-${page.service_type}-${page.city_slug}.jpg`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": window.location.origin
          },
          {
            "@type": "ListItem", 
            "position": 2,
            "name": `Réparation ${serviceTypeLabels[page.service_type as keyof typeof serviceTypeLabels]}`,
            "item": `${window.location.origin}/reparation-${page.service_type}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": page.city,
            "item": url
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        "name": `Réparation ${serviceTypeLabels[page.service_type as keyof typeof serviceTypeLabels]}`,
        "description": `Service de réparation professionnel pour ${serviceTypeLabels[page.service_type as keyof typeof serviceTypeLabels]} à ${page.city}`,
        "provider": {
          "@id": `${url}#business`
        },
        "areaServed": {
          "@type": "City",
          "name": page.city
        },
        "serviceType": `Réparation ${serviceTypeLabels[page.service_type as keyof typeof serviceTypeLabels]}`,
        "offers": {
          "@type": "Offer",
          "availability": "InStock",
          "priceRange": "€€",
          "description": "Devis gratuit et intervention rapide"
        }
      }
    ]
  };
};

export const generateMetaTags = (page: LocalSeoPage, url: string) => {
  return {
    title: page.title,
    description: page.meta_description,
    keywords: [
      `réparation ${page.service_type}`,
      `${page.service_type} ${page.city}`,
      `réparateur ${page.city}`,
      'réparation rapide',
      'devis gratuit',
      'garantie'
    ].join(', '),
    author: 'RepairHub',
    robots: 'index, follow',
    canonical: url,
    og: {
      type: 'website',
      title: page.title,
      description: page.meta_description,
      url: url,
      siteName: 'RepairHub',
      locale: 'fr_FR',
      image: `${window.location.origin}/og-repair-${page.service_type}.jpg`
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.meta_description,
      image: `${window.location.origin}/twitter-repair-${page.service_type}.jpg`
    }
  };
};

export const generateCitySlug = (city: string): string => {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
};

export const formatServiceType = (serviceType: string): string => {
  const labels = {
    smartphone: 'Smartphone',
    tablette: 'Tablette',
    ordinateur: 'Ordinateur'
  };
  return labels[serviceType as keyof typeof labels] || serviceType;
};

export const generateSeoUrl = (serviceType: string, city: string): string => {
  return `/reparateur-${serviceType}-${generateCitySlug(city)}`;
};

export const generateSitemapEntry = (page: LocalSeoPage, baseUrl: string) => {
  return {
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updated_at).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  };
};