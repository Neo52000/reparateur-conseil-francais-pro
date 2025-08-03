import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Verified,
  AlertTriangle,
  Wand2,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Supplier, SupplierReview } from '@/hooks/useSuppliersDirectory';
import { toast } from 'sonner';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { SupplierFormManager } from './SupplierFormManager';

export const SuppliersDirectoryManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchReviews();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers_directory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers_directory_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleStatusChange = async (supplierId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('suppliers_directory')
        .update({ status: newStatus })
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(suppliers.map(s => 
        s.id === supplierId ? { ...s, status: newStatus } : s
      ));

      toast.success(`Statut mis à jour vers "${newStatus}"`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleVerificationToggle = async (supplierId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('suppliers_directory')
        .update({ is_verified: !isVerified })
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(suppliers.map(s => 
        s.id === supplierId ? { ...s, is_verified: !isVerified } : s
      ));

      toast.success(`Fournisseur ${!isVerified ? 'certifié' : 'non certifié'}`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Erreur lors de la mise à jour de la certification');
    }
  };


  const handleReviewStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('suppliers_directory_reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, status: newStatus } : r
      ));

      toast.success(`Avis ${newStatus === 'published' ? 'publié' : 'rejeté'}`);
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Erreur lors de la mise à jour de l\'avis');
    }
  };

  const handleCreateSupplier = async (formData: any) => {
    try {
      const { error } = await supabase
        .from('suppliers_directory')
        .insert({
          name: formData.name,
          description: formData.description,
          brands_sold: formData.brands.split(',').map((b: string) => b.trim()).filter(Boolean),
          product_types: formData.product_types.split(',').map((p: string) => p.trim()).filter(Boolean),
          website: formData.website,
          phone: formData.phone,
          email: formData.email,
          address: {
            street: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            country: 'France'
          },
          specialties: formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean),
          certifications: formData.certification_labels.split(',').map((c: string) => c.trim()).filter(Boolean),
          logo_url: formData.logo_url,
          payment_terms: formData.payment_terms,
          minimum_order: formData.minimum_order ? Number(formData.minimum_order) : null,
          delivery_info: {
            zones: formData.delivery_zones.split(',').map((z: string) => z.trim()).filter(Boolean),
            time: formData.delivery_times,
            cost: formData.delivery_costs
          },
          rating: 0,
          review_count: 0,
          is_verified: false,
          is_featured: false,
          status: 'pending'
        });

      if (error) throw error;

      await fetchSuppliers();
      setIsCreateModalOpen(false);
      toast.success('Fournisseur créé avec succès');
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Erreur lors de la création du fournisseur');
    }
  };

  const SupplierForm = ({ supplier, onSubmit, onCancel }: {
    supplier?: Supplier | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    return (
      <SupplierFormManager 
        supplier={supplier}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.brands_sold?.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{supplier.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            {supplier.is_verified && (
              <Badge variant="default" className="text-xs">
                <Verified className="w-3 h-3 mr-1" />
                Vérifié
              </Badge>
            )}
            <Badge variant={supplier.status === 'active' ? 'default' : supplier.status === 'pending' ? 'secondary' : 'destructive'}>
              {supplier.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSupplier(supplier);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        {supplier.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {supplier.email}
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {supplier.phone}
          </div>
        )}
        {supplier.website && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {supplier.website}
            </a>
          </div>
        )}
        {supplier.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {supplier.address.street}, {supplier.address.city}
          </div>
        )}
      </div>

      {supplier.description && (
        <p className="text-sm mt-3 line-clamp-2">{supplier.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mt-3">
        {supplier.brands_sold?.slice(0, 3).map((brand, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {brand}
          </Badge>
        ))}
        {supplier.brands_sold && supplier.brands_sold.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{supplier.brands_sold.length - 3}
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">{supplier.rating}/5</span>
          <span className="text-xs text-muted-foreground">({supplier.review_count} avis)</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVerificationToggle(supplier.id, supplier.is_verified)}
          >
            {supplier.is_verified ? 'Retirer certification' : 'Certifier'}
          </Button>
          <Select
            value={supplier.status}
            onValueChange={(value) => handleStatusChange(supplier.id, value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Fournisseurs</h1>
          <p className="text-muted-foreground">
            Gérez l'annuaire des fournisseurs et grossistes
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un fournisseur
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, email ou marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun fournisseur trouvé</p>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
          </DialogHeader>
          <SupplierForm
            onSubmit={handleCreateSupplier}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le fournisseur</DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier}
            onSubmit={(formData) => {
              console.log('Update supplier:', formData);
              setIsEditModalOpen(false);
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersDirectoryManagement;