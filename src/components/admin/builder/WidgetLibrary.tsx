import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, Filter, Grid, List, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWidgetLibrary } from '@/hooks/useWidgetLibrary';

interface WidgetLibraryProps {
  widgetLibrary: ReturnType<typeof useWidgetLibrary>;
  categoryFilter?: string;
}

interface DraggableWidgetProps {
  widget: any;
  viewMode: 'grid' | 'list';
}

function DraggableWidget({ widget, viewMode }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `library-${widget.id}`,
    data: {
      source: 'library',
      widget: widget
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          flex items-center gap-3 p-3 rounded-lg border border-border 
          bg-card hover:bg-accent cursor-grab active:cursor-grabbing
          transition-colors group
          ${isDragging ? 'opacity-50' : ''}
        `}
      >
        <div className="text-2xl">{widget.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground group-hover:text-accent-foreground">
            {widget.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {widget.description}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {widget.category}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-4 rounded-lg border border-border bg-card hover:bg-accent 
        cursor-grab active:cursor-grabbing transition-colors group
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{widget.icon}</div>
        <h4 className="font-medium text-sm text-foreground group-hover:text-accent-foreground mb-1">
          {widget.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {widget.description}
        </p>
      </div>
    </div>
  );
}

export function WidgetLibrary({ widgetLibrary, categoryFilter }: WidgetLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {
    widgets,
    categories,
    availableTags,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    toggleTag,
    clearFilters
  } = widgetLibrary;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Widgets</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher des widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="space-y-3">
            {/* Categories */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Catégories
              </label>
              <div className="flex flex-wrap gap-1">
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name} ({category.count})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="border-b border-border">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start h-auto p-1">
              {categories.slice(0, 6).map(category => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-xs px-3 py-1.5"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Widget Grid/List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {widgets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                Aucun widget trouvé
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 gap-3'
                : 'space-y-2'
            }>
              {widgets.map(widget => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground text-center">
          {widgets.length} widget{widgets.length !== 1 ? 's' : ''} disponible{widgets.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}