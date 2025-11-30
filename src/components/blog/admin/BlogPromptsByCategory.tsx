import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBlogPrompts, BlogPromptTemplate } from '@/hooks/blog/useBlogPrompts';
import { useBlogCategories } from '@/hooks/blog/useBlogCategories';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, Info, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const BlogPromptsByCategory = () => {
  const { loading, fetchPrompts, savePrompt, deletePrompt } = useBlogPrompts();
  const { fetchCategories } = useBlogCategories();
  const [prompts, setPrompts] = useState<BlogPromptTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    prompt_template: '',
    ai_model: 'google/gemini-2.5-flash',
    visibility: 'public',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [promptsData, categoriesData] = await Promise.all([
      fetchPrompts(),
      fetchCategories()
    ]);
    setPrompts(promptsData);
    setCategories(categoriesData);
  };

  const handleEdit = (prompt: BlogPromptTemplate) => {
    setEditingId(prompt.id);
    setFormData({
      name: prompt.name,
      category_id: prompt.category_id || '',
      prompt_template: prompt.prompt_template,
      ai_model: prompt.ai_model || 'google/gemini-2.5-flash',
      visibility: prompt.visibility,
      is_active: prompt.is_active
    });
  };

  const handleSave = async () => {
    const success = await savePrompt({
      ...(editingId ? { id: editingId } : {}),
      ...formData,
      category_id: formData.category_id || null
    });

    if (success) {
      setEditingId(null);
      setFormData({
        name: '',
        category_id: '',
        prompt_template: '',
        ai_model: 'google/gemini-2.5-flash',
        visibility: 'public',
        is_active: true
      });
      await loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce prompt ?')) {
      const success = await deletePrompt(id);
      if (success) {
        await loadData();
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category_id: '',
      prompt_template: '',
      ai_model: 'google/gemini-2.5-flash',
      visibility: 'public',
      is_active: true
    });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Tous les articles';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Catégorie inconnue';
  };

  const isEditing = editingId !== null;

  return (
    <div className="space-y-6">
      {/* Help Section */}
      <Collapsible open={showHelp} onOpenChange={setShowHelp}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
            Variables disponibles dans les prompts
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2 text-sm">
              <p><strong>Variables dynamiques :</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li><code>{'{categorie}'}</code> - Nom de la catégorie</li>
                <li><code>{'{date}'}</code> - Date de publication</li>
                <li><code>{'{saison}'}</code> - Saison actuelle (printemps, été, automne, hiver)</li>
                <li><code>{'{ton}'}</code> - Ton configuré (professionnel, casual, technique)</li>
                <li><code>{'{longueur}'}</code> - Longueur cible en mots</li>
              </ul>
              <p className="pt-2 text-muted-foreground">
                Exemple : "Rédige un article sur {'{categorie}'} en tenant compte de la saison {'{saison}'}..."
              </p>
            </AlertDescription>
          </Alert>
        </CollapsibleContent>
      </Collapsible>

      {/* Form Card */}
      {isEditing && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {editingId ? 'Modifier le prompt' : 'Nouveau prompt'}
            </CardTitle>
            <CardDescription>
              Créez un prompt personnalisé pour générer des articles de qualité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du prompt</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Article technique printemps"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie associée</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les articles</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai_model">Modèle IA</Label>
              <Select
                value={formData.ai_model}
                onValueChange={(value) => setFormData({ ...formData, ai_model: value })}
              >
                <SelectTrigger id="ai_model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recommandé)</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Template du prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt_template}
                onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                placeholder="Rédige un article de blog professionnel sur {categorie}..."
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Utilisez les variables comme {'{categorie}'}, {'{saison}'}, {'{ton}'} pour personnaliser le prompt
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Actif
                </Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading || !formData.name || !formData.prompt_template}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!isEditing && (
        <Button onClick={() => setEditingId('new')} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Créer un nouveau prompt
        </Button>
      )}

      {/* Prompts List */}
      <div className="space-y-4">
        {prompts.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Aucun prompt configuré. Créez votre premier prompt pour automatiser la génération d'articles par catégorie.
            </AlertDescription>
          </Alert>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id} className={!prompt.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                    <CardDescription>
                      Catégorie: <strong>{getCategoryName(prompt.category_id)}</strong>
                      {' • '}
                      Modèle: <strong>{prompt.ai_model || 'Non défini'}</strong>
                      {!prompt.is_active && ' • ⚠️ Inactif'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {prompt.prompt_template}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
