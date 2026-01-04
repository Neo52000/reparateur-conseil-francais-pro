import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

/**
 * Types de pages SEO programmatiques
 */
export type SeoPageType = 'model_city' | 'symptom' | 'hub_city' | 'brand_city';

/**
 * Données pour génération de page modèle + ville
 */
export interface ModelCityData {
  model: string;
  brand: string;
  city: string;
  postalCode?: string;
  repairersCount: number;
  averageRating?: number;
  repairerIds: string[];
}

/**
 * Données pour génération de page symptôme
 */
export interface SymptomData {
  symptom: string;
  category: string;
  city?: string;
  description: string;
  solutions: string[];
  relatedSymptoms: string[];
}

/**
 * Données pour génération de page hub ville
 */
export interface HubCityData {
  city: string;
  department: string;
  region: string;
  postalCodes: string[];
  repairersCount: number;
  topRepairers: string[];
  popularBrands: string[];
  popularModels: string[];
}

/**
 * Données pour génération de page marque + ville
 */
export interface BrandCityData {
  brand: string;
  city: string;
  repairersCount: number;
  models: string[];
  averageRating?: number;
}

/**
 * Résultat de génération
 */
export interface GenerationResult {
  success: boolean;
  pageId?: string;
  slug?: string;
  error?: string;
}

/**
 * Normalise une chaîne pour créer un slug SEO-friendly
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Capitalise la première lettre
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Générateur de pages SEO programmatiques
 */
class SeoProgrammaticGenerator {
  /**
   * Génère une page modèle + ville
   */
  async generateModelCityPage(data: ModelCityData): Promise<GenerationResult> {
    const slug = `reparation-${slugify(data.model)}-${slugify(data.city)}`;
    const title = `Réparation ${data.model} à ${capitalize(data.city)} - ${data.repairersCount} réparateurs`;
    const h1 = `Réparation ${data.model} à ${capitalize(data.city)}`;
    const metaDescription = `Trouvez les meilleurs réparateurs ${data.model} à ${capitalize(data.city)}. ${data.repairersCount} professionnels vérifiés${data.averageRating ? `, note moyenne ${data.averageRating.toFixed(1)}/5` : ''}. Devis gratuit.`;

    const content: Record<string, unknown> = {
      intro: `Votre ${data.model} ${data.brand} a besoin d'une réparation à ${capitalize(data.city)} ? Découvrez notre sélection de ${data.repairersCount} réparateurs qualifiés.`,
      model: data.model,
      brand: data.brand,
      city: data.city,
      postalCode: data.postalCode,
      repairersCount: data.repairersCount,
      repairerIds: data.repairerIds,
      commonRepairs: [
        `Écran cassé ${data.model}`,
        `Batterie ${data.model}`,
        `Bouton ${data.model}`,
        `Connecteur de charge ${data.model}`,
        `Caméra ${data.model}`
      ],
      benefits: [
        'Réparateurs vérifiés et certifiés',
        'Devis gratuit en ligne',
        'Garantie sur les réparations',
        'Pièces de qualité'
      ]
    };

    const schemaOrg = this.generateLocalBusinessSchema({
      name: `Réparation ${data.model} à ${capitalize(data.city)}`,
      description: metaDescription,
      city: data.city,
      aggregateRating: data.averageRating,
      reviewCount: data.repairersCount
    });

    const internalLinks = [
      `/reparateurs/${slugify(data.city)}`,
      `/reparation-${slugify(data.brand)}-${slugify(data.city)}`,
      `/reparation-smartphone-${slugify(data.city)}`
    ];

    return this.savePage({
      page_type: 'model_city',
      slug,
      title,
      h1_title: h1,
      meta_description: metaDescription,
      content: content as Json,
      schema_org: schemaOrg as Json,
      internal_links: internalLinks,
      repairers_count: data.repairersCount,
      average_rating: data.averageRating
    });
  }

