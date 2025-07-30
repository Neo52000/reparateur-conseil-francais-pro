import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import type { RepairType } from '@/types/catalog';

interface RepairTypesManagementProps {
  onStatsUpdate?: (count: number) => void;
}

interface EditingRepairType {
  name: string;
  description: string;
  difficulty_level: string;
  estimated_time_minutes: number;
  warranty_days: number;
  category_id: string;
  is_active: boolean;
}

const RepairTypesManagement: React.FC<RepairTypesManagementProps> = ({ onStatsUpdate }) => {
  const { 
    repairTypes, 
    repairCategories,
    loading, 
    createRepairType, 
    updateRepairType, 
    deleteRepairType 
  } = useCatalog();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRepairType, setEditingRepairType] = useState<RepairType | null>(null);
  const [formData, setFormData] = useState<EditingRepairType>({
    name: '',
    description: '',
    difficulty_level: 'Facile',
    estimated_time_minutes: 0,
    warranty_days: 180,
    category_id: '',
    is_active: true
  });

  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(repairTypes.length);
    }
  }, [repairTypes.length, onStatsUpdate]);

  const filteredRepairTypes = repairTypes.filter(repairType => {
    const matchesSearch = repairType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (repairType.description && repairType.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || repairType.category_id === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || repairType.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleEdit = (repairType: RepairType) => {
    setEditingRepairType(repairType);
    setFormData({
      name: repairType.name,
      description: repairType.description || '',
      difficulty_level: repairType.difficulty_level,
      estimated_time_minutes: repairType.estimated_time_minutes || 0,
      warranty_days: repairType.warranty_days,
      category_id: repairType.category_id,
      is_active: repairType.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de réparation ?')) {
      try {
        await deleteRepairType(id);
        toast({
          title: 'Type de réparation supprimé',
          description: 'Le type de réparation a été supprimé avec succès.',
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le type de réparation.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      const repairTypeData = {
        name: formData.name,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        estimated_time_minutes: formData.estimated_time_minutes,
        warranty_days: formData.warranty_days,
        category_id: formData.category_id,
        is_active: formData.is_active
      };

      if (editingRepairType) {
        await updateRepairType(editingRepairType.id, repairTypeData);
        toast({
          title: 'Type de réparation mis à jour',
          description: 'Le type de réparation a été mis à jour avec succès.',
        });
      } else {
        await createRepairType(repairTypeData);
        toast({
          title: 'Type de réparation créé',
          description: 'Le nouveau type de réparation a été créé avec succès.',
        });
      }
      setIsDialogOpen(false);
      setEditingRepairType(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty_level: 'Facile',
      estimated_time_minutes: 0,
      warranty_days: 180,
      category_id: '',
      is_active: true
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRepairType(null);
    resetForm();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des types de réparation...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestion des types de réparation</h2>
          <p className="text-sm text-muted-foreground">
            {filteredRepairTypes.length} type{filteredRepairTypes.length > 1 ? 's' : ''} trouvé{filteredRepairTypes.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau type
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un type de réparation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {repairCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les difficultés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les difficultés</SelectItem>
            <SelectItem value="Facile">Facile</SelectItem>
            <SelectItem value="Moyen">Moyen</SelectItem>
            <SelectItem value="Difficile">Difficile</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Types de réparation</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Temps estimé</TableHead>
                <TableHead>Garantie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepairTypes.map((repairType) => (
                <TableRow key={repairType.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{repairType.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {repairType.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {repairType.category?.name || 'Non définie'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{repairType.difficulty_level}</Badge>
                  </TableCell>
                  <TableCell>{repairType.estimated_time_minutes || 0} min</TableCell>
                  <TableCell className="font-medium">{repairType.warranty_days} jours</TableCell>
                  <TableCell>
                    <Badge variant={repairType.is_active ? "default" : "secondary"}>
                      {repairType.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(repairType)} 
                        aria-label={`Modifier ${repairType.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(repairType.id)}
                        aria-label={`Supprimer ${repairType.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRepairTypes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun type de réparation trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>
                {editingRepairType ? 'Modifier le type de réparation' : 'Nouveau type de réparation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Remplacement écran"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description détaillée de la réparation"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({...formData, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {repairCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Difficulté</label>
                <Select 
                  value={formData.difficulty_level} 
                  onValueChange={(value) => setFormData({...formData, difficulty_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facile">Facile</SelectItem>
                    <SelectItem value="Moyen">Moyen</SelectItem>
                    <SelectItem value="Difficile">Difficile</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Temps estimé (minutes)</label>
                <Input
                  type="number"
                  value={formData.estimated_time_minutes}
                  onChange={(e) => setFormData({...formData, estimated_time_minutes: parseInt(e.target.value) || 0})}
                  placeholder="60"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Garantie (jours)</label>
                <Input
                  type="number"
                  value={formData.warranty_days}
                  onChange={(e) => setFormData({...formData, warranty_days: parseInt(e.target.value) || 180})}
                  placeholder="180"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Type actif
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {editingRepairType ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RepairTypesManagement;