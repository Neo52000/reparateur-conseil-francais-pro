import { useMemo } from 'react';

interface StyleConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    badge?: string;
  };
  typography?: {
    titleSize?: number;
    priceSize?: number;
    featureSize?: number;
    fontWeight?: number;
  };
  layout?: {
    cardPadding?: number;
    borderRadius?: number;
    shadow?: string;
    spacing?: number;
  };
}

interface ResponsiveStyleConfig extends StyleConfig {
  responsive?: {
    sm?: Partial<StyleConfig>;
    md?: Partial<StyleConfig>;
    lg?: Partial<StyleConfig>;
    xl?: Partial<StyleConfig>;
  };
}

/**
 * Hook pour appliquer des styles dynamiques avec support responsive
 */
export function useAppliedStyles(config: ResponsiveStyleConfig) {
  const appliedClasses = useMemo(() => {
    const classes: string[] = [];
    
    // Classes typographiques responsives
    if (config.typography?.titleSize) {
      const baseSize = config.typography.titleSize;
      if (baseSize <= 16) classes.push('text-sm sm:text-base lg:text-lg');
      else if (baseSize <= 20) classes.push('text-base sm:text-lg lg:text-xl');
      else if (baseSize <= 24) classes.push('text-lg sm:text-xl lg:text-2xl');
      else if (baseSize <= 32) classes.push('text-xl sm:text-2xl lg:text-3xl');
      else classes.push('text-2xl sm:text-3xl lg:text-4xl');
    }
    
    if (config.typography?.featureSize) {
      const baseSize = config.typography.featureSize;
      if (baseSize <= 12) classes.push('text-xs sm:text-sm');
      else if (baseSize <= 14) classes.push('text-sm sm:text-base');
      else classes.push('text-base sm:text-lg');
    }
    
    // Classes de layout responsives
    if (config.layout?.cardPadding) {
      const padding = config.layout.cardPadding;
      if (padding <= 16) classes.push('p-2 sm:p-4');
      else if (padding <= 24) classes.push('p-4 sm:p-6');
      else classes.push('p-6 sm:p-8');
    }
    
    if (config.layout?.borderRadius) {
      const radius = config.layout.borderRadius;
      if (radius <= 8) classes.push('rounded-lg');
      else if (radius <= 12) classes.push('rounded-xl');
      else classes.push('rounded-2xl');
    }
    
    if (config.layout?.shadow) {
      classes.push(`shadow-${config.layout.shadow}`);
    }
    
    return classes.join(' ');
  }, [config]);

  const cssVariables = useMemo(() => {
    const variables: Record<string, string> = {};
    
    // Variables de couleur
    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        if (value) {
          variables[`--color-${key}`] = value;
        }
      });
    }
    
    // Variables typographiques avec unités responsive
    if (config.typography) {
      if (config.typography.titleSize) {
        variables['--title-size-base'] = `${config.typography.titleSize}px`;
        variables['--title-size-sm'] = `${Math.min(config.typography.titleSize + 2, 40)}px`;
        variables['--title-size-lg'] = `${Math.min(config.typography.titleSize + 4, 48)}px`;
      }
      
      if (config.typography.priceSize) {
        variables['--price-size-base'] = `${config.typography.priceSize}px`;
        variables['--price-size-sm'] = `${Math.min(config.typography.priceSize + 4, 50)}px`;
        variables['--price-size-lg'] = `${Math.min(config.typography.priceSize + 8, 60)}px`;
      }
      
      if (config.typography.featureSize) {
        variables['--feature-size-base'] = `${config.typography.featureSize}px`;
        variables['--feature-size-sm'] = `${Math.min(config.typography.featureSize + 1, 18)}px`;
        variables['--feature-size-lg'] = `${Math.min(config.typography.featureSize + 2, 20)}px`;
      }
      
      if (config.typography.fontWeight) {
        variables['--font-weight'] = config.typography.fontWeight.toString();
      }
    }
    
    // Variables de layout
    if (config.layout) {
      if (config.layout.cardPadding) {
        variables['--card-padding-base'] = `${config.layout.cardPadding}px`;
        variables['--card-padding-sm'] = `${Math.max(config.layout.cardPadding - 8, 8)}px`;
        variables['--card-padding-lg'] = `${config.layout.cardPadding + 8}px`;
      }
      
      if (config.layout.borderRadius) {
        variables['--border-radius'] = `${config.layout.borderRadius}px`;
      }
      
      if (config.layout.spacing) {
        variables['--spacing-base'] = `${config.layout.spacing}px`;
        variables['--spacing-sm'] = `${Math.max(config.layout.spacing - 4, 4)}px`;
        variables['--spacing-lg'] = `${config.layout.spacing + 4}px`;
      }
    }
    
    return variables;
  }, [config]);
  
  const inlineStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    // Appliquer les variables CSS
    Object.entries(cssVariables).forEach(([key, value]) => {
      styles[key as any] = value;
    });
    
    return styles;
  }, [cssVariables]);

  return {
    appliedClasses,
    cssVariables,
    inlineStyles,
    // Fonction helper pour générer des classes responsive custom
    getResponsiveClass: (base: string, sm?: string, lg?: string) => {
      return [base, sm && `sm:${sm}`, lg && `lg:${lg}`].filter(Boolean).join(' ');
    },
    // Fonction helper pour appliquer des styles conditionels
    applyConditionalStyle: (condition: boolean, trueStyle: string, falseStyle?: string) => {
      return condition ? trueStyle : (falseStyle || '');
    }
  };
}

// Hook spécialisé pour les composants Plan
export function usePlanStyles(config: StyleConfig) {
  return useAppliedStyles({
    ...config,
    responsive: {
      sm: {
        typography: {
          titleSize: config.typography?.titleSize ? config.typography.titleSize + 2 : undefined,
          priceSize: config.typography?.priceSize ? config.typography.priceSize + 4 : undefined,
        }
      },
      lg: {
        typography: {
          titleSize: config.typography?.titleSize ? config.typography.titleSize + 4 : undefined,
          priceSize: config.typography?.priceSize ? config.typography.priceSize + 8 : undefined,
        }
      }
    }
  });
}

// Hook spécialisé pour les composants Dashboard
export function useDashboardStyles(config: StyleConfig) {
  return useAppliedStyles({
    ...config,
    responsive: {
      sm: {
        layout: {
          cardPadding: config.layout?.cardPadding ? Math.max(config.layout.cardPadding - 8, 8) : undefined,
          spacing: config.layout?.spacing ? Math.max(config.layout.spacing - 4, 4) : undefined,
        }
      },
      lg: {
        layout: {
          cardPadding: config.layout?.cardPadding ? config.layout.cardPadding + 8 : undefined,
          spacing: config.layout?.spacing ? config.layout.spacing + 4 : undefined,
        }
      }
    }
  });
}