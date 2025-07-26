
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
    blog: '/blog',
    blogArticle: (slug: string) => `/blog/article/${slug}`,
    
    // Authentification
    clientAuth: '/client-auth',
    repairerAuth: '/repairer-auth',
    adminAuth: '/admin-auth',
    
    // Espaces utilisateurs
    client: '/client',
    repairer: '/repairer',
    repairerPlans: '/repairer/plans',
    admin: '/admin',
    
    // Blog spécialisé
    blogRepairers: '/blog/repairers',
    blogRepairersArticle: (slug: string) => `/blog/repairers/article/${slug}`
  } as const;

  /**
   * Vérifie si une route existe dans l'application
   */
  static isValidRoute(path: string): boolean {
    const validPaths = [
      '/',
      '/blog',
      '/blog/article',
      '/blog/repairers',
      '/blog/repairers/article',
      '/client-auth',
      '/repairer-auth', 
      '/admin-auth',
      '/client',
      '/repairer',
      '/repairer/plans',
      '/admin'
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
      console.warn('NavigationService.cleanSlug: Invalid slug provided:', slug);
      return 'article-sans-slug';
    }

    const cleaned = slug
      .toLowerCase()
      .trim()
      // Normaliser les caractères accentués
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      // Garder seulement les caractères alphanumériques, espaces, tirets et underscores
      .replace(/[^a-z0-9\s-_]/g, '') 
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .replace(/^-|-$/g, ''); // Supprimer les tirets en début et fin

    // Si le slug nettoyé est vide, retourner un fallback
    if (!cleaned || cleaned.length === 0) {
      console.warn('NavigationService.cleanSlug: Slug became empty after cleaning:', slug);
      return 'article-sans-titre';
    }

    console.log('NavigationService.cleanSlug:', { original: slug, cleaned });
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
    const url = isRepairers 
      ? this.routes.blogRepairersArticle(cleanSlug)
      : this.routes.blogArticle(cleanSlug);
    
    console.log('NavigationService.getBlogArticleUrl:', { slug, cleanSlug, url, isRepairers });
    return url;
  }

  /**
   * Vérifie les permissions d'accès pour une route donnée
   */
  static canAccessRoute(
    path: string, 
    userRole: string | null,
    isAuthenticated: boolean
  ): boolean {
    // Routes publiques
    const publicRoutes = ['/', '/blog', '/client-auth', '/repairer-auth'];
    if (publicRoutes.some(route => path.startsWith(route))) {
      return true;
    }

    // Routes nécessitant une authentification
    if (!isAuthenticated) {
      return false;
    }

    // Routes spécifiques par rôle
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
        return this.routes.repairer;
      case 'user':
        return this.routes.client;
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
   * Liste des liens potentiellement problématiques à vérifier
   */
  static readonly linksToAudit = [
    // Navigation principale
    { path: '/', description: 'Page d\'accueil' },
    { path: '/blog', description: 'Blog principal' },
    { path: '/client-auth', description: 'Authentification client' },
    { path: '/repairer-auth', description: 'Authentification réparateur' },
    { path: '/admin-auth', description: 'Authentification admin' },
    
    // Espaces utilisateurs
    { path: '/client', description: 'Dashboard client' },
    { path: '/repairer', description: 'Dashboard réparateur' },
    { path: '/repairer/plans', description: 'Plans réparateur' },
    { path: '/admin', description: 'Dashboard admin' },
    
    // Blog spécialisé
    { path: '/blog/repairers', description: 'Blog réparateurs' },
  ];
}
