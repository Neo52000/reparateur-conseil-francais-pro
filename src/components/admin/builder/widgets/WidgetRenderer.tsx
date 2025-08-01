import React from 'react';
import { WidgetData } from '@/hooks/useDragDropAdvanced';
import { ViewportState } from '@/hooks/useResponsiveBuilder';

interface WidgetRendererProps {
  widget: WidgetData;
  isSelected?: boolean;
  isHovered?: boolean;
  isPreview?: boolean;
  responsiveState?: ViewportState;
}

export function WidgetRenderer({ widget, isSelected, isHovered, isPreview }: WidgetRendererProps) {
  const getWidgetContent = () => {
    switch (widget.type) {
      case 'metric-card':
        return (
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold">{widget.props?.title || 'Métrique'}</h3>
            <p className="text-2xl font-bold">{widget.props?.value || '0'}</p>
            <p className="text-sm text-muted-foreground">{widget.props?.change || '0%'}</p>
          </div>
        );
      case 'text-block':
        return (
          <div className="p-4">
            <p>{widget.props?.content || 'Texte par défaut'}</p>
          </div>
        );
      case 'pricing-card':
        return (
          <div className="bg-card p-6 rounded-lg border text-center">
            <h3 className="font-semibold">{widget.props?.title || 'Plan'}</h3>
            <p className="text-3xl font-bold">{widget.props?.price || '0'}€</p>
            <p className="text-sm text-muted-foreground">{widget.props?.period || 'mois'}</p>
          </div>
        );
      default:
        return (
          <div className="bg-muted p-4 rounded-lg border-dashed border-2">
            <p className="text-center text-muted-foreground">
              Widget: {widget.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`${isPreview ? 'pointer-events-none' : ''}`}>
      {getWidgetContent()}
    </div>
  );
}