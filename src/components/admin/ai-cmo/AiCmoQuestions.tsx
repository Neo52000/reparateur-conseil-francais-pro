import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, Plus, Trash2, MessageSquare } from 'lucide-react';
import { AiCmoQuestion, QuestionFormData, REFRESH_INTERVALS } from './types';

interface AiCmoQuestionsProps {
  questions: AiCmoQuestion[];
  loading: boolean;
  saving: boolean;
  onSave: (items: QuestionFormData[], deletedIds: string[]) => Promise<void>;
}

const AiCmoQuestions: React.FC<AiCmoQuestionsProps> = ({ questions, loading, saving, onSave }) => {
  const [items, setItems] = useState<QuestionFormData[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  // Store original question data for displaying last_run_at / next_run_at
  const [originalQuestions, setOriginalQuestions] = useState<Map<string, AiCmoQuestion>>(new Map());

  useEffect(() => {
    const map = new Map<string, AiCmoQuestion>();
    questions.forEach((q) => map.set(q.id, q));
    setOriginalQuestions(map);

    setItems(
      questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        prompt_type: q.prompt_type,
        target_country: q.target_country || '',
        refresh_interval_seconds: q.refresh_interval_seconds,
        is_active: q.is_active,
      }))
    );
    setDirty(false);
    setDeletedIds([]);
  }, [questions]);

  const handleAdd = () => {
    setItems((prev) => [
      ...prev,
      {
        prompt: '',
        prompt_type: 'product' as const,
        target_country: '',
        refresh_interval_seconds: 86400,
        is_active: false,
      },
    ]);
    setDirty(true);
  };

  const handleRemove = (index: number) => {
    const item = items[index];
    if (item.id) {
      setDeletedIds((prev) => [...prev, item.id!]);
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleChange = (index: number, field: keyof QuestionFormData, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setDirty(true);
  };

  const handleSave = async () => {
    const valid = items.filter((item) => item.prompt.trim());
    await onSave(valid, deletedIds);
    setDirty(false);
    setDeletedIds([]);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Questions de monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Prompts envoyes aux IA pour verifier la visibilite de votre marque
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
              Modifications non sauvegardees
            </Badge>
          )}
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
          <Button onClick={handleSave} disabled={saving || !dirty}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune question de monitoring</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez des prompts pour surveiller votre visibilite dans les IA
            </p>
            <Button variant="outline" className="mt-4" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const original = item.id ? originalQuestions.get(item.id) : null;
            return (
              <Card key={item.id || `new-${index}`}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Prompt</Label>
                        <Textarea
                          placeholder="Ex: Quels sont les meilleurs services de reparation de smartphone en France ?"
                          value={item.prompt}
                          onChange={(e) => handleChange(index, 'prompt', e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={item.prompt_type}
                            onChange={(e) => handleChange(index, 'prompt_type', e.target.value)}
                          >
                            <option value="product">Produit</option>
                            <option value="expertise">Expertise</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Pays cible (ISO)</Label>
                          <Input
                            placeholder="FR"
                            maxLength={2}
                            value={item.target_country}
                            onChange={(e) => handleChange(index, 'target_country', e.target.value.toUpperCase())}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Frequence</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={item.refresh_interval_seconds}
                            onChange={(e) => handleChange(index, 'refresh_interval_seconds', parseInt(e.target.value))}
                          >
                            {REFRESH_INTERVALS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Statut</Label>
                          <div className="flex items-center gap-2 h-10">
                            <Switch
                              checked={item.is_active}
                              onCheckedChange={(checked) => handleChange(index, 'is_active', checked)}
                            />
                            <Badge variant={item.is_active ? 'default' : 'secondary'}>
                              {item.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {original && (
                        <div className="flex gap-6 text-xs text-muted-foreground">
                          <span>Derniere execution : {formatDate(original.last_run_at)}</span>
                          <span>Prochaine execution : {formatDate(original.next_run_at)}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiCmoQuestions;
