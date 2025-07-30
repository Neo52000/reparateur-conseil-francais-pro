import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Search,
  Save,
  X,
  Image
} from 'lucide-react';

interface BrandsManagementProps {
  onStatsUpdate: (count: number) => void;
}

interface EditingBrand {
  id?: string;
  name: string;
  logo_url?: string;
}

const BrandsManagement: React.FC<BrandsManagementProps> = ({ onStatsUpdate }) => {
  const { brands, loading, createBrand, updateBrand, deleteBrand } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingBrand | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    onStatsUpdate(brands.length);
  }, [brands.length, onStatsUpdate]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        await updateBrand(editingItem.id, {
          name: editingItem.name.trim(),
          logo_url: editingItem.logo_url
        });
        toast({
          title: "Succès",
          description: "Marque mise à jour"
        });
      } else {
        // Création
        await createBrand({
          name: editingItem.name.trim(),
          logo_url: editingItem.logo_url
        });
        toast({
          title: "Succès",
          description: "Marque créée"
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
      await deleteBrand(id);
      toast({
        title: "Succès",
        description: "Marque supprimée"
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
    setEditingItem({ name: '', logo_url: '' });
    setIsCreating(true);
  };

  const startEditing = (brand: any) => {
    setEditingItem({
      id: brand.id,
      name: brand.name,
      logo_url: brand.logo_url || ''
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
              <Tag className="h-5 w-5" />
              Marques ({brands.length})
            </CardTitle>
            <Button onClick={startCreating} disabled={isCreating || !!editingItem}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle marque
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Formulaire de création/édition */}
          {(isCreating || editingItem) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {isCreating ? 'Nouvelle marque' : 'Modifier la marque'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={editingItem?.name || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
                        placeholder="ex: Apple"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="logo_url">URL du logo</Label>
                      <Input
                        id="logo_url"
                        value={editingItem?.logo_url || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, logo_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
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

          {/* Liste des marques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchTerm ? 'Aucune marque trouvée' : 'Aucune marque configurée'}
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <Card key={brand.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {brand.logo_url ? (
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <h4 className="font-medium">{brand.name}</h4>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(brand)}
                        disabled={!!editingItem}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(brand.id, brand.name)}
                        disabled={!!editingItem}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandsManagement;