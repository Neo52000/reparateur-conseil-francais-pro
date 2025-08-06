import React from 'react';
import { WidgetData } from '@/hooks/useDragDropAdvanced';
import { WidgetDefinition } from '@/hooks/useWidgetLibrary';
import { ViewportState } from '@/hooks/useResponsiveBuilder';

interface PropertyPanelProps {
  selectedWidget: WidgetData | null;
  widgetDefinition: WidgetDefinition | null;
  onUpdateWidget: (updates: Partial<WidgetData>) => void;
  responsiveState: ViewportState;
}

export function PropertyPanel({ selectedWidget }: PropertyPanelProps) {
  if (!selectedWidget) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-4xl mb-4">⚙️</div>
        <h3 className="font-medium mb-2">Aucun widget sélectionné</h3>
        <p className="text-sm">Sélectionnez un widget pour modifier ses propriétés</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Propriétés</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <p className="text-sm text-muted-foreground">{selectedWidget.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium">ID</label>
          <p className="text-sm text-muted-foreground font-mono">{selectedWidget.id}</p>
        </div>
      </div>
    </div>
  );
}