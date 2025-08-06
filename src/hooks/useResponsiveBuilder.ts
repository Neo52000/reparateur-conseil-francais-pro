import { useState, useCallback, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type DeviceOrientation = 'portrait' | 'landscape';

export interface ResponsiveConfig {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
}

export interface ViewportState {
  breakpoint: Breakpoint;
  orientation: DeviceOrientation;
  width: number;
  height: number;
  scale: number;
}

const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

export interface UseResponsiveBuilderOptions {
  responsiveConfig?: ResponsiveConfig;
  onBreakpointChange?: (breakpoint: Breakpoint) => void;
  enableDevicePreview?: boolean;
}

export function useResponsiveBuilder(options: UseResponsiveBuilderOptions = {}) {
  const {
    responsiveConfig = DEFAULT_RESPONSIVE_CONFIG,
    onBreakpointChange,
    enableDevicePreview = true
  } = options;

  const [viewportState, setViewportState] = useState<ViewportState>({
    breakpoint: 'desktop',
    orientation: 'landscape',
    width: responsiveConfig.desktop.width,
    height: responsiveConfig.desktop.height,
    scale: 1
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedBreakpoints, setSelectedBreakpoints] = useState<Breakpoint[]>(['desktop']);

  // Switch between breakpoints
  const switchBreakpoint = useCallback((breakpoint: Breakpoint) => {
    const config = responsiveConfig[breakpoint];
    const orientation = config.width > config.height ? 'landscape' : 'portrait';
    
    setViewportState(prev => ({
      ...prev,
      breakpoint,
      orientation,
      width: config.width,
      height: config.height
    }));
    
    onBreakpointChange?.(breakpoint);
  }, [responsiveConfig, onBreakpointChange]);

  // Toggle device orientation
  const toggleOrientation = useCallback(() => {
    setViewportState(prev => ({
      ...prev,
      orientation: prev.orientation === 'portrait' ? 'landscape' : 'portrait',
      width: prev.height,
      height: prev.width
    }));
  }, []);

  // Set custom viewport size
  const setCustomViewport = useCallback((width: number, height: number) => {
    const breakpoint = getBreakpointFromWidth(width);
    const orientation = width > height ? 'landscape' : 'portrait';
    
    setViewportState(prev => ({
      ...prev,
      breakpoint,
      orientation,
      width,
      height
    }));
  }, []);

  // Set canvas scale/zoom
  const setCanvasScale = useCallback((scale: number) => {
    setViewportState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(2, scale))
    }));
  }, []);

  // Toggle preview mode
  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  // Multi-breakpoint preview
  const toggleBreakpointSelection = useCallback((breakpoint: Breakpoint) => {
    setSelectedBreakpoints(prev => {
      if (prev.includes(breakpoint)) {
        return prev.filter(bp => bp !== breakpoint);
      } else {
        return [...prev, breakpoint];
      }
    });
  }, []);

  // Generate responsive CSS classes
  const getResponsiveClasses = useCallback((
    baseClasses: string,
    responsiveClasses?: Partial<Record<Breakpoint, string>>
  ): string => {
    let classes = baseClasses;
    
    if (responsiveClasses) {
      if (responsiveClasses.mobile) {
        classes += ` ${responsiveClasses.mobile}`;
      }
      if (responsiveClasses.tablet) {
        classes += ` md:${responsiveClasses.tablet}`;
      }
      if (responsiveClasses.desktop) {
        classes += ` lg:${responsiveClasses.desktop}`;
      }
    }
    
    return classes;
  }, []);

  // Generate responsive styles object
  const getResponsiveStyles = useCallback((
    baseStyles: React.CSSProperties,
    responsiveStyles?: Partial<Record<Breakpoint, React.CSSProperties>>
  ): React.CSSProperties => {
    let styles = { ...baseStyles };
    
    if (responsiveStyles && responsiveStyles[viewportState.breakpoint]) {
      styles = { ...styles, ...responsiveStyles[viewportState.breakpoint] };
    }
    
    return styles;
  }, [viewportState.breakpoint]);

  // Get CSS media queries
  const getMediaQueries = useCallback(() => {
    return {
      mobile: '(max-width: 767px)',
      tablet: '(min-width: 768px) and (max-width: 1023px)',
      desktop: '(min-width: 1024px)'
    };
  }, []);

  // Helper function to determine breakpoint from width
  const getBreakpointFromWidth = (width: number): Breakpoint => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Auto-detect device characteristics
  useEffect(() => {
    if (typeof window !== 'undefined' && enableDevicePreview) {
      const handleResize = () => {
        const breakpoint = getBreakpointFromWidth(window.innerWidth);
        if (breakpoint !== viewportState.breakpoint) {
          switchBreakpoint(breakpoint);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [enableDevicePreview, viewportState.breakpoint, switchBreakpoint]);

  // Canvas container styles
  const getCanvasContainerStyles = useCallback((): React.CSSProperties => {
    return {
      width: `${viewportState.width}px`,
      height: `${viewportState.height}px`,
      transform: `scale(${viewportState.scale})`,
      transformOrigin: 'top left',
      transition: 'all 0.3s ease',
      border: isPreviewMode ? 'none' : '1px solid hsl(var(--border))',
      borderRadius: isPreviewMode ? '0' : '8px',
      overflow: 'hidden',
      position: 'relative'
    };
  }, [viewportState, isPreviewMode]);

  // Device frame styles for preview
  const getDeviceFrameStyles = useCallback((): React.CSSProperties => {
    const isPhone = viewportState.breakpoint === 'mobile';
    const isTablet = viewportState.breakpoint === 'tablet';
    
    return {
      padding: isPhone ? '60px 20px' : isTablet ? '40px 20px' : '0',
      background: isPhone || isTablet ? 'hsl(var(--muted))' : 'transparent',
      borderRadius: isPhone ? '30px' : isTablet ? '20px' : '0',
      position: 'relative'
    };
  }, [viewportState.breakpoint]);

  return {
    viewportState,
    isPreviewMode,
    selectedBreakpoints,
    responsiveConfig,
    switchBreakpoint,
    toggleOrientation,
    setCustomViewport,
    setCanvasScale,
    togglePreviewMode,
    toggleBreakpointSelection,
    getResponsiveClasses,
    getResponsiveStyles,
    getMediaQueries,
    getCanvasContainerStyles,
    getDeviceFrameStyles,
  };
}