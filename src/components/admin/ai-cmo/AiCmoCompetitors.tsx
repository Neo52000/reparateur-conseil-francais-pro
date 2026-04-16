import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Swords } from 'lucide-react';
import { AiCmoCompetitor, CompetitorFormData } from './types';

interface AiCmoCompetitorsProps {
  competitors: AiCmoCompetitor[];
  loading: boolean;
  saving: boolean;
  onSave: (items: CompetitorFormData[]) => Promise<void>;
}

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
    setItems((prev) => [...prev, { name: '', website: '', weight: 1 }]);
    setDirty(true);
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleChange = (index: number, field: keyof CompetitorFormData, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
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
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex-1 space-y-2">
                  <Label>Nom</Label>
                  <Input
                    placeholder="Nom du concurrent"
                    value={item.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Site web</Label>
                  <Input
                    type="url"
                    placeholder="https://concurrent.com"
                    value={item.website}
                    onChange={(e) => handleChange(index, 'website', e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Poids</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={item.weight}
                    onChange={(e) => handleChange(index, 'weight', parseInt(e.target.value))}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === items.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiCmoCompetitors;
