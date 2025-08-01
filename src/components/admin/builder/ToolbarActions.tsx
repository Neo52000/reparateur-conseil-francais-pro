import React from 'react';
import { Save, Eye, Undo, Redo, Download, Upload, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResponsiveBuilder } from '@/hooks/useResponsiveBuilder';
import { useCanvasManager } from '@/hooks/useCanvasManager';

interface ToolbarActionsProps {
  type: string;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  onSave: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  responsive: ReturnType<typeof useResponsiveBuilder>;
  canvas: ReturnType<typeof useCanvasManager>;
}

export function ToolbarActions({
  type,
  canUndo,
  canRedo,
  isDirty,
  onSave,
  onPreview,
  onUndo,
  onRedo,
  responsive
}: ToolbarActionsProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{type}</Badge>
        {isDirty && <Badge variant="secondary">Non sauvegardé</Badge>}
      </div>

      <div className="flex items-center gap-2">
        {/* Responsive Controls */}
        <div className="flex items-center gap-1 border rounded-md">
          <Button
            variant={responsive.viewportState.breakpoint === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => responsive.switchBreakpoint('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={responsive.viewportState.breakpoint === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => responsive.switchBreakpoint('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={responsive.viewportState.breakpoint === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => responsive.switchBreakpoint('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <Button variant="ghost" size="sm" disabled={!canUndo} onClick={onUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" disabled={!canRedo} onClick={onRedo}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}