import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Store, 
  Palette, 
  Shield, 
  Truck,
  CreditCard,
  Mail,
  Globe,
  Upload
} from 'lucide-react';

export const StoreSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [storeSettings, setStoreSettings] = useState({
    // Informations générales
    storeName: '',
    storeDescription: '',
    storeUrl: '',
    contactEmail: '',
    contactPhone: '',
    
    // Apparence
    theme: 'default',
    primaryColor: '#3b82f6',
    logoUrl: '',
    
    // Livraison
    deliveryEnabled: true,
    deliveryPrice: 0,
    freeDeliveryThreshold: 50,
    deliveryTime: '3-5',
    
    // Paiement
    paymentMethods: {
      card: true,
      paypal: false,
      transfer: false
    },
    
    // Notifications
    emailNotifications: {
      newOrders: true,
      lowStock: true,
      customerMessages: true
    },
    
    // SEO
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  });

  const handleSave = async () => {
    // Ici vous implémenteriez la sauvegarde des paramètres
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos paramètres de boutique ont été mis à jour avec succès"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Paramètres de la boutique
        </h2>
        <p className="text-muted-foreground">
          Configurez l'apparence et les fonctionnalités de votre boutique
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Livraison</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Paiement</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Nom de la boutique</Label>
                <Input
                  id="storeName"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Ma Boutique de Réparation"
                />
              </div>
              
              <div>
                <Label htmlFor="storeDescription">Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
                  placeholder="Spécialiste en réparation de smartphones et ordinateurs..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={storeSettings.contactEmail}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@maboutique.fr"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    value={storeSettings.contactPhone}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation visuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Thème</Label>
                <Select value={storeSettings.theme} onValueChange={(value) => setStoreSettings(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Par défaut</SelectItem>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="minimal">Minimaliste</SelectItem>
                    <SelectItem value="classic">Classique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="primaryColor">Couleur principale</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={storeSettings.primaryColor}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    value={storeSettings.primaryColor}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="logo">Logo de la boutique</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    value={storeSettings.logoUrl}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="URL de votre logo"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Options de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Livraison activée</Label>
                  <p className="text-sm text-muted-foreground">Proposer la livraison à vos clients</p>
                </div>
                <Switch
                  checked={storeSettings.deliveryEnabled}
                  onCheckedChange={(checked) => setStoreSettings(prev => ({ ...prev, deliveryEnabled: checked }))}
                />
              </div>
              
              {storeSettings.deliveryEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryPrice">Prix de livraison (€)</Label>
                      <Input
                        id="deliveryPrice"
                        type="number"
                        step="0.01"
                        value={storeSettings.deliveryPrice}
                        onChange={(e) => setStoreSettings(prev => ({ ...prev, deliveryPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="freeDeliveryThreshold">Livraison gratuite à partir de (€)</Label>
                      <Input
                        id="freeDeliveryThreshold"
                        type="number"
                        step="0.01"
                        value={storeSettings.freeDeliveryThreshold}
                        onChange={(e) => setStoreSettings(prev => ({ ...prev, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="deliveryTime">Délai de livraison</Label>
                    <Select value={storeSettings.deliveryTime} onValueChange={(value) => setStoreSettings(prev => ({ ...prev, deliveryTime: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 jours ouvrés</SelectItem>
                        <SelectItem value="3-5">3-5 jours ouvrés</SelectItem>
                        <SelectItem value="5-7">5-7 jours ouvrés</SelectItem>
                        <SelectItem value="7-10">7-10 jours ouvrés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Carte bancaire</Label>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                  <Switch
                    checked={storeSettings.paymentMethods.card}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, card: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PayPal</Label>
                    <p className="text-sm text-muted-foreground">Paiement via PayPal</p>
                  </div>
                  <Switch
                    checked={storeSettings.paymentMethods.paypal}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, paypal: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Virement bancaire</Label>
                    <p className="text-sm text-muted-foreground">Paiement par virement</p>
                  </div>
                  <Switch
                    checked={storeSettings.paymentMethods.transfer}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      paymentMethods: { ...prev.paymentMethods, transfer: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications par email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nouvelles commandes</Label>
                    <p className="text-sm text-muted-foreground">Recevoir un email pour chaque nouvelle commande</p>
                  </div>
                  <Switch
                    checked={storeSettings.emailNotifications.newOrders}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      emailNotifications: { ...prev.emailNotifications, newOrders: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock faible</Label>
                    <p className="text-sm text-muted-foreground">Alerte quand un produit est en rupture de stock</p>
                  </div>
                  <Switch
                    checked={storeSettings.emailNotifications.lowStock}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      emailNotifications: { ...prev.emailNotifications, lowStock: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Messages clients</Label>
                    <p className="text-sm text-muted-foreground">Notification pour les messages des clients</p>
                  </div>
                  <Switch
                    checked={storeSettings.emailNotifications.customerMessages}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      emailNotifications: { ...prev.emailNotifications, customerMessages: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Référencement (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Titre de la page (meta title)</Label>
                <Input
                  id="metaTitle"
                  value={storeSettings.metaTitle}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Réparation smartphone et ordinateur - Ma Boutique"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommandé : 50-60 caractères</p>
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Description (meta description)</Label>
                <Textarea
                  id="metaDescription"
                  value={storeSettings.metaDescription}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Spécialiste en réparation de smartphones et ordinateurs. Service rapide, garantie, pièces d'origine."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">Recommandé : 150-160 caractères</p>
              </div>
              
              <div>
                <Label htmlFor="keywords">Mots-clés</Label>
                <Input
                  id="keywords"
                  value={storeSettings.keywords}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="réparation smartphone, écran cassé, batterie, SAV"
                />
                <p className="text-xs text-muted-foreground mt-1">Séparez les mots-clés par des virgules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
};