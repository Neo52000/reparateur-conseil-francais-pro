/**
 * SEO Machine Analyzer
 * Inspired by https://github.com/TheCraigHewitt/seomachine
 * Content analysis, keyword density, readability scoring, SEO quality rating (0-100)
 */

export interface SeoAnalysisResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: SeoScoreBreakdown;
  suggestions: SeoSuggestion[];
  keywordAnalysis: KeywordAnalysis;
  readabilityScore: ReadabilityScore;
  contentMetrics: ContentMetrics;
}

export interface SeoScoreBreakdown {
  title: number; // 0-15
  metaDescription: number; // 0-15
  headings: number; // 0-10
  content: number; // 0-15
  keywords: number; // 0-10
  internalLinks: number; // 0-10
  readability: number; // 0-10
  structuredData: number; // 0-10
  technicalSeo: number; // 0-5
}

export interface SeoSuggestion {
  type: 'error' | 'warning' | 'info' | 'success';
  category: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface KeywordAnalysis {
  primaryKeyword: string;
  density: number; // percentage
  occurrences: number;
  inTitle: boolean;
  inH1: boolean;
  inMetaDescription: boolean;
  inFirstParagraph: boolean;
  relatedKeywords: { keyword: string; count: number }[];
}

export interface ReadabilityScore {
  fleschKincaid: number; // 0-100
  avgSentenceLength: number;
  avgWordLength: number;
  paragraphCount: number;
  grade: string; // 'Facile' | 'Moyen' | 'Difficile'
}

export interface ContentMetrics {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  sentenceCount: number;
  headingCount: number;
  imageCount: number;
  linkCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  estimatedReadTime: number; // minutes
}

export interface TopicCluster {
  pillarTopic: string;
  pillarSlug: string;
  supportingArticles: {
    title: string;
    slug: string;
    targetKeyword: string;
    status: 'published' | 'draft' | 'planned';
  }[];
  internalLinkingMap: { from: string; to: string; anchor: string }[];
}

/**
 * SEO Machine Analysis Engine
 */
class SeoMachineAnalyzer {
  /**
   * Analyse complète d'une page SEO
   */
  analyzeContent(params: {
    title: string;
    metaDescription: string;
    h1: string;
    content: string;
    targetKeyword: string;
    url: string;
    internalLinks?: string[];
    hasStructuredData?: boolean;
    hasCanonical?: boolean;
    imageCount?: number;
  }): SeoAnalysisResult {
    const breakdown = this.calculateBreakdown(params);
    const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
    const keywordAnalysis = this.analyzeKeywords(params);
    const readabilityScore = this.analyzeReadability(params.content);
    const contentMetrics = this.calculateContentMetrics(params);
    const suggestions = this.generateSuggestions(params, breakdown, keywordAnalysis, readabilityScore, contentMetrics);

    return {
      score,
      grade: this.getGrade(score),
      breakdown,
      suggestions,
      keywordAnalysis,
      readabilityScore,
      contentMetrics
    };
  }

  private calculateBreakdown(params: {
    title: string;
    metaDescription: string;
    h1: string;
    content: string;
    targetKeyword: string;
    internalLinks?: string[];
    hasStructuredData?: boolean;
    hasCanonical?: boolean;
    imageCount?: number;
  }): SeoScoreBreakdown {
    return {
      title: this.scoreTitle(params.title, params.targetKeyword),
      metaDescription: this.scoreMetaDescription(params.metaDescription, params.targetKeyword),
      headings: this.scoreHeadings(params.h1, params.content, params.targetKeyword),
      content: this.scoreContent(params.content, params.targetKeyword),
      keywords: this.scoreKeywordUsage(params),
      internalLinks: this.scoreInternalLinks(params.internalLinks || [], params.content),
      readability: this.scoreReadability(params.content),
      structuredData: params.hasStructuredData ? 10 : 0,
      technicalSeo: this.scoreTechnical(params)
    };
  }

