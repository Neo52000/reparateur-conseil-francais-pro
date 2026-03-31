import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Grip,
  Plus,
  Copy,
  Trash2,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Layout,
  Grid,
  Layers
} from 'lucide-react';
import { useDragAndDropBuilder, DragDropItem, DragDropContainer } from '@/hooks/useDragAndDropBuilder';

interface WidgetType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
  defaultConfig: any;
  component: React.ComponentType<any>;
}

interface DragDropBuilderProps {
  widgets: WidgetType[];
  onSave?: (layout: any) => void;
  onPreview?: (layout: any) => void;
  initialLayout?: any;
}

function SortableItem({
  item,
  containerId,
  index,
  isPreviewMode,
  isSelected,
  onSelect,
  onDuplicate,
  onRemove,
}: {
  item: DragDropItem;
  containerId: string;
  index: number;
  isPreviewMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { containerId, index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${item.size.width}`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
      {...attributes}
    >
      <div className="bg-card border rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">
            {item.content.title || 'Widget'}
          </h4>

          {!isPreviewMode && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div {...listeners} className="cursor-grab">
                <Grip className="h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Type: {item.type}
        </div>
      </div>
    </div>
  );
}

const DragDropBuilder: React.FC<DragDropBuilderProps> = ({
  widgets,
  onSave,
  onPreview,
  initialLayout
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    containers,
    selectedItem,
    setSelectedItem,
    addContainer,
    removeContainer,
    addItem,
    updateItem,
    removeItem,
    handleDragEnd,
    duplicateItem,
    exportLayout,
    importLayout
  } = useDragAndDropBuilder({
    onLayoutChange: (containers) => {
      onPreview?.(containers);
    }
  });

  React.useEffect(() => {
    if (initialLayout) {
      importLayout(initialLayout);
    } else {
      addContainer({
        name: 'Zone principale',
        items: [],
        layout: 'grid',
        columns: 12,
        gap: 4
      });
    }
  }, [initialLayout, addContainer, importLayout]);

  const getDeviceClasses = () => {
    switch (device) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const addWidgetToContainer = (containerId: string, widgetType: WidgetType) => {
    addItem(containerId, {
      type: widgetType.id,
      content: {
        ...widgetType.defaultConfig,
        title: widgetType.name
      },
      position: { x: 0, y: 0 },
      size: { width: 6, height: 4 },
      style: {}
    });
  };

  const handleSave = () => {
    const layout = exportLayout();
    onSave?.(layout);
  };

  const widgetsByCategory = widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetType[]>);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-background">
        {/* Panel des widgets */}
        {!isPreviewMode && (
          <div className="w-80 bg-card border-r flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Bibliothèque de widgets
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryWidgets.map((widget) => (
                        <div
                          key={widget.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => {
                            if (containers.length > 0) {
                              addWidgetToContainer(containers[0].id, widget);
                            }
                          }}
                        >
                          <div className="text-center">
                            <widget.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <p className="text-xs font-medium">{widget.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Zone principale */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Builder Interface</h2>

              {/* Sélecteur d'appareil */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setDevice('desktop')}
                  className="p-2"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={device === 'tablet' ? 'default' : 'ghost'}
                  onClick={() => setDevice('tablet')}
                  className="p-2"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setDevice('mobile')}
                  className="p-2"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? 'Éditer' : 'Aperçu'}
              </Button>
              <Button onClick={handleSave}>
                Sauvegarder
              </Button>
            </div>
          </div>

          {/* Zone de construction */}
          <div className="flex-1 p-6 overflow-auto">
            <div className={getDeviceClasses()}>
              <div className="space-y-6">
                {containers.map((container) => (
                  <Card key={container.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          {container.name}
                          <Badge variant="outline" className="text-xs">
                            {container.items.length} éléments
                          </Badge>
                        </CardTitle>

                        {!isPreviewMode && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const widget = widgets[0];
                                if (widget) addWidgetToContainer(container.id, widget);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeContainer(container.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <SortableContext
                        items={container.items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div
                          className={`grid gap-4 min-h-[200px] p-4 rounded-lg border-2 border-dashed border-muted ${
                            container.layout === 'grid'
                              ? `grid-cols-${Math.min(container.columns || 12, 12)}`
                              : 'flex flex-wrap'
                          }`}
                        >
                          {container.items.map((item, index) => (
                            <SortableItem
                              key={item.id}
                              item={item}
                              containerId={container.id}
                              index={index}
                              isPreviewMode={isPreviewMode}
                              isSelected={selectedItem?.id === item.id}
                              onSelect={() => setSelectedItem(item)}
                              onDuplicate={() => duplicateItem(item.id)}
                              onRemove={() => removeItem(item.id)}
                            />
                          ))}

                          {container.items.length === 0 && (
                            <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
                              <div className="text-center">
                                <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Glissez des widgets ici</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel des propriétés */}
        {!isPreviewMode && selectedItem && (
          <div className="w-80 bg-card border-l flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Propriétés
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Titre</label>
                  <input
                    type="text"
                    value={selectedItem.content.title || ''}
                    onChange={(e) => updateItem(selectedItem.id, {
                      content: { ...selectedItem.content, title: e.target.value }
                    })}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Largeur (colonnes)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={selectedItem.size.width}
                    onChange={(e) => updateItem(selectedItem.id, {
                      size: { ...selectedItem.size, width: Number(e.target.value) }
                    })}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Hauteur</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedItem.size.height}
                    onChange={(e) => updateItem(selectedItem.id, {
                      size: { ...selectedItem.size, height: Number(e.target.value) }
                    })}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default DragDropBuilder;
