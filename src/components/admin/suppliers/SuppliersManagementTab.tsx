import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Globe, Download, Upload, Search, Filter } from 'lucide-react';
import SupplierForm from './SupplierForm';
import { SuppliersCSVService } from '@/services/suppliers/SuppliersCSVService';
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
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importing, setImporting] = useState(false);
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
    address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'France'
    },
    delivery_info: {
      standard: '',
      express: '',
      zones: [] as string[],
      cost: ''
    },
    is_verified: false,
    is_featured: false,
    status: 'active'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

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

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(search) ||
        supplier.description?.toLowerCase().includes(search) ||
        supplier.brands_sold.some(brand => brand.toLowerCase().includes(search)) ||
        supplier.product_types.some(type => type.toLowerCase().includes(search))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    setFilteredSuppliers(filtered);
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
      address: {
        street: '',
        city: '',
        postal_code: '',
        country: 'France'
      },
      delivery_info: {
        standard: '',
        express: '',
        zones: [],
        cost: ''
      },
      is_verified: false,
      is_featured: false,
      status: 'active'
    });
    setEditingSupplier(null);
  };

  const formatError = (error: any): string => {
    if (!error) return 'Erreur inconnue';
    
    // Si c'est une erreur Supabase
    if (error.message) {
      if (error.code === '23505') {
        return 'Un fournisseur avec ce nom existe déjà';
      }
      if (error.code === '23502') {
        return 'Champs requis manquants';
      }
      if (error.message.includes('duplicate key')) {
        return 'Ce fournisseur existe déjà dans la base de données';
      }
      if (error.message.includes('permission denied')) {
        return 'Permissions insuffisantes pour cette action';
      }
      return error.message;
    }
    
    // Si c'est juste une string
    if (typeof error === 'string') {
      return error;
    }
    
    // Fallback pour autres types d'erreurs
    return error.toString() || 'Erreur inconnue lors de la sauvegarde';
  };

  const validateSupplierData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim() === '') {
      errors.push('Le nom du fournisseur est requis');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Format email invalide');
    }
    
    if (data.website && data.website.trim() && !/^https?:\/\/.+/.test(data.website)) {
      errors.push('URL invalide (doit commencer par http:// ou https://)');
    }
    
    if (data.phone && data.phone.trim() && !/^[\d\s\+\-\(\)\.]+$/.test(data.phone)) {
      errors.push('Format téléphone invalide');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation des données avant envoi
      const validation = validateSupplierData(formData);
      if (!validation.isValid) {
        toast({
          title: "Erreur de validation",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const supplierData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        website: formData.website?.trim() || '',
        brands_sold: formData.brands_sold.split(',').map(s => s.trim()).filter(Boolean),
        product_types: formData.product_types.split(',').map(s => s.trim()).filter(Boolean),
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
        payment_terms: formData.payment_terms?.trim() || '',
        minimum_order: formData.minimum_order ? parseFloat(formData.minimum_order) : null,
        address: {
          street: formData.address?.street?.trim() || '',
          city: formData.address?.city?.trim() || '',
          postal_code: formData.address?.postal_code?.trim() || '',
          country: formData.address?.country?.trim() || 'France'
        },
        delivery_info: {
          standard: formData.delivery_info?.standard?.trim() || '',
          express: formData.delivery_info?.express?.trim() || '',
          zones: Array.isArray(formData.delivery_info?.zones) ? formData.delivery_info.zones : [],
          cost: formData.delivery_info?.cost?.trim() || ''
        },
        is_verified: formData.is_verified || false,
        is_featured: formData.is_featured || false,
        status: formData.status || 'active'
      };

      console.log('💾 Saving supplier data:', supplierData);

      let result;
      if (editingSupplier) {
        result = await supabase
          .from('suppliers_directory')
          .update(supplierData)
          .eq('id', editingSupplier.id)
          .select();
      } else {
        result = await supabase
          .from('suppliers_directory')
          .insert([supplierData])
          .select();
      }

      if (result.error) {
        console.error('❌ Supabase error:', result.error);
        throw result.error;
      }

      console.log('✅ Supplier saved successfully:', result.data);

      toast({
        title: "Succès",
        description: editingSupplier ? "Fournisseur mis à jour" : "Fournisseur créé",
      });

      resetForm();
      setIsCreateDialogOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error('❌ Error saving supplier:', err);
      const errorMessage = formatError(err);
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le fournisseur: ${errorMessage}`,
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
      address: supplier.address || { street: '', city: '', postal_code: '', country: 'France' },
      delivery_info: supplier.delivery_info || { standard: '', express: '', zones: [], cost: '' },
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
      console.error('❌ Error deleting supplier:', err);
      const errorMessage = formatError(err);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le fournisseur: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    SuppliersCSVService.exportToCSV(suppliers, `fournisseurs_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "Export réussi",
      description: `${suppliers.length} fournisseurs exportés`,
    });
  };

  const handleDownloadTemplate = () => {
    SuppliersCSVService.generateTemplate();
    toast({
      title: "Template téléchargé",
      description: "Utilisez ce fichier comme modèle pour importer vos fournisseurs",
    });
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await SuppliersCSVService.parseFile(file);
      
      if (result.success && result.data.length > 0) {
        // Insérer les données dans Supabase
        const { error } = await supabase
          .from('suppliers_directory')
          .insert(result.data);

        if (error) throw error;

        toast({
          title: "Import réussi",
          description: `${result.processed} fournisseurs importés avec succès`,
        });

        fetchSuppliers();
      } else {
        toast({
          title: "Erreur d'import",
          description: result.errors.join('\n'),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Import error:', err);
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les fournisseurs",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Template CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Import...' : 'Importer CSV'}
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Modifier le fournisseur' : 'Créer un fournisseur'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations du fournisseur avec le formulaire structuré
              </DialogDescription>
            </DialogHeader>
            
            <SupplierForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setIsCreateDialogOpen(false)}
              isEditing={!!editingSupplier}
            />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un fournisseur, une marque, un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-input bg-background px-3 py-2 rounded-md text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="pending">En attente</option>
          </select>
        </div>
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
              {filteredSuppliers.length}
            </div>
            <p className="text-sm text-muted-foreground">Affichés</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
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

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {suppliers.length === 0 ? 'Aucun fournisseur trouvé' : 'Aucun résultat pour cette recherche'}
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