  /**
   * Génère une page symptôme/problème
   */
  async generateSymptomPage(data: SymptomData): Promise<GenerationResult> {
    const baseSlug = slugify(data.symptom);
    const slug = data.city ? `${baseSlug}-${slugify(data.city)}` : baseSlug;
    const cityText = data.city ? ` à ${capitalize(data.city)}` : '';
    
    const title = `${capitalize(data.symptom)}${cityText} - Diagnostic et Solutions`;
    const h1 = `${capitalize(data.symptom)}${cityText}`;
    const metaDescription = `${data.description.slice(0, 120)}... Trouvez un réparateur qualifié${cityText}.`;

    const content: Record<string, unknown> = {
      symptom: data.symptom,
      category: data.category,
      city: data.city,
      description: data.description,
      solutions: data.solutions,
      relatedSymptoms: data.relatedSymptoms,
      diagnosticSteps: [
        'Identifier précisément le problème',
        'Vérifier si le téléphone est sous garantie',
        'Comparer les devis des réparateurs',
        'Choisir un réparateur certifié'
      ],
      faq: [
        {
          question: `Comment diagnostiquer un problème de ${data.symptom.toLowerCase()} ?`,
          answer: data.description
        },
        {
          question: `Combien coûte la réparation d'un ${data.symptom.toLowerCase()} ?`,
          answer: 'Le prix varie selon le modèle et la gravité du problème. Demandez un devis gratuit à nos réparateurs.'
        },
        {
          question: `Puis-je réparer moi-même un problème de ${data.symptom.toLowerCase()} ?`,
          answer: 'Nous recommandons de faire appel à un professionnel pour éviter d\'endommager davantage votre appareil.'
        }
      ]
    };

    const schemaOrg = this.generateFAQSchema(content.faq as Array<{question: string; answer: string}>);

    const internalLinks = data.relatedSymptoms.map(s => `/${slugify(s)}`);
    if (data.city) {
      internalLinks.push(`/reparateurs/${slugify(data.city)}`);
    }

    return this.savePage({
      page_type: 'symptom',
      slug,
      title,
      h1_title: h1,
      meta_description: metaDescription,
      content: content as Json,
      schema_org: schemaOrg as Json,
      internal_links: internalLinks,
      repairers_count: 0
    });
  }

  /**
   * Génère une page hub ville
   */
  async generateHubCityPage(data: HubCityData): Promise<GenerationResult> {
    const slug = `reparateurs-${slugify(data.city)}`;
    const title = `Réparateurs de Téléphone à ${capitalize(data.city)} (${data.department}) - ${data.repairersCount} Pros`;
    const h1 = `Réparateurs de Téléphone à ${capitalize(data.city)}`;
    const metaDescription = `Trouvez ${data.repairersCount} réparateurs de téléphone et smartphone à ${capitalize(data.city)} (${data.department}). Comparez les avis, demandez un devis gratuit. Réparation iPhone, Samsung, Huawei...`;

    const content: Record<string, unknown> = {
      city: data.city,
      department: data.department,
      region: data.region,
      postalCodes: data.postalCodes,
      repairersCount: data.repairersCount,
      topRepairerIds: data.topRepairers,
      popularBrands: data.popularBrands,
      popularModels: data.popularModels,
      services: [
        'Réparation écran',
        'Remplacement batterie',
        'Réparation connecteur de charge',
        'Déblocage téléphone',
        'Récupération de données'
      ],
      nearbyAreas: [] // À remplir avec les villes voisines
    };

    const schemaOrg = this.generateCollectionPageSchema({
      name: title,
      description: metaDescription,
      city: data.city,
      numberOfItems: data.repairersCount
    });

    const internalLinks = [
      ...data.popularBrands.slice(0, 5).map(b => `/reparation-${slugify(b)}-${slugify(data.city)}`),
      ...data.popularModels.slice(0, 5).map(m => `/reparation-${slugify(m)}-${slugify(data.city)}`)
    ];

    return this.savePage({
      page_type: 'hub_city',
      slug,
      title,
      h1_title: h1,
      meta_description: metaDescription,
      content: content as Json,
      schema_org: schemaOrg as Json,
      internal_links: internalLinks,
      repairers_count: data.repairersCount
    });
  }

