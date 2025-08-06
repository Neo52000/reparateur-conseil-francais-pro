import { useState, useCallback, useMemo } from 'react';
import { WidgetData } from './useDragDropAdvanced';

export interface WidgetDefinition {
  id: string;
  name: string;
  category: 'dashboard' | 'pos' | 'plan' | 'layout' | 'content';
  subcategory?: string;
  icon: string;
  description: string;
  previewComponent?: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  defaultStyles: Record<string, any>;
  configSchema: {
    [key: string]: {
      type: 'text' | 'number' | 'color' | 'select' | 'boolean' | 'textarea' | 'image' | 'spacing' | 'typography';
      label: string;
      default?: any;
      options?: { label: string; value: any }[];
      min?: number;
      max?: number;
      step?: number;
    };
  };
  responsiveSupport: boolean;
  tags: string[];
}

// Widget library definitions
const WIDGET_LIBRARY: WidgetDefinition[] = [
  // Dashboard Widgets
  {
    id: 'metric-card',
    name: 'Carte Métrique',
    category: 'dashboard',
    subcategory: 'metrics',
    icon: '📊',
    description: 'Affiche une métrique clé avec valeur et variation',
    defaultProps: {
      title: 'Réparations',
      value: '248',
      change: '+12%',
      changeType: 'positive',
      period: 'ce mois'
    },
    defaultStyles: {
      background: 'hsl(var(--card))',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid hsl(var(--border))'
    },
    configSchema: {
      title: { type: 'text', label: 'Titre', default: 'Métrique' },
      value: { type: 'text', label: 'Valeur', default: '0' },
      change: { type: 'text', label: 'Variation', default: '+0%' },
      changeType: { 
        type: 'select', 
        label: 'Type de variation',
        options: [
          { label: 'Positive', value: 'positive' },
          { label: 'Négative', value: 'negative' },
          { label: 'Neutre', value: 'neutral' }
        ],
        default: 'positive'
      }
    },
    responsiveSupport: true,
    tags: ['métrique', 'kpi', 'dashboard', 'statistique']
  },
  {
    id: 'chart-area',
    name: 'Graphique Zone',
    category: 'dashboard',
    subcategory: 'charts',
    icon: '📈',
    description: 'Graphique en aires pour visualiser les tendances',
    defaultProps: {
      title: 'Évolution des réparations',
      data: [],
      xAxisKey: 'date',
      yAxisKey: 'value',
      fillColor: 'hsl(var(--primary))'
    },
    defaultStyles: {
      background: 'hsl(var(--card))',
      padding: '24px',
      borderRadius: '8px',
      height: '300px'
    },
    configSchema: {
      title: { type: 'text', label: 'Titre', default: 'Graphique' },
      fillColor: { type: 'color', label: 'Couleur de remplissage', default: 'hsl(var(--primary))' }
    },
    responsiveSupport: true,
    tags: ['graphique', 'tendance', 'analyse', 'données']
  },

  // POS Widgets
  {
    id: 'pos-calculator',
    name: 'Calculatrice POS',
    category: 'pos',
    subcategory: 'tools',
    icon: '🧮',
    description: 'Calculatrice pour les montants de réparation',
    defaultProps: {
      precision: 2,
      currency: '€',
      showHistory: true
    },
    defaultStyles: {
      background: 'hsl(var(--card))',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '300px'
    },
    configSchema: {
      precision: { type: 'number', label: 'Précision décimale', default: 2, min: 0, max: 4 },
      currency: { type: 'text', label: 'Devise', default: '€' },
      showHistory: { type: 'boolean', label: 'Afficher historique', default: true }
    },
    responsiveSupport: true,
    tags: ['calculatrice', 'pos', 'montant', 'prix']
  },
  {
    id: 'product-grid',
    name: 'Grille Produits',
    category: 'pos',
    subcategory: 'products',
    icon: '🛍️',
    description: 'Grille de produits/services sélectionnables',
    defaultProps: {
      columns: 3,
      showPrices: true,
      products: []
    },
    defaultStyles: {
      display: 'grid',
      gap: '16px',
      padding: '16px'
    },
    configSchema: {
      columns: { type: 'number', label: 'Colonnes', default: 3, min: 1, max: 6 },
      showPrices: { type: 'boolean', label: 'Afficher prix', default: true }
    },
    responsiveSupport: true,
    tags: ['produits', 'services', 'grille', 'sélection']
  },

  // Plan Widgets
  {
    id: 'pricing-card',
    name: 'Carte Tarif',
    category: 'plan',
    subcategory: 'pricing',
    icon: '💳',
    description: 'Carte de présentation d\'un plan tarifaire',
    defaultProps: {
      title: 'Plan Pro',
      price: '29',
      period: 'mois',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      highlighted: false,
      buttonText: 'Choisir ce plan'
    },
    defaultStyles: {
      background: 'hsl(var(--card))',
      padding: '32px',
      borderRadius: '12px',
      border: '1px solid hsl(var(--border))',
      textAlign: 'center'
    },
    configSchema: {
      title: { type: 'text', label: 'Titre du plan', default: 'Plan' },
      price: { type: 'text', label: 'Prix', default: '0' },
      period: { type: 'text', label: 'Période', default: 'mois' },
      highlighted: { type: 'boolean', label: 'Plan mis en avant', default: false },
      buttonText: { type: 'text', label: 'Texte du bouton', default: 'Choisir' }
    },
    responsiveSupport: true,
    tags: ['tarif', 'plan', 'prix', 'abonnement']
  },

  // Layout Widgets
  {
    id: 'container',
    name: 'Conteneur',
    category: 'layout',
    icon: '📦',
    description: 'Conteneur pour organiser d\'autres widgets',
    defaultProps: {
      direction: 'column',
      gap: 16,
      align: 'stretch',
      justify: 'flex-start'
    },
    defaultStyles: {
      display: 'flex',
      padding: '16px',
      minHeight: '100px',
      border: '2px dashed hsl(var(--border))',
      borderRadius: '8px'
    },
    configSchema: {
      direction: {
        type: 'select',
        label: 'Direction',
        options: [
          { label: 'Colonne', value: 'column' },
          { label: 'Ligne', value: 'row' }
        ],
        default: 'column'
      },
      gap: { type: 'number', label: 'Espacement', default: 16, min: 0, max: 64, step: 4 }
    },
    responsiveSupport: true,
    tags: ['conteneur', 'layout', 'organisation', 'structure']
  },

  // Content Widgets
  {
    id: 'text-block',
    name: 'Bloc de Texte',
    category: 'content',
    icon: '📝',
    description: 'Bloc de texte éditable avec formatage',
    defaultProps: {
      content: 'Votre texte ici...',
      fontSize: '16px',
      fontWeight: 'normal',
      textAlign: 'left',
      color: 'hsl(var(--foreground))'
    },
    defaultStyles: {
      padding: '16px',
      lineHeight: '1.5'
    },
    configSchema: {
      content: { type: 'textarea', label: 'Contenu', default: 'Texte...' },
      fontSize: { type: 'text', label: 'Taille police', default: '16px' },
      fontWeight: {
        type: 'select',
        label: 'Graisse',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Gras', value: 'bold' },
          { label: 'Léger', value: 'light' }
        ],
        default: 'normal'
      },
      textAlign: {
        type: 'select',
        label: 'Alignement',
        options: [
          { label: 'Gauche', value: 'left' },
          { label: 'Centre', value: 'center' },
          { label: 'Droite', value: 'right' }
        ],
        default: 'left'
      }
    },
    responsiveSupport: true,
    tags: ['texte', 'contenu', 'paragraphe', 'titre']
  }
];

