import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wrench, 
  Search,
  Save,
  X,
  Clock,
  DollarSign
} from 'lucide-react';

interface RepairTypesManagementProps {
  onStatsUpdate: (count: number) => void;
}

interface EditingRepairType {
  id?: string;
  name: string;
  category_id?: string;
  description?: string;
  estimated_time_minutes?: number;
  difficulty_level?: string;
}

const RepairTypesManagement: React.FC<RepairTypesManagementProps> = ({ onStatsUpdate }) => {
  const { repairTypes, repairCategories, loading, createRepairType, updateRepairType, deleteRepairType } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingItem, setEditingItem] = useState<EditingRepairType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    onStatsUpdate(repairTypes.length);
  }, [repairTypes.length, onStatsUpdate]);

  const filteredRepairTypes = repairTypes.filter(repairType => {
    const matchesSearch = repairType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repairType.description && repairType.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || repairType.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return repairCategories.find(cat => cat.id === categoryId)?.name || 'Catégorie inconnue';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      easy: { label: 'Facile', variant: 'default' as const },
      medium: { label: 'Moyen', variant: 'secondary' as const },
      hard: { label: 'Difficile', variant: 'destructive' as const }
    };
    
    const config = variants[difficulty as keyof typeof variants] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSave = async () => {
    if (!editingItem?.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingItem.id) {
        // Mise à jour
        await updateRepairType(editingItem.id, {
          name: editingItem.name.trim(),
          category_id: editingItem.category_id,
          description: editingItem.description,
          estimated_duration_minutes: editingItem.estimated_duration_minutes,
          difficulty_level: editingItem.difficulty_level,
          base_price: editingItem.base_price
        });
        toast({
          title: "Succès",
          description: "Type de réparation mis à jour"
        });
      } else {
        // Création
        await createRepairType({
          name: editingItem.name.trim(),
          category_id: editingItem.category_id,
          description: editingItem.description,
          estimated_duration_minutes: editingItem.estimated_duration_minutes,
          difficulty_level: editingItem.difficulty_level,
          base_price: editingItem.base_price
        });
        toast({
          title: "Succès",
          description: "Type de réparation créé"
        });
        setIsCreating(false);
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) return;

    try {
      await deleteRepairType(id);
      toast({
        title: "Succès",
        description: "Type de réparation supprimé"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet élément",
        variant: "destructive"
      });
    }
  };

  const startCreating = () => {
    setEditingItem({ 
      name: '', 
      category_id: '',
      description: '',
      estimated_duration_minutes: 60,
      difficulty_level: 'medium',
      base_price: 0
    });
    setIsCreating(true);
  };

  const startEditing = (repairType: any) => {
    setEditingItem({
      id: repairType.id,
      name: repairType.name,
      category_id: repairType.category_id || '',
      description: repairType.description || '',
      estimated_duration_minutes: repairType.estimated_duration_minutes || 60,
      difficulty_level: repairType.difficulty_level || 'medium',
      base_price: repairType.base_price || 0
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Types de réparation ({repairTypes.length})
            </CardTitle>
            <Button onClick={startCreating} disabled={isCreating || !!editingItem}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Recherche</Label>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un type de réparation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label>Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {repairCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
            >
              Réinitialiser
            </Button>
          </div>

          {/* Formulaire de création/édition */}
          {(isCreating || editingItem) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {isCreating ? 'Nouveau type de réparation' : 'Modifier le type de réparation'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={editingItem?.name || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
                        placeholder="ex: Remplacement écran"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select 
                        value={editingItem?.category_id || ''} 
                        onValueChange={(value) => setEditingItem(prev => ({ ...prev!, category_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {repairCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulté</Label>
                      <Select 
                        value={editingItem?.difficulty_level || 'medium'} 
                        onValueChange={(value) => setEditingItem(prev => ({ ...prev!, difficulty_level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Facile</SelectItem>
                          <SelectItem value="medium">Moyen</SelectItem>
                          <SelectItem value="hard">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Durée estimée (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={editingItem?.estimated_duration_minutes || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, estimated_duration_minutes: parseInt(e.target.value) || 0 }))}
                        placeholder="60"
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Prix de base (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editingItem?.base_price || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, base_price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingItem?.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
                      placeholder="Description détaillée du type de réparation..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des types de réparation */}
          <div className="space-y-2">
            {filteredRepairTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || selectedCategory 
                  ? 'Aucun type de réparation trouvé avec ces critères' 
                  : 'Aucun type de réparation configuré'}
              </div>
            ) : (
              filteredRepairTypes.map((repairType) => (
                <div key={repairType.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{repairType.name}</h4>
                        {repairType.category && (
                          <Badge variant="secondary">{repairType.category.name}</Badge>
                        )}
                        {repairType.difficulty_level && getDifficultyBadge(repairType.difficulty_level)}
                      </div>
                      {repairType.description && (
                        <p className="text-sm text-muted-foreground mb-2">{repairType.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {repairType.estimated_duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {repairType.estimated_duration_minutes} min
                          </div>
                        )}
                        {repairType.base_price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {repairType.base_price}€
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(repairType)}
                        disabled={!!editingItem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(repairType.id, repairType.name)}
                        disabled={!!editingItem}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairTypesManagement;