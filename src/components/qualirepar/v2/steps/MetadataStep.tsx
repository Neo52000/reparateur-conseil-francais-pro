import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QualiReparDossier, DossierCreationData } from '@/types/qualirepar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FileText, User, Package } from 'lucide-react';

const metadataSchema = z.object({
  clientName: z.string().min(2, 'Le nom du client est requis'),
  clientEmail: z.string().email('Email invalide'),
  clientPhone: z.string().optional(),
  clientAddress: z.string().min(5, 'L\'adresse est requise'),
  clientPostalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  clientCity: z.string().min(2, 'La ville est requise'),
  productCategory: z.string().min(1, 'La catégorie de produit est requise'),
  productBrand: z.string().min(1, 'La marque est requise'),
  productModel: z.string().min(1, 'Le modèle est requis'),
  productSerialNumber: z.string().optional(),
  repairDescription: z.string().min(10, 'Description de la réparation requise'),
  repairCost: z.number().min(15, 'Le coût minimum est de 15€'),
  repairDate: z.string().min(1, 'La date de réparation est requise'),
  requestedBonusAmount: z.number().min(1, 'Le montant du bonus est requis')
});

type MetadataFormData = z.infer<typeof metadataSchema>;

interface MetadataStepProps {
  dossier?: QualiReparDossier | null;
  onComplete: (data: DossierCreationData) => void;
  loading: boolean;
}

const MetadataStep: React.FC<MetadataStepProps> = ({
  dossier,
  onComplete,
  loading
}) => {
  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: dossier ? {
      clientName: `${dossier.client_first_name || ''} ${dossier.client_last_name || ''}`.trim(),
      clientEmail: dossier.client_email,
      clientPhone: dossier.client_phone || '',
      clientAddress: dossier.client_address,
      clientPostalCode: dossier.client_postal_code,
      clientCity: dossier.client_city,
      productCategory: dossier.product_category,
      productBrand: dossier.product_brand,
      productModel: dossier.product_model,
      productSerialNumber: dossier.product_serial_number || '',
      repairDescription: dossier.repair_description,
      repairCost: dossier.repair_cost,
      repairDate: dossier.repair_date,
      requestedBonusAmount: dossier.requested_bonus_amount
    } : {
      repairDate: new Date().toISOString().split('T')[0]
    }
  });

  // Charger le catalogue de produits
  const { data: productCatalog = [] } = useQuery({
    queryKey: ['qualirepar-product-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualirepar_product_catalog')
        .select('*')
        .eq('is_active', true)
        .order('category_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const selectedCategory = form.watch('productCategory');
  const maxBonusForCategory = productCatalog.find(
    cat => cat.category_code === selectedCategory
  )?.max_bonus_amount || 0;

  const onSubmit = (data: MetadataFormData) => {
    onComplete({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      clientPostalCode: data.clientPostalCode,
      clientCity: data.clientCity,
      productCategory: data.productCategory,
      productBrand: data.productBrand,
      productModel: data.productModel,
      productSerialNumber: data.productSerialNumber,
      repairDescription: data.repairDescription,
      repairCost: data.repairCost,
      repairDate: data.repairDate,
      requestedBonusAmount: data.requestedBonusAmount
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Étape 1: Métadonnées du dossier
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Remplissez les informations client et produit pour générer un identifiant de demande
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations client */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold">Informations client</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du client *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="06 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientPostalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal *</FormLabel>
                      <FormControl>
                        <Input placeholder="75001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville *</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse complète *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 rue de la République" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informations produit */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Package className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold">Informations produit</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie de produit *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productCatalog.map((category) => (
                            <SelectItem key={category.category_code} value={category.category_code}>
                              {category.category_name} (max {category.max_bonus_amount}€)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque *</FormLabel>
                      <FormControl>
                        <Input placeholder="Samsung, Apple, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle *</FormLabel>
                      <FormControl>
                        <Input placeholder="Galaxy S21, iPhone 12, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productSerialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de série</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Informations réparation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold">Informations réparation</h3>
              </div>

              <FormField
                control={form.control}
                name="repairDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de la réparation *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez la panne et la réparation effectuée..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="repairCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coût de la réparation (€) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          step="0.01"
                          placeholder="45.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repairDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de réparation *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestedBonusAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus demandé (€) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max={maxBonusForCategory}
                          step="0.01"
                          placeholder={`Max ${maxBonusForCategory}€`}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                      {maxBonusForCategory > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Maximum autorisé pour cette catégorie: {maxBonusForCategory}€
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Initialisation...' : 'Initialiser la demande'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MetadataStep;