export function useWidgetLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(WIDGET_LIBRARY.map(w => w.category))];
    return cats.map(cat => ({
      id: cat,
      name: cat === 'all' ? 'Tous' : 
            cat === 'dashboard' ? 'Tableau de bord' :
            cat === 'pos' ? 'Point de vente' :
            cat === 'plan' ? 'Plans tarifaires' :
            cat === 'layout' ? 'Mise en page' :
            cat === 'content' ? 'Contenu' : cat,
      count: cat === 'all' ? WIDGET_LIBRARY.length : WIDGET_LIBRARY.filter(w => w.category === cat).length
    }));
  }, []);

  // Get all tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    WIDGET_LIBRARY.forEach(widget => {
      widget.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter widgets based on search and selections
  const filteredWidgets = useMemo(() => {
    return WIDGET_LIBRARY.filter(widget => {
      // Category filter
      if (selectedCategory !== 'all' && widget.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = widget.name.toLowerCase().includes(query);
        const matchesDescription = widget.description.toLowerCase().includes(query);
        const matchesTags = widget.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => widget.tags.includes(tag));
        if (!hasSelectedTag) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedTags]);

  // Create widget instance from definition
  const createWidgetFromDefinition = useCallback((definitionId: string): WidgetData | null => {
    const definition = WIDGET_LIBRARY.find(w => w.id === definitionId);
    if (!definition) return null;

    return {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: definition.id,
      category: definition.category,
      props: { ...definition.defaultProps },
      styles: { ...definition.defaultStyles },
      responsiveStyles: {}
    };
  }, []);

  // Get widget definition
  const getWidgetDefinition = useCallback((type: string): WidgetDefinition | null => {
    return WIDGET_LIBRARY.find(w => w.id === type) || null;
  }, []);

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTags([]);
  }, []);

  return {
    widgets: filteredWidgets,
    allWidgets: WIDGET_LIBRARY,
    categories,
    availableTags,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    toggleTag,
    clearFilters,
    createWidgetFromDefinition,
    getWidgetDefinition,
  };
}