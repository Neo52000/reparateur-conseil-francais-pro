
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Package } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import type { Brand } from '@/types/catalog';

const BrandsManagement = () => {
  const { brands, deviceModels, loading, createBrand, updateBrand, deleteBrand } = useCatalog();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: ''
  });

  const resetForm = () => {
    setFormData({ name: '', logo_url: '' });
    setEditingBrand(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBrand(formData);
      toast({
        title: "Marque créée",
        description: `La marque ${formData.name} a été créée avec succès.`
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la marque.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    
    try {
      await updateBrand(editingBrand.id, formData);
      toast({
        title: "Marque modifiée",
        description: `La marque ${formData.name} a été modifiée avec succès.`
      });
      setIsEditOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la marque.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la marque ${brand.name} ?`)) return;
    
    try {
      await deleteBrand(brand.id);
      toast({
        title: "Marque supprimée",
        description: `La marque ${brand.name} a été supprimée.`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la marque.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url || ''
    });
    setIsEditOpen(true);
  };

  const getModelCount = (brandId: string) => {
    return deviceModels.filter(model => model.brand_id === brandId).length;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Marques d'appareils</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une marque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle marque</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la marque</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo_url">URL du logo (optionnel)</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marque</TableHead>
                <TableHead>Modèles</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {brand.logo_url && (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span>{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Package className="h-3 w-3 mr-1" />
                      {getModelCount(brand.id)} modèles
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(brand.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(brand)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la marque</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Nom de la marque</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_logo_url">URL du logo (optionnel)</Label>
              <Input
                id="edit_logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsManagement;
