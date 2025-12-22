/**
 * Service centralisé pour la gestion de la navigation et validation des routes
 */
export class NavigationService {
  
  /**
   * Routes principales de l'application
   */
  static readonly routes = {
    // Pages publiques
    home: '/',
    search: '/search',
    blog: '/blog',
    blogArticle: (slug: string) => `/blog/${slug}`,
    
    // Services
    smartphoneRepair: '/reparation-smartphone',
    tabletRepair: '/reparation-tablette',
    computerRepair: '/reparation-ordinateur',
    consoleRepair: '/reparation-console',
    
    // Authentification
    clientAuth: '/client-auth',
    repairerAuth: '/repairer-auth',
    
    // Espaces utilisateurs
    client: '/client-auth',
    repairer: '/repairer-auth',
    repairerPlans: '/repairer-plans',
    repairerDashboard: '/repairer-dashboard',
    clientDashboard: '/client-dashboard',
    admin: '/admin',
    
    // Blog spécialisé
    blogRepairers: '/blog/repairers',
    blogRepairersArticle: (slug: string) => `/blog/repairers/article/${slug}`,
    
    // Pages légales
    legalNotice: '/legal-notice',
    terms: '/terms',
    termsOfSale: '/terms-of-sale',
    privacy: '/privacy',
    cookies: '/cookies',
    
    // Autres
    quotesAppointments: '/quotes-appointments',
    suppliersDirectory: '/suppliers-directory',
    documentation: '/documentation'
  } as const;

  /**
   * Vérifie si une route existe dans l'application
   */
  static isValidRoute(path: string): boolean {
    const validPaths = [
      '/',
      '/search',
      '/blog',
      '/blog/repairers',
      '/client-auth',
      '/repairer-auth', 
      '/admin',
      '/repairer-dashboard',
      '/client-dashboard',
      '/repairer-plans',
      '/repairer-profile',
      '/repairer-settings',
      '/reparation-smartphone',
      '/reparation-tablette',
      '/reparation-ordinateur',
      '/reparation-console',
      '/quotes-appointments',
      '/suppliers-directory',
      '/legal-notice',
      '/terms',
      '/terms-of-sale',
      '/privacy',
      '/cookies',
      '/documentation'
    ];
    
    return validPaths.some(validPath => 
      path === validPath || path.startsWith(validPath + '/')
    );
  }

  /**
   * Nettoie et valide un slug de blog
   */
  static cleanSlug(slug: string): string {
    if (!slug || typeof slug !== 'string') {
      return 'article-sans-slug';
    }

    const cleaned = slug
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-_]/g, '') 
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleaned || cleaned.length === 0) {
      return 'article-sans-titre';
    }

    return cleaned;
  }

  /**
   * Normalise une URL avec accents pour la recherche
   */
  static normalizeUrlForSearch(url: string): string {
    return this.cleanSlug(url);
  }

  /**
   * Génère une URL d'article de blog sécurisée
   */
  static getBlogArticleUrl(slug: string, isRepairers = false): string {
    const cleanSlug = this.cleanSlug(slug);
    return isRepairers 
      ? this.routes.blogRepairersArticle(cleanSlug)
      : this.routes.blogArticle(cleanSlug);
  }

  /**
   * Vérifie les permissions d'accès pour une route donnée
   */
  static canAccessRoute(
    path: string, 
    userRole: string | null,
    isAuthenticated: boolean
  ): boolean {
    const publicRoutes = ['/', '/blog', '/search', '/client-auth', '/repairer-auth', '/repairer-plans'];
    if (publicRoutes.some(route => path.startsWith(route))) {
      return true;
    }

    if (!isAuthenticated) {
      return false;
    }

    if (path.startsWith('/admin')) {
      return userRole === 'admin';
    }

    if (path.startsWith('/repairer')) {
      return userRole === 'repairer' || userRole === 'admin';
    }

    if (path.startsWith('/client')) {
      return userRole === 'user' || userRole === 'admin';
    }

    return true;
  }

  /**
   * Redirige l'utilisateur vers la route appropriée selon son rôle
   */
  static getDefaultRouteForRole(role: string | null): string {
    switch (role) {
      case 'admin':
        return this.routes.admin;
      case 'repairer':
        return this.routes.repairerDashboard;
      case 'user':
        return this.routes.clientDashboard;
      default:
        return this.routes.home;
    }
  }

  /**
   * Valide et nettoie les liens externes
   */
  static isValidExternalUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Génère un slug sécurisé à partir d'un titre
   */
  static generateSlugFromTitle(title: string): string {
    if (!title || typeof title !== 'string') {
      return 'article-sans-titre';
    }
    return this.cleanSlug(title);
  }

  /**
   * Liste des liens à auditer
   */
  static readonly linksToAudit = [
    { path: '/', description: 'Page d\'accueil' },
    { path: '/search', description: 'Recherche' },
    { path: '/blog', description: 'Blog principal' },
    { path: '/client-auth', description: 'Authentification client' },
    { path: '/repairer-auth', description: 'Authentification réparateur' },
    { path: '/repairer-plans', description: 'Plans réparateur' },
    { path: '/repairer-dashboard', description: 'Dashboard réparateur' },
    { path: '/client-dashboard', description: 'Dashboard client' },
    { path: '/admin', description: 'Dashboard admin' },
    { path: '/blog/repairers', description: 'Blog réparateurs' },
    { path: '/reparation-smartphone', description: 'Réparation smartphone' },
    { path: '/reparation-tablette', description: 'Réparation tablette' },
    { path: '/legal-notice', description: 'Mentions légales' },
    { path: '/terms', description: 'CGU' },
    { path: '/privacy', description: 'Politique de confidentialité' },
  ];
}
