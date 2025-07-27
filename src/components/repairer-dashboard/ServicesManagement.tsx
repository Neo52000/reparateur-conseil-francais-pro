import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useRepairerServices, RepairerService } from '@/hooks/useRepairerServices';
import { Plus, Edit2, Trash2, Clock, Euro } from 'lucide-react';

const ServicesManagement: React.FC = () => {
  const { services, loading, createService, updateService, deleteService, toggleServiceStatus } = useRepairerServices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<RepairerService | null>(null);
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    base_price: '',
    duration_minutes: '60',
    category: 'general',
    is_active: true
  });

  const categories = [
    { value: 'general', label: 'Général' },
    { value: 'screen', label: 'Écran' },
    { value: 'battery', label: 'Batterie' },
    { value: 'camera', label: 'Caméra' },
    { value: 'audio', label: 'Audio' },
    { value: 'charging', label: 'Charge' },
    { value: 'water', label: 'Dégâts des eaux' },
    { value: 'software', label: 'Logiciel' },
    { value: 'other', label: 'Autre' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      service_name: formData.service_name,
      description: formData.description || undefined,
      base_price: formData.base_price ? parseFloat(formData.base_price) : undefined,
      duration_minutes: parseInt(formData.duration_minutes),
      category: formData.category,
      is_active: formData.is_active
    };

    if (editingService) {
      await updateService(editingService.id, serviceData);
    } else {
      await createService(serviceData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      description: '',
      base_price: '',
      duration_minutes: '60',
      category: 'general',
      is_active: true
    });
    setEditingService(null);
  };

  const handleEdit = (service: RepairerService) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description || '',
      base_price: service.base_price?.toString() || '',
      duration_minutes: service.duration_minutes.toString(),
      category: service.category,
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      await deleteService(id);
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestion des Services</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Modifier le service' : 'Nouveau service'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="service_name">Nom du service *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="ex: Réparation écran iPhone 14"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du service..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price">Prix de base (€)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Durée (min)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Service actif</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun service configuré.</p>
            <p className="text-sm">Ajoutez vos premiers services pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{service.service_name}</h3>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(service.category)}
                      </Badge>
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {service.base_price && (
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {service.base_price}€
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.duration_minutes} min
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.is_active}
                      onCheckedChange={(checked) => toggleServiceStatus(service.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesManagement;