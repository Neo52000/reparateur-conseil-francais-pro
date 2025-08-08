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
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { Supplier, SupplierReview } from '@/hooks/useSuppliersDirectory';
import { toast } from 'sonner';

import type { Database } from '@/integrations/supabase/types';
type SupplierInsert = Database['public']['Tables']['suppliers_directory']['Insert'];

export const SuppliersDirectoryManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    brands_sold: '' as string,
    product_types: '' as string,
    status: 'active',
    is_verified: false,
  });
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

  // Helpers & actions
  const parseList = (value: string) => value
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleCreateSubmit = async () => {
    if (!createForm.name.trim()) {
      toast.error('Le nom du fournisseur est requis');
      return;
    }

    const payload: SupplierInsert = {
      name: createForm.name.trim(),
      description: createForm.description || null,
      phone: createForm.phone || null,
      email: createForm.email || null,
      website: createForm.website || null,
      brands_sold: parseList(createForm.brands_sold || ''),
      product_types: parseList(createForm.product_types || ''),
      status: createForm.status,
      is_verified: createForm.is_verified,
      is_featured: false,
      rating: 0,
      review_count: 0,
      specialties: [],
      certifications: [],
      address: {} as any,
      delivery_info: {} as any,
    };

    try {
      setCreating(true);
      const { error } = await supabase
        .from('suppliers_directory')
        .insert(payload);

      if (error) throw error;
      // Rafraîchir la liste pour garantir la visibilité malgré les politiques RLS
      await fetchSuppliers();
      toast.success('Fournisseur ajouté');
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '', description: '', phone: '', email: '', website: '',
        brands_sold: '', product_types: '', status: 'active', is_verified: false
      });
    } catch (e: any) {
      console.error('Create supplier error:', e);
      toast.error(`Impossible d'ajouter le fournisseur: ${e?.message || 'erreur inconnue'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCSVExport = () => {
    const rows = suppliers.map((s) => ({
      name: s.name,
      description: s.description || '',
      phone: s.phone || '',
      email: s.email || '',
      website: s.website || '',
      brands_sold: Array.isArray(s.brands_sold) ? s.brands_sold.join(';') : '',
      product_types: Array.isArray(s.product_types) ? s.product_types.join(';') : '',
      status: s.status,
      is_verified: s.is_verified ? 'true' : 'false',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suppliers_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVTemplate = () => {
    const template = [{
      name: 'Exemple Fournisseur',
      description: 'Fournisseur de pièces détachées',
      phone: '+33 1 23 45 67 89',
      email: 'contact@exemple.com',
      website: 'https://exemple.com',
      brands_sold: 'Apple;Samsung;Xiaomi',
      product_types: 'Ecrans;Batteries;Coques',
      status: 'active',
      is_verified: 'false',
    }];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele_fournisseurs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVImportClick = () => fileInputRef.current?.click();

  const handleCSVFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = (results.data as any[]).filter(Boolean);
          const payloads: SupplierInsert[] = rows.map((r) => ({
            name: (r.name || '').toString().trim(),
            description: (r.description || '').toString().trim() || null,
            phone: (r.phone || '').toString().trim() || null,
            email: (r.email || '').toString().trim() || null,
            website: (r.website || '').toString().trim() || null,
            brands_sold: parseList(r.brands_sold || ''),
            product_types: parseList(r.product_types || ''),
            status: (r.status || 'active').toString().trim(),
            is_verified: String(r.is_verified).toLowerCase() === 'true',
            is_featured: false,
            rating: 0,
            review_count: 0,
            specialties: [],
            certifications: [],
            address: {} as any,
            delivery_info: {} as any,
          }) as SupplierInsert).filter((p) => p.name);

          if (payloads.length === 0) {
            toast.error('Aucune ligne valide dans le CSV');
            return;
          }

          const { data, error } = await supabase
            .from('suppliers_directory')
            .insert(payloads)
            .select('*');

          if (error) throw error;
          setSuppliers((prev) => ([...(data as Supplier[]), ...prev]));
          toast.success(`${payloads.length} fournisseur(s) importé(s)`);
        } catch (err) {
          console.error('CSV import error:', err);
          toast.error('Import CSV échoué');
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingReviews = reviews.filter(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Fournisseurs</p>
                <p className="text-xl font-bold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Verified className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Certifiés</p>
                <p className="text-xl font-bold">{suppliers.filter(s => s.is_verified).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avis Totaux</p>
                <p className="text-xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avis en attente</p>
                <p className="text-xl font-bold">{pendingReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">Gestion Fournisseurs</TabsTrigger>
          <TabsTrigger value="reviews">
            Modération Avis
            {pendingReviews.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6">
          {/* Filtres et actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un fournisseur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleCSVTemplate}>Modèle CSV</Button>
                  <Button variant="outline" onClick={handleCSVExport}>Exporter CSV</Button>
                  <Button variant="outline" onClick={handleCSVImportClick}>Importer CSV</Button>
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFileChange} />
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un fournisseur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des fournisseurs */}
          <div className="grid gap-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {supplier.logo_url ? (
                        <img
                          src={supplier.logo_url}
                          alt={`Logo ${supplier.name}`}
                          className="w-16 h-16 object-contain rounded-lg border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-600">
                            {supplier.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{supplier.name}</h3>
                          {supplier.is_verified && (
                            <Verified className="h-5 w-5 text-blue-500" />
                          )}
                          <Badge 
                            variant={supplier.status === 'active' ? 'default' : 'secondary'}
                          >
                            {supplier.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {supplier.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {supplier.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>{supplier.email}</span>
                            </div>
                          )}
                          {supplier.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              <span>Site web</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {supplier.rating.toFixed(1)} ({supplier.review_count} avis)
                            </span>
                          </div>
                          {supplier.brands_sold.length > 0 && (
                            <span className="text-sm">
                              {supplier.brands_sold.length} marque(s)
                            </span>
                          )}
                        </div>
                      </div>
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
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="space-y-4">
            {pendingReviews.map((review) => {
              const supplier = suppliers.find(s => s.id === review.supplier_id);
              return (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.title}</h4>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Fournisseur : <strong>{supplier?.name}</strong>
                        </p>
                        <p className="text-sm mb-4">{review.content}</p>
                        <p className="text-xs text-muted-foreground">
                          Publié le {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewStatusChange(review.id, 'published')}
                        >
                          Approuver
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReviewStatusChange(review.id, 'rejected')}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {pendingReviews.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun avis en attente de modération</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un fournisseur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Nom du fournisseur" />
              </div>
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input id="website" value={createForm.website} onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+33..." />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="contact@..." />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Présentation du fournisseur" />
              </div>
              <div>
                <Label htmlFor="brands">Marques vendues (séparées par ;)</Label>
                <Input id="brands" value={createForm.brands_sold} onChange={(e) => setCreateForm({ ...createForm, brands_sold: e.target.value })} placeholder="Apple;Samsung;..." />
              </div>
              <div>
                <Label htmlFor="products">Types de produits (séparés par ;)</Label>
                <Input id="products" value={createForm.product_types} onChange={(e) => setCreateForm({ ...createForm, product_types: e.target.value })} placeholder="Écrans;Batteries;..." />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={createForm.status} onValueChange={(v) => setCreateForm({ ...createForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="verified" checked={createForm.is_verified} onCheckedChange={(v) => setCreateForm({ ...createForm, is_verified: Boolean(v) })} />
                <Label htmlFor="verified">Certifié</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateSubmit} disabled={creating}>{creating ? 'Enregistrement…' : 'Enregistrer'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};