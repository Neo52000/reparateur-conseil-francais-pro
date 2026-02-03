import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfileBuilder } from '@/hooks/useProfileBuilder';
import { useProfileTemplates } from '@/hooks/useProfileTemplates';
import { ProfileWidget, ProfileTheme, ProfileWidgetType, createDefaultWidget } from '@/types/profileBuilder';
import { PlanName } from '@/types/featureFlags';
import ProfileWidgetLibrary from './ProfileWidgetLibrary';
import ProfileCanvas from './ProfileCanvas';
import ProfilePropertyPanel from './ProfilePropertyPanel';
import ProfilePreview from './ProfilePreview';
import AITemplateGenerator from './AITemplateGenerator';
import { Save, Undo2, Redo2, Eye, Settings2, Download, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileBuilderProps {
  templateId?: string;
  onSave?: () => void;
}

type ViewMode = 'edit' | 'preview';

/**
 * Builder principal pour les templates de profils réparateurs
 */
const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ templateId, onSave }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [previewPlan, setPreviewPlan] = useState<PlanName>('Gratuit');
  const [templateName, setTemplateName] = useState('Nouveau template');
  const [isSaving, setIsSaving] = useState(false);

  const { 
    templates, 
    loading: templatesLoading,
    getTemplateById,
    createTemplate,
    updateTemplate,
  } = useProfileTemplates();

  const {
    widgets,
    theme,
    selectedWidgetId,
    selectedWidget,
    isDirty,
    availableWidgetTypes,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    selectWidget,
    updateTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    resetBuilder,
    markAsSaved,
  } = useProfileBuilder();

  // Charger le template si templateId est fourni
  useEffect(() => {
    if (templateId && !templatesLoading) {
      const template = getTemplateById(templateId);
      if (template) {
        resetBuilder(template.widgets, template.theme_data);
        setTemplateName(template.name);
      }
    }
  }, [templateId, templatesLoading, getTemplateById, resetBuilder]);

  // Sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Gestion du drag & drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Si le drag vient de la bibliothèque
    if (active.data.current?.fromLibrary) {
      const widgetType = active.data.current.type as ProfileWidgetType;
      addWidget(widgetType);
      return;
    }

    // Réordonnancement dans le canvas
    if (active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  }, [addWidget, reorderWidgets]);

  // Sauvegarder le template
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (templateId) {
        await updateTemplate(templateId, {
          name: templateName,
          widgets,
          theme_data: theme,
        });
      } else {
        await createTemplate(templateName, '', widgets, theme);
      }
      markAsSaved();
      onSave?.();
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON
  const handleExport = () => {
    const data = {
      name: templateName,
      widgets,
      theme_data: theme,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${templateName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.widgets && Array.isArray(data.widgets)) {
          resetBuilder(data.widgets, data.theme_data || theme);
          if (data.name) setTemplateName(data.name);
        }
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    input.click();
  };

  // Appliquer un template généré par l'IA
  const handleAIGenerate = (newWidgets: ProfileWidget[], newTheme: ProfileTheme) => {
    resetBuilder(newWidgets, newTheme);
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col gap-4">
        {/* Barre d'outils */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Nom du template */}
              <div className="flex items-center gap-3">
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-64 font-medium"
                  placeholder="Nom du template"
                />
                {isDirty && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Non sauvegardé
                  </span>
                )}
              </div>

              {/* Actions centrales */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>

                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList className="h-9">
                    <TabsTrigger value="edit" className="gap-2">
                      <Settings2 className="h-4 w-4" />
                      Édition
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Actions de droite */}
              <div className="flex items-center gap-2">
                <AITemplateGenerator onGenerate={handleAIGenerate} />
                
                <Button variant="outline" size="sm" onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone principale */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {viewMode === 'edit' ? (
            <>
              {/* Bibliothèque de widgets */}
              <div className="col-span-3 min-h-0 overflow-hidden">
                <ProfileWidgetLibrary
                  availableWidgetTypes={availableWidgetTypes}
                  onAddWidget={addWidget}
                />
              </div>

              {/* Canvas central */}
              <div className="col-span-6 min-h-0 overflow-auto">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Canvas</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {widgets.length} widgets
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileCanvas
                      widgets={widgets}
                      theme={theme}
                      selectedWidgetId={selectedWidgetId}
                      previewPlan={previewPlan}
                      onSelectWidget={selectWidget}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Panneau de propriétés */}
              <div className="col-span-3 min-h-0 overflow-hidden">
                <ProfilePropertyPanel
                  selectedWidget={selectedWidget}
                  theme={theme}
                  onUpdateWidget={updateWidget}
                  onUpdateTheme={updateTheme}
                  onRemoveWidget={removeWidget}
                />
              </div>
            </>
          ) : (
            /* Mode prévisualisation */
            <div className="col-span-12 min-h-0">
              <ProfilePreview
                widgets={widgets}
                theme={theme}
                previewPlan={previewPlan}
                onPreviewPlanChange={setPreviewPlan}
              />
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};

export default ProfileBuilder;