  /**
   * Génère une page marque + ville
   */
  async generateBrandCityPage(data: BrandCityData): Promise<GenerationResult> {
    const slug = `reparation-${slugify(data.brand)}-${slugify(data.city)}`;
    const title = `Réparation ${capitalize(data.brand)} à ${capitalize(data.city)} - ${data.repairersCount} Experts`;
    const h1 = `Réparation ${capitalize(data.brand)} à ${capitalize(data.city)}`;
    const metaDescription = `${data.repairersCount} réparateurs ${capitalize(data.brand)} à ${capitalize(data.city)}${data.averageRating ? `, note ${data.averageRating.toFixed(1)}/5` : ''}. Réparation ${data.models.slice(0, 3).join(', ')}... Devis gratuit.`;

    const content: Record<string, unknown> = {
      brand: data.brand,
      city: data.city,
      repairersCount: data.repairersCount,
      models: data.models,
      services: [
        `Réparation écran ${data.brand}`,
        `Batterie ${data.brand}`,
        `Carte mère ${data.brand}`,
        `Face arrière ${data.brand}`,
        `Boutons ${data.brand}`
      ],
      whyChooseUs: [
        `Experts certifiés ${data.brand}`,
        'Pièces d\'origine ou compatibles haute qualité',
        'Garantie sur toutes les réparations',
        'Devis gratuit et transparent'
      ]
    };

    const schemaOrg = this.generateProductSchema({
      brand: data.brand,
      city: data.city,
      aggregateRating: data.averageRating,
      reviewCount: data.repairersCount
    });

    const internalLinks = [
      `/reparateurs-${slugify(data.city)}`,
      ...data.models.slice(0, 5).map(m => `/reparation-${slugify(m)}-${slugify(data.city)}`)
    ];

    return this.savePage({
      page_type: 'brand_city',
      slug,
      title,
      h1_title: h1,
      meta_description: metaDescription,
      content: content as Json,
      schema_org: schemaOrg as Json,
      internal_links: internalLinks,
      repairers_count: data.repairersCount,
      average_rating: data.averageRating
    });
  }

