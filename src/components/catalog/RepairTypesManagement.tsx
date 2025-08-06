
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import RepairTypesTable from './RepairTypesTable';
import RepairTypeDialog from './RepairTypeDialog';
import type { RepairType } from '@/types/catalog';

const RepairTypesManagement = () => {
  const { 
    repairTypes, 
    repairCategories,
    deviceTypes,
    loading, 
    createRepairType, 
    updateRepairType, 
    deleteRepairType 
  } = useCatalog();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRepairType, setEditingRepairType] = useState<RepairType | null>(null);

  // Grouper les réparations par type d'appareil basé sur la catégorie
  const getDeviceTypeForCategory = (categoryName: string) => {
    const categoryToDeviceType: { [key: string]: string } = {
      'Écran': 'smartphone',
      'Batterie': 'smartphone',
      'Caméra': 'smartphone',
      'Audio': 'smartphone',
      'Connectique': 'smartphone',
      'Boutons': 'smartphone',
      'Carte mère': 'smartphone',
      'Étanchéité': 'smartphone',
      'Coque': 'smartphone',
      'Logiciel': 'smartphone',
      'Manettes': 'console',
      'Ventilation': 'console',
      'Optique': 'console',
      'Alimentation': 'console',
      'Bracelet': 'montre',
      'Capteurs': 'montre',
      'Étanchéité montres': 'montre'
    };
    return categoryToDeviceType[categoryName] || 'smartphone';
  };

  const filteredRepairTypes = repairTypes.filter(repairType => {
    const matchesSearch = repairType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (repairType.description && repairType.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || repairType.category_id === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || repairType.difficulty_level === selectedDifficulty;
    
    // Filtrer par type d'appareil
    if (selectedDeviceType !== 'all') {
      const categoryName = repairType.category?.name || '';
      const deviceType = getDeviceTypeForCategory(categoryName);
      if (deviceType !== selectedDeviceType) return false;
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Grouper les types de réparation par type d'appareil
  const repairTypesByDevice = repairTypes.reduce((acc, repairType) => {
    const categoryName = repairType.category?.name || '';
    const deviceType = getDeviceTypeForCategory(categoryName);
    
    if (!acc[deviceType]) {
      acc[deviceType] = [];
    }
    acc[deviceType].push(repairType);
    return acc;
  }, {} as { [key: string]: RepairType[] });

  const handleEdit = (repairType: RepairType) => {
    setEditingRepairType(repairType);
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

  const handleSave = async (repairTypeData: any) => {
    try {
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
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRepairType(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des types de réparations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestion des types de réparations</h2>
          <p className="text-sm text-gray-600">
            {filteredRepairTypes.length} type{filteredRepairTypes.length > 1 ? 's' : ''} trouvé{filteredRepairTypes.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau type de réparation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un type de réparation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tous les appareils" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les appareils</SelectItem>
            <SelectItem value="smartphone">Smartphone</SelectItem>
            <SelectItem value="console">Console de jeux</SelectItem>
            <SelectItem value="montre">Montre connectée</SelectItem>
          </SelectContent>
        </Select>
        
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

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous ({repairTypes.length})</TabsTrigger>
          <TabsTrigger value="smartphone">
            Smartphone ({repairTypesByDevice.smartphone?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="console">
            Console ({repairTypesByDevice.console?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="montre">
            Montre ({repairTypesByDevice.montre?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <RepairTypesTable
            repairTypes={filteredRepairTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="smartphone" className="mt-6">
          <RepairTypesTable
            repairTypes={repairTypesByDevice.smartphone?.filter(rt => {
              const matchesSearch = rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (rt.description && rt.description.toLowerCase().includes(searchTerm.toLowerCase()));
              const matchesCategory = !selectedCategory || selectedCategory === 'all' || rt.category_id === selectedCategory;
              const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || rt.difficulty_level === selectedDifficulty;
              return matchesSearch && matchesCategory && matchesDifficulty;
            }) || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="console" className="mt-6">
          <RepairTypesTable
            repairTypes={repairTypesByDevice.console?.filter(rt => {
              const matchesSearch = rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (rt.description && rt.description.toLowerCase().includes(searchTerm.toLowerCase()));
              const matchesCategory = !selectedCategory || selectedCategory === 'all' || rt.category_id === selectedCategory;
              const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || rt.difficulty_level === selectedDifficulty;
              return matchesSearch && matchesCategory && matchesDifficulty;
            }) || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="montre" className="mt-6">
          <RepairTypesTable
            repairTypes={repairTypesByDevice.montre?.filter(rt => {
              const matchesSearch = rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (rt.description && rt.description.toLowerCase().includes(searchTerm.toLowerCase()));
              const matchesCategory = !selectedCategory || selectedCategory === 'all' || rt.category_id === selectedCategory;
              const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || rt.difficulty_level === selectedDifficulty;
              return matchesSearch && matchesCategory && matchesDifficulty;
            }) || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <RepairTypeDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        repairType={editingRepairType}
        repairCategories={repairCategories}
      />
    </div>
  );
};

export default RepairTypesManagement;
