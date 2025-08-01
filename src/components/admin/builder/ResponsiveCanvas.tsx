import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useResponsiveBuilder } from '@/hooks/useResponsiveBuilder';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useDragDropAdvanced } from '@/hooks/useDragDropAdvanced';
import { CanvasWidget } from './CanvasWidget';

interface ResponsiveCanvasProps {
  responsive: ReturnType<typeof useResponsiveBuilder>;
  canvas: ReturnType<typeof useCanvasManager>;
  dragDrop: ReturnType<typeof useDragDropAdvanced>;
}

export function ResponsiveCanvas({ responsive, canvas, dragDrop }: ResponsiveCanvasProps) {
  const mainCanvas = dragDrop.dropZones.find(zone => zone.id === 'main-canvas');
  
  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: 'main-canvas',
    data: {
      type: 'canvas',
      accepts: ['dashboard', 'pos', 'plan', 'layout', 'content']
    }
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on empty canvas area
    if (e.target === e.currentTarget) {
      canvas.selectWidget(null);
    }
  };

  const canvasStyle = {
    ...canvas.getCanvasStyle(),
    ...responsive.getCanvasContainerStyles(),
    minHeight: responsive.viewportState.height || '100vh',
    position: 'relative' as const,
    border: isOver ? '2px solid hsl(var(--primary))' : '2px solid transparent',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease'
  };

  const deviceFrameStyle = responsive.getDeviceFrameStyles();

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {responsive.viewportState.breakpoint}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {responsive.viewportState.width} × {responsive.viewportState.height}
          </span>
          {responsive.viewportState.scale !== 1 && (
            <Badge variant="secondary" className="text-xs">
              {Math.round(responsive.viewportState.scale * 100)}%
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {canvas.canvasSettings.gridEnabled && (
            <Badge variant="outline" className="text-xs">
              Grille: {canvas.canvasSettings.gridSize}px
            </Badge>
          )}
          {canvas.canvasSettings.snapToGrid && (
            <Badge variant="secondary" className="text-xs">
              Aimantation
            </Badge>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-center">
          <div style={deviceFrameStyle}>
            <div
              ref={setDroppableRef}
              style={canvasStyle}
              onClick={handleCanvasClick}
              className={`
                relative overflow-hidden
                ${isOver ? 'bg-primary/5' : ''}
                ${!mainCanvas?.widgets.length ? 'bg-gradient-to-br from-muted/40 to-muted/20' : ''}
              `}
            >
              {/* Empty State */}
              {!mainCanvas?.widgets.length && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-20">🎨</div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Canvas vide
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Glissez des widgets depuis la bibliothèque pour commencer à construire votre interface
                    </p>
                  </div>
                </div>
              )}

              {/* Grid Background */}
              {canvas.canvasSettings.gridEnabled && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={canvas.getGridBackgroundStyle()}
                />
              )}

              {/* Widgets */}
              {mainCanvas?.widgets && (
                <SortableContext
                  items={mainCanvas.widgets.map(w => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {mainCanvas.widgets.map(widget => (
                    <CanvasWidget
                      key={widget.id}
                      widget={widget}
                      isSelected={canvas.isWidgetSelected(widget.id)}
                      isHovered={canvas.isWidgetHovered(widget.id)}
                      onSelect={() => canvas.selectWidget(widget.id)}
                      onHover={() => canvas.setHoveredWidget(widget.id)}
                      onHoverEnd={() => canvas.setHoveredWidget(null)}
                      onUpdate={(updates) => dragDrop.updateWidget(widget.id, updates)}
                      onRemove={() => dragDrop.removeWidget(widget.id)}
                      onDuplicate={() => dragDrop.duplicateWidget(widget.id)}
                      canvasSettings={canvas.canvasSettings}
                      responsiveState={responsive.viewportState}
                    />
                  ))}
                </SortableContext>
              )}

              {/* Drop Indicator */}
              {isOver && (
                <div className="absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/10 rounded-lg pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
                      Relâchez pour ajouter le widget
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-background">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{mainCanvas?.widgets.length || 0} widget{(mainCanvas?.widgets.length || 0) !== 1 ? 's' : ''}</span>
          {canvas.isDirty && (
            <Badge variant="outline" className="text-xs">
              Non sauvegardé
            </Badge>
          )}
          {canvas.lastSaved && (
            <span>
              Sauvegardé: {canvas.lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}