  /**
   * Génère le Schema.org LocalBusiness
   */
  private generateLocalBusinessSchema(data: {
    name: string;
    description: string;
    city: string;
    aggregateRating?: number;
    reviewCount?: number;
  }): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: data.name,
      description: data.description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: data.city,
        addressCountry: 'FR'
      },
      areaServed: {
        '@type': 'City',
        name: data.city
      }
    };

    if (data.aggregateRating && data.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating,
        bestRating: 5,
        worstRating: 1,
        reviewCount: data.reviewCount
      };
    }

    return schema;
  }

  /**
   * Génère le Schema.org FAQPage
   */
  private generateFAQSchema(faq: Array<{question: string; answer: string}>): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };
  }

  /**
   * Génère le Schema.org CollectionPage
   */
  private generateCollectionPageSchema(data: {
    name: string;
    description: string;
    city: string;
    numberOfItems: number;
  }): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: data.name,
      description: data.description,
      numberOfItems: data.numberOfItems,
      about: {
        '@type': 'Service',
        name: 'Réparation de téléphone',
        areaServed: {
          '@type': 'City',
          name: data.city
        }
      }
    };
  }

  /**
   * Génère le Schema.org Product
   */
  private generateProductSchema(data: {
    brand: string;
    city: string;
    aggregateRating?: number;
    reviewCount?: number;
  }): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `Réparation ${data.brand}`,
      brand: {
        '@type': 'Brand',
        name: data.brand
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        areaServed: {
          '@type': 'City',
          name: data.city
        }
      }
    };

    if (data.aggregateRating && data.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating,
        bestRating: 5,
        worstRating: 1,
        reviewCount: data.reviewCount
      };
    }

    return schema;
  }

  /**
   * Sauvegarde une page SEO en base
   */
  private async savePage(pageData: {
    page_type: SeoPageType;
    slug: string;
    title: string;
    h1_title: string;
    meta_description: string;
    content: Json;
    schema_org: Json;
    internal_links: string[];
    repairers_count: number;
    average_rating?: number;
  }): Promise<GenerationResult> {
    try {
      // Vérifier si la page existe déjà
      const { data: existing } = await supabase
        .from('seo_programmatic_pages')
        .select('id')
        .eq('slug', pageData.slug)
        .single();

      if (existing) {
        // Mise à jour
        const { error } = await supabase
          .from('seo_programmatic_pages')
          .update({
            ...pageData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;

        return {
          success: true,
          pageId: existing.id,
          slug: pageData.slug
        };
      }

      // Création
      const { data, error } = await supabase
        .from('seo_programmatic_pages')
        .insert({
          ...pageData,
          is_published: false,
          is_indexed: false,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        pageId: data.id,
        slug: pageData.slug
      };
    } catch (error) {
      console.error('Erreur sauvegarde page SEO:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Génère toutes les pages pour une ville donnée
   */
  async generateAllPagesForCity(city: string): Promise<{
    total: number;
    success: number;
    failed: number;
    results: GenerationResult[];
  }> {
    const results: GenerationResult[] = [];

    // Récupérer les réparateurs de la ville depuis la table 'repairers'
    const { data: repairers } = await supabase
      .from('repairers')
      .select('id, name, rating, specialties, services')
      .ilike('city', `%${city}%`)
      .eq('is_verified', true);

    if (!repairers || repairers.length === 0) {
      return { total: 0, success: 0, failed: 0, results: [] };
    }

    // Extraire les marques et modèles populaires depuis specialties
    const brandsCount: Record<string, number> = {};
    const modelsCount: Record<string, number> = {};

    // Liste des marques connues
    const knownBrands = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Google', 'OnePlus', 'Oppo', 'Honor', 'Sony', 'Nokia', 'LG', 'Motorola'];

    repairers.forEach(r => {
      const specialties = r.specialties as string[] || [];
      const services = r.services as string[] || [];
      const allSpecs = [...specialties, ...services];
      
      // Détecter les marques
      knownBrands.forEach(brand => {
        if (allSpecs.some(s => s.toLowerCase().includes(brand.toLowerCase()))) {
          brandsCount[brand] = (brandsCount[brand] || 0) + 1;
        }
      });
      
      // Détecter les modèles courants
      const modelPatterns = [
        'iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone X',
        'Galaxy S24', 'Galaxy S23', 'Galaxy S22', 'Galaxy S21', 'Galaxy A54', 'Galaxy A53',
        'Pixel 8', 'Pixel 7', 'Pixel 6',
        'P40', 'P30', 'Mate 40', 'Mate 30'
      ];
      
      modelPatterns.forEach(model => {
        if (allSpecs.some(s => s.toLowerCase().includes(model.toLowerCase()))) {
          modelsCount[model] = (modelsCount[model] || 0) + 1;
        }
      });
    });

    const popularBrands = Object.entries(brandsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([brand]) => brand);

    // Si pas assez de marques détectées, ajouter les plus populaires
    if (popularBrands.length < 5) {
      const defaultBrands = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Google'];
      defaultBrands.forEach(b => {
        if (!popularBrands.includes(b)) {
          popularBrands.push(b);
        }
      });
    }

    const popularModels = Object.entries(modelsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([model]) => model);

    // Si pas assez de modèles détectés, ajouter les plus populaires
    if (popularModels.length < 10) {
      const defaultModels = ['iPhone 15', 'iPhone 14', 'iPhone 13', 'Galaxy S24', 'Galaxy S23', 'Galaxy A54', 'Pixel 8'];
      defaultModels.forEach(m => {
        if (!popularModels.includes(m)) {
          popularModels.push(m);
        }
      });
    }

    const avgRating = repairers.reduce((sum, r) => sum + (r.rating || 0), 0) / repairers.length;

    // 1. Générer la page hub ville
    results.push(await this.generateHubCityPage({
      city,
      department: '',
      region: '',
      postalCodes: [],
      repairersCount: repairers.length,
      topRepairers: repairers.slice(0, 5).map(r => r.id),
      popularBrands,
      popularModels
    }));

    // 2. Générer les pages marque + ville
    for (const brand of popularBrands.slice(0, 5)) {
      results.push(await this.generateBrandCityPage({
        brand,
        city,
        repairersCount: Math.max(1, Math.floor(repairers.length * 0.7)),
        models: popularModels.filter(m => m.toLowerCase().includes(brand.toLowerCase()) || 
          (brand === 'Apple' && m.toLowerCase().includes('iphone')) ||
          (brand === 'Samsung' && m.toLowerCase().includes('galaxy')) ||
          (brand === 'Google' && m.toLowerCase().includes('pixel'))),
        averageRating: avgRating
      }));
    }

    // 3. Générer les pages modèle + ville (top 10)
    for (const model of popularModels.slice(0, 10)) {
      const brand = this.inferBrandFromModel(model);

      results.push(await this.generateModelCityPage({
        model,
        brand,
        city,
        repairersCount: Math.max(1, Math.floor(repairers.length * 0.5)),
        averageRating: avgRating,
        repairerIds: repairers.slice(0, 5).map(r => r.id)
      }));
    }

    const successCount = results.filter(r => r.success).length;

    return {
      total: results.length,
      success: successCount,
      failed: results.length - successCount,
      results
    };
  }

  /**
   * Infère la marque à partir du nom du modèle
   */
  private inferBrandFromModel(model: string): string {
    const modelLower = model.toLowerCase();
    
    if (modelLower.includes('iphone') || modelLower.includes('ipad')) return 'Apple';
    if (modelLower.includes('galaxy') || modelLower.includes('samsung')) return 'Samsung';
    if (modelLower.includes('pixel')) return 'Google';
    if (modelLower.includes('huawei') || modelLower.includes('p30') || modelLower.includes('p40') || modelLower.includes('mate')) return 'Huawei';
    if (modelLower.includes('xiaomi') || modelLower.includes('redmi') || modelLower.includes('poco')) return 'Xiaomi';
    if (modelLower.includes('oneplus')) return 'OnePlus';
    if (modelLower.includes('oppo')) return 'Oppo';
    if (modelLower.includes('honor')) return 'Honor';
    if (modelLower.includes('nokia')) return 'Nokia';
    if (modelLower.includes('sony') || modelLower.includes('xperia')) return 'Sony';
    
    return 'Autre';
  }

  /**
   * Génère les pages symptômes standards
   */
  async generateStandardSymptomPages(): Promise<GenerationResult[]> {
    const symptoms = [
      {
        symptom: 'Écran cassé',
        category: 'écran',
        description: 'Un écran cassé peut rendre votre téléphone inutilisable. Que ce soit une fissure légère ou un écran complètement brisé, nos réparateurs peuvent remplacer votre écran rapidement.',
        solutions: ['Remplacement écran complet', 'Remplacement vitre tactile', 'Réparation LCD'],
        relatedSymptoms: ['Écran noir', 'Tactile ne répond plus', 'Affichage rayé']
      },
      {
        symptom: 'Batterie qui se décharge vite',
        category: 'batterie',
        description: 'Une batterie qui se décharge rapidement peut être un signe d\'usure normale ou d\'un problème plus profond. Un remplacement de batterie peut redonner vie à votre appareil.',
        solutions: ['Remplacement batterie', 'Diagnostic consommation', 'Optimisation logicielle'],
        relatedSymptoms: ['Téléphone qui s\'éteint tout seul', 'Batterie gonflée', 'Téléphone qui chauffe']
      },
      {
        symptom: 'Téléphone ne charge plus',
        category: 'charge',
        description: 'Si votre téléphone ne charge plus, le problème peut venir du connecteur de charge, de la batterie ou du circuit de charge.',
        solutions: ['Remplacement connecteur de charge', 'Nettoyage port de charge', 'Remplacement batterie'],
        relatedSymptoms: ['Charge lente', 'Charge intermittente', 'Port USB endommagé']
      },
      {
        symptom: 'Écran noir',
        category: 'écran',
        description: 'Un écran noir peut avoir plusieurs causes : problème d\'affichage, batterie vide, ou problème de carte mère.',
        solutions: ['Remplacement écran', 'Réparation carte mère', 'Remplacement batterie'],
        relatedSymptoms: ['Écran cassé', 'Téléphone ne s\'allume plus', 'Rétroéclairage défaillant']
      },
      {
        symptom: 'Téléphone tombé dans l\'eau',
        category: 'oxydation',
        description: 'L\'eau peut causer des dégâts importants à votre téléphone. Une intervention rapide peut sauver votre appareil.',
        solutions: ['Désoxydation', 'Nettoyage carte mère', 'Remplacement composants'],
        relatedSymptoms: ['Corrosion', 'Téléphone ne s\'allume plus', 'Dysfonctionnements multiples']
      },
      {
        symptom: 'Caméra ne fonctionne plus',
        category: 'caméra',
        description: 'Problème de caméra avant ou arrière ? Nos réparateurs peuvent diagnostiquer et réparer votre appareil photo.',
        solutions: ['Remplacement caméra', 'Nettoyage lentille', 'Réparation logicielle'],
        relatedSymptoms: ['Photos floues', 'Flash ne fonctionne pas', 'Caméra rayée']
      },
      {
        symptom: 'Haut-parleur ne fonctionne plus',
        category: 'audio',
        description: 'Problème de son ? Que ce soit le haut-parleur principal ou celui pour les appels, nous pouvons le réparer.',
        solutions: ['Remplacement haut-parleur', 'Nettoyage grille', 'Réparation nappe audio'],
        relatedSymptoms: ['Son grésillant', 'Micro ne fonctionne pas', 'Pas de son en appel']
      },
      {
        symptom: 'Bouton power défaillant',
        category: 'boutons',
        description: 'Le bouton power ne répond plus ou est enfoncé ? Ce problème courant peut être réparé facilement.',
        solutions: ['Remplacement bouton power', 'Réparation nappe', 'Nettoyage'],
        relatedSymptoms: ['Bouton volume cassé', 'Bouton home défaillant', 'Téléphone ne s\'allume plus']
      }
    ];

    const results: GenerationResult[] = [];

    for (const symptom of symptoms) {
      results.push(await this.generateSymptomPage(symptom));
    }

    return results;
  }
}

export const seoProgrammaticGenerator = new SeoProgrammaticGenerator();
export default seoProgrammaticGenerator;