  private scoreTitle(title: string, keyword: string): number {
    let score = 0;
    if (!title) return 0;
    if (title.length >= 30 && title.length <= 60) score += 5;
    else if (title.length > 0) score += 2;
    if (title.toLowerCase().includes(keyword.toLowerCase())) score += 5;
    // Keyword near beginning
    if (title.toLowerCase().indexOf(keyword.toLowerCase()) < title.length / 3) score += 3;
    else if (title.toLowerCase().includes(keyword.toLowerCase())) score += 1;
    // Power words
    const powerWords = ['meilleur', 'guide', 'gratuit', 'rapide', 'expert', 'comparatif', 'avis'];
    if (powerWords.some(w => title.toLowerCase().includes(w))) score += 2;
    return Math.min(15, score);
  }

  private scoreMetaDescription(desc: string, keyword: string): number {
    let score = 0;
    if (!desc) return 0;
    if (desc.length >= 120 && desc.length <= 160) score += 5;
    else if (desc.length >= 80) score += 3;
    else if (desc.length > 0) score += 1;
    if (desc.toLowerCase().includes(keyword.toLowerCase())) score += 5;
    // Call to action
    const ctaWords = ['découvrez', 'trouvez', 'comparez', 'obtenez', 'devis', 'gratuit'];
    if (ctaWords.some(w => desc.toLowerCase().includes(w))) score += 3;
    // Unique selling proposition
    if (desc.includes('€') || desc.includes('garanti') || /\d+/.test(desc)) score += 2;
    return Math.min(15, score);
  }

