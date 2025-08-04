import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Supplier {
  id: string;
  name: string;
  description?: string;
  brands_sold: string[];
  product_types: string[];
  website?: string;
  phone?: string;
  email?: string;
  address: any;
  rating: number;
  review_count: number;
  specialties: string[];
  certifications: string[];
  logo_url?: string;
  featured_image_url?: string;
  payment_terms?: string;
  minimum_order?: number;
  delivery_info: any;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

const SuppliersManagementTab: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    brands_sold: '',
    product_types: '',
    specialties: '',
    certifications: '',
    payment_terms: '',
    minimum_order: '',
    delivery_info: '',
    address: '',
    is_verified: false,
    is_featured: false,
    status: 'active'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers_directory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fournisseurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      phone: '',
      email: '',
      brands_sold: '',
      product_types: '',
      specialties: '',
      certifications: '',
      payment_terms: '',
      minimum_order: '',
      delivery_info: '',
      address: '',
      is_verified: false,
      is_featured: false,
      status: 'active'
    });
    setEditingSupplier(null);
  };

  const parseJsonField = (value: string, fallback: any = {}) => {
    if (!value || value.trim() === '') return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Invalid JSON:', value);
      return fallback;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supplierData = {
        ...formData,
        brands_sold: formData.brands_sold.split(',').map(s => s.trim()).filter(Boolean),
        product_types: formData.product_types.split(',').map(s => s.trim()).filter(Boolean),
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
        minimum_order: formData.minimum_order ? parseFloat(formData.minimum_order) : null,
        address: parseJsonField(formData.address, {}),
        delivery_info: parseJsonField(formData.delivery_info, {}),
      };

      let error;
      if (editingSupplier) {
        ({ error } = await supabase
          .from('suppliers_directory')
          .update(supplierData)
          .eq('id', editingSupplier.id));
      } else {
        ({ error } = await supabase
          .from('suppliers_directory')
          .insert([supplierData]));
      }

      if (error) throw error;

      toast({
        title: "Succès",
        description: editingSupplier ? "Fournisseur mis à jour" : "Fournisseur créé",
      });

      resetForm();
      setIsCreateDialogOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error('Error saving supplier:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le fournisseur",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      description: supplier.description || '',
      website: supplier.website || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      brands_sold: supplier.brands_sold.join(', '),
      product_types: supplier.product_types.join(', '),
      specialties: supplier.specialties.join(', '),
      certifications: supplier.certifications.join(', '),
      payment_terms: supplier.payment_terms || '',
      minimum_order: supplier.minimum_order?.toString() || '',
      delivery_info: JSON.stringify(supplier.delivery_info),
      address: JSON.stringify(supplier.address),
      is_verified: supplier.is_verified,
      is_featured: supplier.is_featured,
      status: supplier.status
    });
    setEditingSupplier(supplier);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;
    
    try {
      const { error } = await supabase
        .from('suppliers_directory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Fournisseur supprimé",
      });

      fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur",
        variant: "destructive",
      });
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des fournisseurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Fournisseurs</h2>
          <p className="text-muted-foreground">
            Gérez votre annuaire de fournisseurs de pièces détachées
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Modifier le fournisseur' : 'Créer un fournisseur'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations du fournisseur
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brands_sold">Marques vendues (séparées par des virgules)</Label>
                  <Input
                    id="brands_sold"
                    value={formData.brands_sold}
                    onChange={(e) => setFormData({ ...formData, brands_sold: e.target.value })}
                    placeholder="Apple, Samsung, Huawei"
                  />
                </div>
                <div>
                  <Label htmlFor="product_types">Types de produits (séparés par des virgules)</Label>
                  <Input
                    id="product_types"
                    value={formData.product_types}
                    onChange={(e) => setFormData({ ...formData, product_types: e.target.value })}
                    placeholder="Écrans, Batteries, Connecteurs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialties">Spécialités (séparées par des virgules)</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    placeholder="Réparation iPhone, Livraison express"
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications (séparées par des virgules)</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    placeholder="ISO 9001, Certification Apple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_terms">Conditions de paiement</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="30 jours fin de mois"
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_order">Commande minimum (€)</Label>
                  <Input
                    id="minimum_order"
                    type="number"
                    step="0.01"
                    value={formData.minimum_order}
                    onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse (JSON)</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder='{"street": "123 rue Example", "city": "Paris", "postal_code": "75001", "country": "France"}'
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="delivery_info">Informations de livraison (JSON)</Label>
                <Textarea
                  id="delivery_info"
                  value={formData.delivery_info}
                  onChange={(e) => setFormData({ ...formData, delivery_info: e.target.value })}
                  placeholder='{"standard": "24-48h", "express": "Même jour", "zones": ["France"]}'
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  />
                  <span>Vérifié</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span>En vedette</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingSupplier ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{suppliers.length}</div>
            <p className="text-sm text-muted-foreground">Total fournisseurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {suppliers.filter(s => s.is_verified).length}
            </div>
            <p className="text-sm text-muted-foreground">Vérifiés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {suppliers.filter(s => s.is_featured).length}
            </div>
            <p className="text-sm text-muted-foreground">En vedette</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {suppliers.filter(s => s.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {supplier.name}
                    {supplier.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Vérifié
                      </Badge>
                    )}
                    {supplier.is_featured && (
                      <Badge className="text-xs">
                        Vedette
                      </Badge>
                    )}
                  </CardTitle>
                  {renderRating(supplier.rating)}
                  <p className="text-sm text-muted-foreground mt-1">
                    {supplier.review_count} avis
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(supplier)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {supplier.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {supplier.description}
                </p>
              )}
              
              <div className="space-y-2">
                {supplier.brands_sold.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Marques:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {supplier.brands_sold.slice(0, 3).map((brand, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                      {supplier.brands_sold.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.brands_sold.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {supplier.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                </div>

                {supplier.website && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Globe className="h-3 w-3" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Visiter le site
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge 
                    variant={supplier.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {supplier.status === 'active' ? 'Actif' : 
                     supplier.status === 'inactive' ? 'Inactif' : 'En attente'}
                  </Badge>
                  {supplier.minimum_order && (
                    <span className="text-xs text-muted-foreground">
                      Min: {supplier.minimum_order}€
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suppliers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun fournisseur trouvé
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer le premier fournisseur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuppliersManagementTab;