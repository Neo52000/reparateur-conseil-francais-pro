import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Truck, Plus, Edit, Mail, Phone, Globe, Trash2 } from 'lucide-react';
import type { SimpleSupplier } from '@/hooks/useSimpleInventory';

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  contact_person: string;
  payment_terms: string;
  notes: string;
}

interface SupplierManagementProps {
  suppliers: SimpleSupplier[];
  onCreateSupplier: (supplier: any) => Promise<void>;
  onUpdateSupplier: (id: string, supplier: any) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
}

export const SupplierManagement: React.FC<SupplierManagementProps> = ({
  suppliers,
  onCreateSupplier,
  onUpdateSupplier,
  onDeleteSupplier
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SimpleSupplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    contact_person: '',
    payment_terms: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      contact_person: '',
      payment_terms: '',
      notes: ''
    });
    setSelectedSupplier(null);
  };

  const openDialog = (supplier?: SimpleSupplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: (supplier as any).website || '',
        address: (supplier as any).address || '',
        contact_person: (supplier as any).contact_person || '',
        payment_terms: (supplier as any).payment_terms || '',
        notes: (supplier as any).notes || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedSupplier) {
        await onUpdateSupplier(selectedSupplier.id, formData);
      } else {
        await onCreateSupplier(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await onDeleteSupplier(id);
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Gestion des fournisseurs
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact principal</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
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
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_terms">Conditions de paiement</Label>
                  <Input
                    id="payment_terms"
                    placeholder="Ex: 30 jours"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name}>
                  {selectedSupplier ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun fournisseur enregistré</p>
            <p className="text-sm mt-1">Ajoutez vos fournisseurs pour faciliter vos commandes</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Coordonnées</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        {(supplier as any).contact_person && (
                          <p className="text-sm text-muted-foreground">{(supplier as any).contact_person}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(supplier as any).website && (
                        <a 
                          href={(supplier as any).website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary hover:underline"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Site web
                        </a>
                      )}
                      {(supplier as any).address && (
                        <p className="text-sm text-muted-foreground mt-1">{(supplier as any).address}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {(supplier as any).payment_terms && (
                        <Badge variant="outline">{(supplier as any).payment_terms}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(supplier)}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
