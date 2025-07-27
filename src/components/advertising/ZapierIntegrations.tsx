import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Plus, Settings, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useZapierIntegrations } from '@/hooks/useZapierIntegrations';

const ZapierIntegrations = () => {
  const { integrations, loading, createIntegration, updateIntegration, triggerWebhook, deleteIntegration } = useZapierIntegrations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    integration_name: '',
    webhook_url: '',
    trigger_events: [] as string[],
  });

  const availableEvents = [
    'new_order',
    'order_completed',
    'customer_registered',
    'quote_sent',
    'appointment_booked',
    'payment_received',
    'inventory_low'
  ];

  const eventLabels = {
    new_order: 'Nouvelle commande',
    order_completed: 'Commande terminée',
    customer_registered: 'Nouveau client',
    quote_sent: 'Devis envoyé',
    appointment_booked: 'RDV pris',
    payment_received: 'Paiement reçu',
    inventory_low: 'Stock faible'
  };

  const handleCreate = async () => {
    if (!formData.integration_name || !formData.webhook_url) return;
    
    await createIntegration({ ...formData, is_active: true });
    setIsCreateOpen(false);
    setFormData({
      integration_name: '',
      webhook_url: '',
      trigger_events: [],
    });
  };

  const handleTestWebhook = async (integrationId: string) => {
    await triggerWebhook(integrationId, 'test', {
      message: 'Test depuis TopRéparateurs.fr',
      timestamp: new Date().toISOString()
    });
  };

  const getStatusColor = (integration: any) => {
    if (!integration.is_active) return 'secondary';
    if (integration.error_count > integration.success_count) return 'destructive';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Intégrations Zapier
          </h2>
          <p className="text-muted-foreground">
            Automatisez vos workflows avec plus de 5000 applications
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle intégration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une intégration Zapier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'intégration</Label>
                <Input
                  id="name"
                  value={formData.integration_name}
                  onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                  placeholder="Ex: Notifications Slack"
                />
              </div>

              <div>
                <Label htmlFor="webhook">URL du Webhook Zapier</Label>
                <Input
                  id="webhook"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>

              <div>
                <Label>Événements déclencheurs</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!formData.trigger_events.includes(value)) {
                      setFormData({
                        ...formData,
                        trigger_events: [...formData.trigger_events, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvents.map((event) => (
                      <SelectItem key={event} value={event}>
                        {eventLabels[event as keyof typeof eventLabels]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.trigger_events.map((event) => (
                    <Badge
                      key={event}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setFormData({
                        ...formData,
                        trigger_events: formData.trigger_events.filter(e => e !== event)
                      })}
                    >
                      {eventLabels[event as keyof typeof eventLabels]} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">
                  Créer l'intégration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Chargement des intégrations...
            </div>
          </CardContent>
        </Card>
      ) : integrations.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune intégration</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre première intégration Zapier pour automatiser vos workflows
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une intégration
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{integration.integration_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="truncate max-w-md">{integration.webhook_url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(integration)}>
                      {integration.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Événements déclencheurs</h4>
                    <div className="flex flex-wrap gap-2">
                      {integration.trigger_events.map((event) => (
                        <Badge key={event} variant="outline">
                          {eventLabels[event as keyof typeof eventLabels]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {integration.success_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Succès</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {integration.error_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Erreurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Dernier trigger</div>
                      <div className="text-sm">
                        {integration.last_triggered_at
                          ? new Date(integration.last_triggered_at).toLocaleDateString()
                          : 'Jamais'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.is_active}
                        onCheckedChange={(checked) =>
                          updateIntegration(integration.id, { is_active: checked })
                        }
                      />
                      <Label className="text-sm">Intégration active</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(integration.id)}
                      >
                        Tester
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIntegration(integration.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                Comment configurer Zapier
              </h4>
              <p className="text-sm text-yellow-700">
                1. Créez un nouveau Zap sur zapier.com<br />
                2. Choisissez "Webhooks by Zapier" comme trigger<br />
                3. Copiez l'URL du webhook et collez-la ici<br />
                4. Configurez les actions que vous souhaitez automatiser
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZapierIntegrations;