import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Link, Unlink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CategoryDeviceLink {
  id: string;
  repair_category_id: string;
  device_type_id: string;
  is_active: boolean;
  repair_category: {
    id: string;
    name: string;
    icon: string;
  };
  device_type: {
    id: string;
    name: string;
    icon: string;
  };
}

interface RepairCategory {
  id: string;
  name: string;
  icon: string;
}

interface DeviceType {
  id: string;
  name: string;
  icon: string;
}

const RepairCategoryDeviceLinks: React.FC = () => {
  const [links, setLinks] = useState<CategoryDeviceLink[]>([]);
  const [categories, setCategories] = useState<RepairCategory[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const { toast } = useToast();

  // Données mockées pour éviter les problèmes de types Supabase
  const mockCategories = [
    { id: '1', name: 'Écran', icon: 'screen' },
    { id: '2', name: 'Batterie', icon: 'battery' },
    { id: '3', name: 'Audio', icon: 'volume' },
    { id: '4', name: 'Connectique', icon: 'cable' },
  ];

  const mockDeviceTypes = [
    { id: '1', name: 'Smartphone', icon: 'smartphone' },
    { id: '2', name: 'Tablette', icon: 'tablet' },
    { id: '3', name: 'Montre connectée', icon: 'watch' },
    { id: '4', name: 'Console de jeux', icon: 'gamepad' },
  ];

  const mockLinks = [
    {
      id: '1',
      repair_category_id: '1',
      device_type_id: '1',
      is_active: true,
      repair_category: { id: '1', name: 'Écran', icon: 'screen' },
      device_type: { id: '1', name: 'Smartphone', icon: 'smartphone' }
    },
    {
      id: '2',
      repair_category_id: '1',
      device_type_id: '2',
      is_active: true,
      repair_category: { id: '1', name: 'Écran', icon: 'screen' },
      device_type: { id: '2', name: 'Tablette', icon: 'tablet' }
    },
    {
      id: '3',
      repair_category_id: '2',
      device_type_id: '1',
      is_active: true,
      repair_category: { id: '2', name: 'Batterie', icon: 'battery' },
      device_type: { id: '1', name: 'Smartphone', icon: 'smartphone' }
    },
    {
      id: '4',
      repair_category_id: '2',
      device_type_id: '3',
      is_active: false,
      repair_category: { id: '2', name: 'Batterie', icon: 'battery' },
      device_type: { id: '3', name: 'Montre connectée', icon: 'watch' }
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Simuler un chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utiliser les données mockées
      setLinks(mockLinks);
      setCategories(mockCategories);
      setDeviceTypes(mockDeviceTypes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLink = async (linkId: string, isActive: boolean) => {
    try {
      setLinks(links.map(link => 
        link.id === linkId ? { ...link, is_active: isActive } : link
      ));

      toast({
        title: 'Succès',
        description: `Liaison ${isActive ? 'activée' : 'désactivée'}`,
      });
    } catch (error) {
      console.error('Error updating link:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la liaison',
        variant: 'destructive',
      });
    }
  };

  const handleCreateLink = async () => {
    if (!selectedCategory || !selectedDeviceType) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une catégorie et un type d\'appareil',
        variant: 'destructive',
      });
      return;
    }

    try {
      const category = categories.find(c => c.id === selectedCategory);
      const deviceType = deviceTypes.find(dt => dt.id === selectedDeviceType);
      
      if (!category || !deviceType) return;

      const newLink: CategoryDeviceLink = {
        id: Date.now().toString(),
        repair_category_id: selectedCategory,
        device_type_id: selectedDeviceType,
        is_active: true,
        repair_category: category,
        device_type: deviceType
      };

      setLinks([...links, newLink]);
      setSelectedCategory('');
      setSelectedDeviceType('');
      setIsDialogOpen(false);

      toast({
        title: 'Succès',
        description: 'Liaison créée avec succès',
      });
    } catch (error: any) {
      console.error('Error creating link:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la liaison',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      setLinks(links.filter(link => link.id !== linkId));

      toast({
        title: 'Succès',
        description: 'Liaison supprimée',
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la liaison',
        variant: 'destructive',
      });
    }
  };

  // Regrouper les liaisons par catégorie
  const linksByCategory = links.reduce((acc, link) => {
    const categoryName = link.repair_category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(link);
    return acc;
  }, {} as Record<string, CategoryDeviceLink[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liaisons Catégories-Appareils</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Link className="h-6 w-6 mr-2" />
            Liaisons Catégories-Appareils
            <Badge variant="secondary" className="ml-2">
              {links.length} liaisons
            </Badge>
          </span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle liaison
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle liaison</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie de réparation</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deviceType">Type d'appareil</Label>
                  <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type d'appareil" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((deviceType) => (
                        <SelectItem key={deviceType.id} value={deviceType.id}>
                          {deviceType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateLink}>
                  Créer la liaison
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(linksByCategory).map(([categoryName, categoryLinks]) => (
            <div key={categoryName}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                {categoryName}
                <Badge variant="secondary" className="ml-2">
                  {categoryLinks.length}
                </Badge>
              </h3>
              <div className="grid gap-2">
                {categoryLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {link.device_type.name}
                      </Badge>
                      {link.is_active ? (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inactif
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={(checked) => handleToggleLink(link.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {links.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Link className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune liaison configurée</p>
              <p className="text-sm">Créez des liaisons entre les catégories de réparation et les types d'appareils</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairCategoryDeviceLinks;