import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Printer, 
  CreditCard, 
  Receipt, 
  Monitor,
  Wifi,
  Shield,
  Bell,
  Database,
  Key,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

const POSSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    general: {
      storeName: 'PhoneRepair Pro',
      storeAddress: '123 Rue de la Réparation, 75001 Paris',
      storePhone: '01 23 45 67 89',
      storeEmail: 'contact@phonerepairpro.fr',
      taxRate: 20,
      currency: 'EUR',
      timezone: 'Europe/Paris'
    },
    pos: {
      autoOpenDrawer: true,
      printReceipts: true,
      requireSignature: false,
      enableBarcode: true,
      offlineMode: true,
      sessionTimeout: 8,
      quickSaleEnabled: true,
      loyaltyProgram: true
    },
    printer: {
      printerName: 'EPSON TM-T20II',
      paperSize: '80mm',
      printLogo: true,
      footerText: 'Merci de votre visite !',
      copies: 1,
      cutPaper: true
    },
    payments: {
      cash: true,
      card: true,
      mobile: true,
      crypto: false,
      bankTransfer: false,
      check: true,
      minCardAmount: 5.00,
      tipEnabled: false
    },
    security: {
      requirePinForVoids: true,
      requirePinForDiscounts: true,
      maxDiscountPercent: 20,
      auditLogs: true,
      dataBackup: true,
      encryptData: true
    },
    notifications: {
      lowStock: true,
      newOrders: true,
      paymentFailed: true,
      systemUpdates: false,
      emailAlerts: true,
      smsAlerts: false
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    // Logique de sauvegarde
    toast.success('Paramètres sauvegardés avec succès');
  };

  const resetToDefaults = () => {
    // Logique de réinitialisation
    toast.info('Paramètres réinitialisés aux valeurs par défaut');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuration POS
          </h2>
          <p className="text-muted-foreground">
            Configurez votre point de vente selon vos besoins
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Réinitialiser
          </Button>
          <Button onClick={saveSettings} className="bg-admin-green hover:bg-admin-green/90">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="pos">POS</TabsTrigger>
          <TabsTrigger value="printer">Imprimante</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Informations du Magasin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nom du magasin</Label>
                  <Input
                    id="storeName"
                    value={settings.general.storeName}
                    onChange={(e) => updateSetting('general', 'storeName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Téléphone</Label>
                  <Input
                    id="storePhone"
                    value={settings.general.storePhone}
                    onChange={(e) => updateSetting('general', 'storePhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.general.storeEmail}
                    onChange={(e) => updateSetting('general', 'storeEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.general.taxRate}
                    onChange={(e) => updateSetting('general', 'taxRate', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Adresse</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.general.storeAddress}
                  onChange={(e) => updateSetting('general', 'storeAddress', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={settings.general.currency} onValueChange={(value) => updateSetting('general', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar ($)</SelectItem>
                      <SelectItem value="GBP">Livre (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres POS */}
        <TabsContent value="pos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Configuration du Point de Vente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ouverture automatique du tiroir</Label>
                      <p className="text-sm text-muted-foreground">Ouvrir le tiroir-caisse automatiquement</p>
                    </div>
                    <Switch
                      checked={settings.pos.autoOpenDrawer}
                      onCheckedChange={(checked) => updateSetting('pos', 'autoOpenDrawer', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Impression automatique des reçus</Label>
                      <p className="text-sm text-muted-foreground">Imprimer les reçus automatiquement</p>
                    </div>
                    <Switch
                      checked={settings.pos.printReceipts}
                      onCheckedChange={(checked) => updateSetting('pos', 'printReceipts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Signature requise</Label>
                      <p className="text-sm text-muted-foreground">Demander une signature pour les paiements</p>
                    </div>
                    <Switch
                      checked={settings.pos.requireSignature}
                      onCheckedChange={(checked) => updateSetting('pos', 'requireSignature', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Scanner de codes-barres</Label>
                      <p className="text-sm text-muted-foreground">Activer le scanner de codes-barres</p>
                    </div>
                    <Switch
                      checked={settings.pos.enableBarcode}
                      onCheckedChange={(checked) => updateSetting('pos', 'enableBarcode', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode hors ligne</Label>
                      <p className="text-sm text-muted-foreground">Permettre les ventes hors ligne</p>
                    </div>
                    <Switch
                      checked={settings.pos.offlineMode}
                      onCheckedChange={(checked) => updateSetting('pos', 'offlineMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Vente rapide</Label>
                      <p className="text-sm text-muted-foreground">Activer le mode vente rapide</p>
                    </div>
                    <Switch
                      checked={settings.pos.quickSaleEnabled}
                      onCheckedChange={(checked) => updateSetting('pos', 'quickSaleEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Programme de fidélité</Label>
                      <p className="text-sm text-muted-foreground">Activer le système de points</p>
                    </div>
                    <Switch
                      checked={settings.pos.loyaltyProgram}
                      onCheckedChange={(checked) => updateSetting('pos', 'loyaltyProgram', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout session (heures)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={settings.pos.sessionTimeout}
                      onChange={(e) => updateSetting('pos', 'sessionTimeout', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres imprimante */}
        <TabsContent value="printer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Configuration Imprimante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imprimante sélectionnée</Label>
                  <Select value={settings.printer.printerName} onValueChange={(value) => updateSetting('printer', 'printerName', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EPSON TM-T20II">EPSON TM-T20II</SelectItem>
                      <SelectItem value="Star TSP143">Star TSP143</SelectItem>
                      <SelectItem value="Brother TD-4000">Brother TD-4000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Taille du papier</Label>
                  <Select value={settings.printer.paperSize} onValueChange={(value) => updateSetting('printer', 'paperSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="A4">A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre de copies</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={settings.printer.copies}
                    onChange={(e) => updateSetting('printer', 'copies', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texte de pied de page</Label>
                <Input
                  value={settings.printer.footerText}
                  onChange={(e) => updateSetting('printer', 'footerText', e.target.value)}
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.printer.printLogo}
                    onCheckedChange={(checked) => updateSetting('printer', 'printLogo', checked)}
                  />
                  <Label>Imprimer le logo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.printer.cutPaper}
                    onCheckedChange={(checked) => updateSetting('printer', 'cutPaper', checked)}
                  />
                  <Label>Coupe automatique</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres paiements */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Méthodes de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Méthodes acceptées</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'cash', label: 'Espèces', icon: '💰' },
                      { key: 'card', label: 'Carte bancaire', icon: '💳' },
                      { key: 'mobile', label: 'Paiement mobile', icon: '📱' },
                      { key: 'crypto', label: 'Cryptomonnaie', icon: '₿' },
                      { key: 'bankTransfer', label: 'Virement', icon: '🏦' },
                      { key: 'check', label: 'Chèque', icon: '📝' }
                    ].map(method => (
                      <div key={method.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          <Label>{method.label}</Label>
                        </div>
                        <Switch
                          checked={settings.payments[method.key as keyof typeof settings.payments] as boolean}
                          onCheckedChange={(checked) => updateSetting('payments', method.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Options de paiement</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Montant minimum carte (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.payments.minCardAmount}
                        onChange={(e) => updateSetting('payments', 'minCardAmount', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Pourboires activés</Label>
                        <p className="text-sm text-muted-foreground">Permettre les pourboires</p>
                      </div>
                      <Switch
                        checked={settings.payments.tipEnabled}
                        onCheckedChange={(checked) => updateSetting('payments', 'tipEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres sécurité */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité & Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Contrôles d'accès</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>PIN pour annulations</Label>
                        <p className="text-sm text-muted-foreground">Demander un PIN pour annuler une vente</p>
                      </div>
                      <Switch
                        checked={settings.security.requirePinForVoids}
                        onCheckedChange={(checked) => updateSetting('security', 'requirePinForVoids', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>PIN pour remises</Label>
                        <p className="text-sm text-muted-foreground">Demander un PIN pour les remises</p>
                      </div>
                      <Switch
                        checked={settings.security.requirePinForDiscounts}
                        onCheckedChange={(checked) => updateSetting('security', 'requirePinForDiscounts', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Remise maximum (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.security.maxDiscountPercent}
                        onChange={(e) => updateSetting('security', 'maxDiscountPercent', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Données & Audit</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Journaux d'audit</Label>
                        <p className="text-sm text-muted-foreground">Enregistrer toutes les actions</p>
                      </div>
                      <Switch
                        checked={settings.security.auditLogs}
                        onCheckedChange={(checked) => updateSetting('security', 'auditLogs', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sauvegarde automatique</Label>
                        <p className="text-sm text-muted-foreground">Sauvegarder les données régulièrement</p>
                      </div>
                      <Switch
                        checked={settings.security.dataBackup}
                        onCheckedChange={(checked) => updateSetting('security', 'dataBackup', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Chiffrement des données</Label>
                        <p className="text-sm text-muted-foreground">Chiffrer les données sensibles</p>
                      </div>
                      <Switch
                        checked={settings.security.encryptData}
                        onCheckedChange={(checked) => updateSetting('security', 'encryptData', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications & Alertes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Alertes système</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Stock faible</Label>
                        <p className="text-sm text-muted-foreground">Alerte quand le stock est bas</p>
                      </div>
                      <Switch
                        checked={settings.notifications.lowStock}
                        onCheckedChange={(checked) => updateSetting('notifications', 'lowStock', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Nouvelles commandes</Label>
                        <p className="text-sm text-muted-foreground">Notification pour les nouvelles commandes</p>
                      </div>
                      <Switch
                        checked={settings.notifications.newOrders}
                        onCheckedChange={(checked) => updateSetting('notifications', 'newOrders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Échecs de paiement</Label>
                        <p className="text-sm text-muted-foreground">Alerte en cas d'échec de paiement</p>
                      </div>
                      <Switch
                        checked={settings.notifications.paymentFailed}
                        onCheckedChange={(checked) => updateSetting('notifications', 'paymentFailed', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mises à jour système</Label>
                        <p className="text-sm text-muted-foreground">Notification des mises à jour</p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemUpdates}
                        onCheckedChange={(checked) => updateSetting('notifications', 'systemUpdates', checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Canaux de notification</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertes email</Label>
                        <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertes SMS</Label>
                        <p className="text-sm text-muted-foreground">Recevoir les notifications par SMS</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'smsAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default POSSettings;