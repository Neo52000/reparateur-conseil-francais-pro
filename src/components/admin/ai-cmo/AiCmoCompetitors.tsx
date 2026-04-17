import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Swords, Globe } from 'lucide-react';
import { AiCmoCompetitor, CompetitorFormData } from './types';

interface AiCmoCompetitorsProps {
  competitors: AiCmoCompetitor[];
  loading: boolean;
  saving: boolean;
  onSave: (items: CompetitorFormData[]) => Promise<void>;
}

const extractHost = (url: string): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return null;
  }
};

const weightLabel = (w: number) => {
  if (w >= 8) return { text: 'Tres fort', tone: 'text-rose-600' };
  if (w >= 5) return { text: 'Moyen', tone: 'text-amber-600' };
  return { text: 'Faible', tone: 'text-emerald-600' };
};

const AiCmoCompetitors: React.FC<AiCmoCompetitorsProps> = ({ competitors, loading, saving, onSave }) => {
  const [items, setItems] = useState<CompetitorFormData[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setItems(
      competitors.map((c) => ({
        id: c.id,
        name: c.name,
        website: c.website || '',
        weight: c.weight,
      }))
    );
    setDirty(false);
  }, [competitors]);

  const handleAdd = () => {
    setItems((prev) => [...prev, { name: '', website: '', weight: 5 }]);
    setDirty(true);
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleChange = (index: number, field: keyof CompetitorFormData, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    setDirty(true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    setDirty(true);
  };

  const handleSave = async () => {
    const valid = items.filter((item) => item.name.trim());
    await onSave(valid);
    setDirty(false);
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
          <h3 className="text-lg font-semibold">Concurrents suivis</h3>
          <p className="text-sm text-muted-foreground">
            Definissez les concurrents a surveiller dans les reponses IA
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
            <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun concurrent defini</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez des concurrents pour comparer votre visibilite IA
            </p>
            <Button variant="outline" className="mt-4" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un concurrent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Liste des concurrents ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => {
              const host = extractHost(item.website);
              const label = weightLabel(item.weight);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col items-center justify-center gap-0.5 pt-6 w-6 shrink-0">
                    <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      aria-label="Monter"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === items.length - 1}
                      aria-label="Descendre"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Nom</Label>
                        <Input
                          placeholder="Nom du concurrent"
                          value={item.name}
                          onChange={(e) => handleChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Site web</Label>
                        <div className="relative">
                          {host ? (
                            <img
                              src={`https://www.google.com/s2/favicons?sz=32&domain=${host}`}
                              alt=""
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          )}
                          <Input
                            type="url"
                            placeholder="https://concurrent.com"
                            value={item.website}
                            onChange={(e) => handleChange(index, 'website', e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Poids strategique</Label>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${label.tone}`}>{label.text}</span>
                          <Badge variant="outline" className="font-mono text-xs min-w-[2rem] justify-center">
                            {item.weight}
                          </Badge>
                        </div>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[item.weight]}
                        onValueChange={(v) => handleChange(index, 'weight', v[0])}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:text-destructive shrink-0 mt-5"
                    onClick={() => handleRemove(index)}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiCmoCompetitors;