  private scoreHeadings(h1: string, content: string, keyword: string): number {
    let score = 0;
    if (h1 && h1.length > 0) score += 3;
    if (h1 && h1.toLowerCase().includes(keyword.toLowerCase())) score += 3;
    // Check for subheadings in content
    const h2Count = (content.match(/<h2|## /g) || []).length;
    const h3Count = (content.match(/<h3|### /g) || []).length;
    if (h2Count >= 2) score += 2;
    if (h3Count >= 1) score += 1;
    if (h2Count > 0 && h3Count > 0) score += 1; // Good hierarchy
    return Math.min(10, score);
  }

  private scoreContent(content: string, keyword: string): number {
    let score = 0;
    const wordCount = this.countWords(content);
    
    // Word count scoring (SEO Machine recommends 1500+ for pillar, 800+ for supporting)
    if (wordCount >= 1500) score += 5;
    else if (wordCount >= 800) score += 4;
    else if (wordCount >= 300) score += 2;
    else score += 1;

    // Keyword density (ideal 1-3%)
    const density = this.calculateKeywordDensity(content, keyword);
    if (density >= 0.5 && density <= 3) score += 4;
    else if (density > 0) score += 2;

    // First paragraph contains keyword
    const firstParagraph = content.split(/\n\n|<\/p>/)[0] || '';
    if (firstParagraph.toLowerCase().includes(keyword.toLowerCase())) score += 3;

    // Content variety (lists, bold, etc)
    if (content.includes('<ul') || content.includes('<ol') || content.includes('- ')) score += 1;
    if (content.includes('<strong') || content.includes('**')) score += 1;
    if (content.includes('<img') || content.includes('![')) score += 1;

    return Math.min(15, score);
  }

  private scoreKeywordUsage(params: {
    title: string;
    metaDescription: string;
    h1: string;
    content: string;
    targetKeyword: string;
  }): number {
    let score = 0;
    const kw = params.targetKeyword.toLowerCase();
    
    // Keyword in critical places
    if (params.title.toLowerCase().includes(kw)) score += 2;
    if (params.metaDescription.toLowerCase().includes(kw)) score += 2;
    if (params.h1.toLowerCase().includes(kw)) score += 2;
    
    // LSI / Related keywords
    const relatedTerms = this.findRelatedTerms(params.content, params.targetKeyword);
    if (relatedTerms.length >= 5) score += 3;
    else if (relatedTerms.length >= 3) score += 2;
    else if (relatedTerms.length >= 1) score += 1;

    // No keyword stuffing
    const density = this.calculateKeywordDensity(params.content, params.targetKeyword);
    if (density > 5) score -= 2; // Penalty for over-optimization

    return Math.max(0, Math.min(10, score));
  }

  private scoreInternalLinks(links: string[], content: string): number {
    let score = 0;
    const linkCount = links.length + (content.match(/<a\s+href="\/[^"]*"/g) || []).length;
    
    if (linkCount >= 5) score += 5;
    else if (linkCount >= 3) score += 3;
    else if (linkCount >= 1) score += 1;

    // Diverse anchors (not all same text)
    if (links.length >= 3) score += 3;
    else if (links.length >= 1) score += 1;

    // Links to pillar/hub pages
    if (links.some(l => l.includes('reparateurs/') || l.includes('reparation-'))) score += 2;

    return Math.min(10, score);
  }

  private scoreReadability(content: string): number {
    const readability = this.analyzeReadability(content);
    if (readability.fleschKincaid >= 60) return 10;
    if (readability.fleschKincaid >= 40) return 7;
    if (readability.fleschKincaid >= 20) return 4;
    return 2;
  }

  private scoreTechnical(params: { hasCanonical?: boolean; imageCount?: number }): number {
    let score = 0;
    if (params.hasCanonical) score += 2;
    if ((params.imageCount || 0) > 0) score += 2;
    score += 1; // Mobile-friendly (assumed with React)
    return Math.min(5, score);
  }

  /**
   * Analyse de la densité de mots-clés
   */
  analyzeKeywords(params: {
    title: string;
    metaDescription: string;
    h1: string;
    content: string;
    targetKeyword: string;
  }): KeywordAnalysis {
    const kw = params.targetKeyword.toLowerCase();
    const contentLower = params.content.toLowerCase();
    const words = contentLower.split(/\s+/);
    const keywordWords = kw.split(/\s+/);
    
    let occurrences = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(' ');
      if (slice.includes(kw)) occurrences++;
    }

    const firstParagraph = params.content.split(/\n\n|<\/p>/)[0] || '';
    const relatedKeywords = this.findRelatedTerms(params.content, params.targetKeyword);

    return {
      primaryKeyword: params.targetKeyword,
      density: this.calculateKeywordDensity(params.content, params.targetKeyword),
      occurrences,
      inTitle: params.title.toLowerCase().includes(kw),
      inH1: params.h1.toLowerCase().includes(kw),
      inMetaDescription: params.metaDescription.toLowerCase().includes(kw),
      inFirstParagraph: firstParagraph.toLowerCase().includes(kw),
      relatedKeywords
    };
  }

  /**
   * Analyse de lisibilité (adaptation Flesch-Kincaid pour le français)
   */
  analyzeReadability(content: string): ReadabilityScore {
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/[#*_\[\]()]/g, '');
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = cleanContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    const syllables = words.reduce((sum, word) => sum + this.countSyllablesFr(word), 0);
    
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;
    
    // Adaptation Flesch pour le français
    const fleschKincaid = Math.max(0, Math.min(100,
      207 - (1.015 * avgSentenceLength) - (73.6 * avgSyllablesPerWord)
    ));

    let grade: string;
    if (fleschKincaid >= 70) grade = 'Très facile';
    else if (fleschKincaid >= 50) grade = 'Facile';
    else if (fleschKincaid >= 30) grade = 'Moyen';
    else grade = 'Difficile';

    return {
      fleschKincaid: Math.round(fleschKincaid * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgWordLength: words.length > 0 ? Math.round(
        (words.reduce((sum, w) => sum + w.length, 0) / words.length) * 10
      ) / 10 : 0,
      paragraphCount: paragraphs.length,
      grade
    };
  }

  /**
   * Calcul des métriques de contenu
   */
  calculateContentMetrics(params: {
    content: string;
    internalLinks?: string[];
    imageCount?: number;
  }): ContentMetrics {
    const cleanContent = params.content.replace(/<[^>]*>/g, '').replace(/[#*_\[\]()]/g, '');
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = cleanContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    const headings = (params.content.match(/<h[1-6]|#{1,6}\s/g) || []).length;
    const allLinks = (params.content.match(/<a\s+href="[^"]*"/g) || []);
    const internalLinkCount = (params.internalLinks?.length || 0) + 
      allLinks.filter(l => l.includes('href="/')).length;
    const externalLinkCount = allLinks.filter(l => l.includes('href="http')).length;

    return {
      wordCount: words.length,
      charCount: cleanContent.length,
      paragraphCount: paragraphs.length,
      sentenceCount: sentences.length,
      headingCount: headings,
      imageCount: params.imageCount || (params.content.match(/<img|!\[/g) || []).length,
      linkCount: allLinks.length + (params.internalLinks?.length || 0),
      internalLinkCount,
      externalLinkCount,
      estimatedReadTime: Math.max(1, Math.ceil(words.length / 200))
    };
  }

  /**
   * Génère des suggestions d'amélioration
   */
  private generateSuggestions(
    params: { title: string; metaDescription: string; h1: string; content: string; targetKeyword: string },
    breakdown: SeoScoreBreakdown,
    keywords: KeywordAnalysis,
    readability: ReadabilityScore,
    metrics: ContentMetrics
  ): SeoSuggestion[] {
    const suggestions: SeoSuggestion[] = [];

    // Title
    if (params.title.length < 30) {
      suggestions.push({ type: 'error', category: 'Titre', message: `Titre trop court (${params.title.length} car.). Visez 30-60 caractères.`, impact: 'high' });
    } else if (params.title.length > 60) {
      suggestions.push({ type: 'warning', category: 'Titre', message: `Titre trop long (${params.title.length} car.). Il sera tronqué dans les SERP.`, impact: 'high' });
    } else {
      suggestions.push({ type: 'success', category: 'Titre', message: 'Longueur du titre optimale.', impact: 'low' });
    }
    if (!keywords.inTitle) {
      suggestions.push({ type: 'error', category: 'Titre', message: `Le mot-clé "${params.targetKeyword}" est absent du titre.`, impact: 'high' });
    }

    // Meta description
    if (params.metaDescription.length < 120) {
      suggestions.push({ type: 'warning', category: 'Meta Description', message: `Description trop courte (${params.metaDescription.length} car.). Visez 120-160 caractères.`, impact: 'high' });
    } else if (params.metaDescription.length > 160) {
      suggestions.push({ type: 'warning', category: 'Meta Description', message: `Description trop longue (${params.metaDescription.length} car.). Elle sera tronquée.`, impact: 'medium' });
    }
    if (!keywords.inMetaDescription) {
      suggestions.push({ type: 'warning', category: 'Meta Description', message: 'Mot-clé absent de la meta description.', impact: 'medium' });
    }

    // Content
    if (metrics.wordCount < 300) {
      suggestions.push({ type: 'error', category: 'Contenu', message: `Contenu trop court (${metrics.wordCount} mots). Visez au minimum 800 mots.`, impact: 'high' });
    } else if (metrics.wordCount < 800) {
      suggestions.push({ type: 'warning', category: 'Contenu', message: `Contenu correct (${metrics.wordCount} mots). Visez 1500+ mots pour un contenu pilier.`, impact: 'medium' });
    } else {
      suggestions.push({ type: 'success', category: 'Contenu', message: `Bon volume de contenu (${metrics.wordCount} mots).`, impact: 'low' });
    }

    // Keywords
    if (keywords.density < 0.5) {
      suggestions.push({ type: 'warning', category: 'Mots-clés', message: `Densité du mot-clé faible (${keywords.density.toFixed(1)}%). Visez 1-3%.`, impact: 'medium' });
    } else if (keywords.density > 3) {
      suggestions.push({ type: 'error', category: 'Mots-clés', message: `Suroptimisation détectée (${keywords.density.toFixed(1)}%). Risque de pénalité Google.`, impact: 'high' });
    }
    if (!keywords.inFirstParagraph) {
      suggestions.push({ type: 'warning', category: 'Mots-clés', message: 'Mot-clé absent du premier paragraphe. Ajoutez-le naturellement.', impact: 'medium' });
    }
    if (keywords.relatedKeywords.length < 3) {
      suggestions.push({ type: 'info', category: 'Mots-clés', message: 'Ajoutez plus de mots-clés LSI/synonymes pour enrichir le champ sémantique.', impact: 'medium' });
    }

    // Internal links
    if (metrics.internalLinkCount < 3) {
      suggestions.push({ type: 'warning', category: 'Maillage interne', message: `Seulement ${metrics.internalLinkCount} liens internes. Ajoutez-en pour renforcer le maillage.`, impact: 'high' });
    } else {
      suggestions.push({ type: 'success', category: 'Maillage interne', message: `${metrics.internalLinkCount} liens internes détectés. Bon maillage.`, impact: 'low' });
    }

    // Readability
    if (readability.avgSentenceLength > 25) {
      suggestions.push({ type: 'warning', category: 'Lisibilité', message: 'Phrases trop longues en moyenne. Visez 15-20 mots par phrase.', impact: 'medium' });
    }

    // Headings
    if (metrics.headingCount < 3) {
      suggestions.push({ type: 'warning', category: 'Structure', message: 'Ajoutez plus de sous-titres (H2, H3) pour structurer le contenu.', impact: 'medium' });
    }

    // Structured data
    if (breakdown.structuredData === 0) {
      suggestions.push({ type: 'error', category: 'Données structurées', message: 'Aucun schéma JSON-LD détecté. Ajoutez des données structurées.', impact: 'high' });
    }

    return suggestions.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  }

  /**
   * Génère un plan de topic cluster (SEO Machine methodology)
   */
  generateTopicCluster(params: {
    pillarTopic: string;
    serviceType: string;
    cities: string[];
  }): TopicCluster {
    const pillarSlug = `guide-${this.slugify(params.pillarTopic)}`;
    
    const supportingArticles = [
      // Par prix
      { 
        title: `Combien coûte la réparation ${params.serviceType} en 2026 ?`,
        slug: `prix-reparation-${this.slugify(params.serviceType)}`,
        targetKeyword: `prix réparation ${params.serviceType}`,
        status: 'planned' as const
      },
      // Comparatif
      {
        title: `Comment choisir son réparateur ${params.serviceType} ?`,
        slug: `choisir-reparateur-${this.slugify(params.serviceType)}`,
        targetKeyword: `meilleur réparateur ${params.serviceType}`,
        status: 'planned' as const
      },
      // Guide diagnostic
      {
        title: `Diagnostic panne ${params.serviceType} : guide complet`,
        slug: `diagnostic-panne-${this.slugify(params.serviceType)}`,
        targetKeyword: `diagnostic panne ${params.serviceType}`,
        status: 'planned' as const
      },
      // Garantie
      {
        title: `Garantie réparation ${params.serviceType} : vos droits`,
        slug: `garantie-reparation-${this.slugify(params.serviceType)}`,
        targetKeyword: `garantie réparation ${params.serviceType}`,
        status: 'planned' as const
      },
      // Par ville
      ...params.cities.slice(0, 5).map(city => ({
        title: `Réparation ${params.serviceType} à ${city} : les meilleurs réparateurs`,
        slug: `reparation-${this.slugify(params.serviceType)}-${this.slugify(city)}`,
        targetKeyword: `réparation ${params.serviceType} ${city}`,
        status: 'published' as const
      }))
    ];

    // Build internal linking map
    const internalLinkingMap: { from: string; to: string; anchor: string }[] = [];
    
    // Pillar → supporting
    supportingArticles.forEach(article => {
      internalLinkingMap.push({
        from: pillarSlug,
        to: article.slug,
        anchor: article.title
      });
    });

    // Supporting → pillar
    supportingArticles.forEach(article => {
      internalLinkingMap.push({
        from: article.slug,
        to: pillarSlug,
        anchor: `Guide complet ${params.pillarTopic}`
      });
    });

    // Supporting → supporting (mesh)
    for (let i = 0; i < supportingArticles.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, supportingArticles.length); j++) {
        internalLinkingMap.push({
          from: supportingArticles[i].slug,
          to: supportingArticles[j].slug,
          anchor: supportingArticles[j].title
        });
      }
    }

    return {
      pillarTopic: params.pillarTopic,
      pillarSlug,
      supportingArticles,
      internalLinkingMap
    };
  }

  /**
   * Génère le maillage interne optimal pour une page
   */
  generateInternalLinks(params: {
    currentSlug: string;
    currentCity?: string;
    currentServiceType?: string;
    availablePages: { slug: string; title: string; city?: string; serviceType?: string }[];
  }): { slug: string; anchor: string; relevance: number }[] {
    const links: { slug: string; anchor: string; relevance: number }[] = [];

    params.availablePages.forEach(page => {
      if (page.slug === params.currentSlug) return;
      
      let relevance = 0;
      let anchor = page.title;

      // Same city = high relevance
      if (params.currentCity && page.city && page.city === params.currentCity) {
        relevance += 30;
      }
      
      // Same service type = high relevance
      if (params.currentServiceType && page.serviceType && page.serviceType === params.currentServiceType) {
        relevance += 25;
      }

      // Hub pages always relevant
      if (page.slug.startsWith('reparateurs-') || page.slug.startsWith('reparation-smartphone-')) {
        relevance += 15;
      }

      // Blog articles always somewhat relevant
      if (page.slug.startsWith('blog/')) {
        relevance += 10;
      }

      if (relevance > 0) {
        links.push({ slug: `/${page.slug}`, anchor, relevance });
      }
    });

    return links
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8); // Max 8 internal links
  }

  // Utility methods
  private countWords(text: string): number {
    return text.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const cleanContent = content.replace(/<[^>]*>/g, '').toLowerCase();
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(/\s+/);
    
    let occurrences = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(' ');
      if (slice === keywordLower) occurrences++;
    }

    return words.length > 0 ? (occurrences * keywordWords.length / words.length) * 100 : 0;
  }

  private findRelatedTerms(content: string, keyword: string): { keyword: string; count: number }[] {
    const repairTerms: Record<string, string[]> = {
      'smartphone': ['téléphone', 'mobile', 'écran', 'batterie', 'vitre', 'iPhone', 'Samsung', 'connecteur', 'caméra'],
      'tablette': ['iPad', 'écran tactile', 'batterie', 'vitre', 'connecteur', 'stockage'],
      'ordinateur': ['PC', 'Mac', 'laptop', 'portable', 'disque dur', 'SSD', 'RAM', 'écran', 'clavier'],
      'réparation': ['dépannage', 'réparateur', 'atelier', 'pièce', 'garantie', 'devis', 'diagnostic'],
      'default': ['réparation', 'réparateur', 'professionnel', 'garantie', 'devis', 'gratuit', 'rapide', 'qualité', 'certifié']
    };

    const relevantTerms = repairTerms[keyword.toLowerCase()] || repairTerms['default'];
    const contentLower = content.toLowerCase();
    
    return relevantTerms
      .map(term => ({
        keyword: term,
        count: (contentLower.match(new RegExp(term.toLowerCase(), 'g')) || []).length
      }))
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  private countSyllablesFr(word: string): number {
    const vowels = 'aeiouyàâéèêëïîôùûü';
    let count = 0;
    let prevVowel = false;
    for (const char of word.toLowerCase()) {
      if (vowels.includes(char)) {
        if (!prevVowel) count++;
        prevVowel = true;
      } else {
        prevVowel = false;
      }
    }
    return Math.max(1, count);
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 20) return 'D';
    return 'F';
  }
}

export const seoMachineAnalyzer = new SeoMachineAnalyzer();
export default seoMachineAnalyzer;
