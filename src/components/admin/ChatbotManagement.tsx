
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, TrendingUp, Brain, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingData {
  id: string;
  intent: string;
  training_text: string;
  response_template: string;
  category: string;
  device_type?: string;
  brand?: string;
  model?: string;
  confidence_threshold: number;
  is_active: boolean;
}

interface Analytics {
  conversations_started: number;
  messages_processed: number;
  user_satisfaction: number;
  escalations: number;
}

const ChatbotManagement = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingData, setEditingData] = useState<TrainingData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les données d'entraînement
      const { data: training } = await supabase
        .from('chatbot_training_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (training) setTrainingData(training);

      // Charger la configuration
      const { data: configData } = await supabase
        .from('chatbot_configuration')
        .select('config_key, config_value');
      
      if (configData) {
        const configMap = configData.reduce((acc, item) => {
          acc[item.config_key] = item.config_value;
          return acc;
        }, {} as Record<string, any>);
        setConfig(configMap);
      }

      // Charger les analytics
      const { data: analyticsData } = await supabase
        .from('chatbot_analytics')
        .select('metric_type, metric_value')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (analyticsData) {
        const analyticsMap = analyticsData.reduce((acc, item) => {
          acc[item.metric_type] = (acc[item.metric_type] || 0) + item.metric_value;
          return acc;
        }, {} as Record<string, number>);
        
        setAnalytics({
          conversations_started: analyticsMap.conversations_started || 0,
          messages_processed: analyticsMap.messages_processed || 0,
          user_satisfaction: analyticsMap.user_satisfaction || 0,
          escalations: analyticsMap.escalations || 0
        });
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    }
    setIsLoading(false);
  };

  const saveTrainingData = async (data: TrainingData) => {
    try {
      // S'assurer que toutes les propriétés obligatoires sont présentes
      const trainingDataToSave = {
        intent: data.intent,
        training_text: data.training_text,
        response_template: data.response_template,
        category: data.category,
        confidence_threshold: data.confidence_threshold,
        is_active: data.is_active,
        device_type: data.device_type || null,
        brand: data.brand || null,
        model: data.model || null,
        metadata: {}
      };

      // Vérifier si c'est un update (id existe et n'est pas vide) ou un insert
      if (data.id && data.id.trim() !== '') {
        const { error } = await supabase
          .from('chatbot_training_data')
          .update(trainingDataToSave)
          .eq('id', data.id);
        
        if (error) throw error;
        toast.success('Données d\'entraînement mises à jour');
      } else {
        const { error } = await supabase
          .from('chatbot_training_data')
          .insert(trainingDataToSave);
        
        if (error) throw error;
        toast.success('Nouvelles données d\'entraînement ajoutées');
      }
      
      setShowAddModal(false);
      setEditingData(null);
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    try {
      await supabase
        .from('chatbot_configuration')
        .upsert({ config_key: key, config_value: value });
      
      setConfig(prev => ({ ...prev, [key]: value }));
      toast.success('Configuration mise à jour');
    } catch (error) {
      console.error('Erreur mise à jour config:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Chatbot IA</h2>
          <p className="text-gray-600">Administration et configuration de l'assistant intelligent</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="training">
            <Brain className="h-4 w-4 mr-2" />
            Base de connaissances
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="conversations">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.conversations_started || 0}</div>
                <p className="text-xs text-muted-foreground">Derniers 30 jours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages traités</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.messages_processed || 0}</div>
                <p className="text-xs text-muted-foreground">Messages totaux</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de résolution</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics ? Math.round((1 - (analytics.escalations / analytics.conversations_started)) * 100) || 0 : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Résolution automatique</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalations</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.escalations || 0}</div>
                <p className="text-xs text-muted-foreground">Transferts humain</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Diagnostic</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded">
                      <div className="w-3/4 h-2 bg-green-500 rounded"></div>
                    </div>
                    <span className="text-sm">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tarification</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded">
                      <div className="w-4/5 h-2 bg-blue-500 rounded"></div>
                    </div>
                    <span className="text-sm">80%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Réservation</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded">
                      <div className="w-3/5 h-2 bg-yellow-500 rounded"></div>
                    </div>
                    <span className="text-sm">60%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Base de connaissances</CardTitle>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingData({
                        id: '',
                        intent: '',
                        training_text: '',
                        response_template: '',
                        category: 'general',
                        confidence_threshold: 0.8,
                        is_active: true
                      });
                      setShowAddModal(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingData?.id && editingData.id.trim() !== '' ? 'Modifier' : 'Ajouter'} une donnée d'entraînement
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="intent" className="text-right">Intent</Label>
                        <Input
                          id="intent"
                          value={editingData?.intent || ''}
                          onChange={(e) => setEditingData(prev => prev ? {...prev, intent: e.target.value} : null)}
                          className="col-span-3"
                          placeholder="Ex: demande_prix"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Catégorie</Label>
                        <Select
                          value={editingData?.category || 'general'}
                          onValueChange={(value) => setEditingData(prev => prev ? {...prev, category: value} : null)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Général</SelectItem>
                            <SelectItem value="diagnostic">Diagnostic</SelectItem>
                            <SelectItem value="pricing">Tarification</SelectItem>
                            <SelectItem value="booking">Réservation</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="training_text" className="text-right">Mots-clés</Label>
                        <Textarea
                          id="training_text"
                          value={editingData?.training_text || ''}
                          onChange={(e) => setEditingData(prev => prev ? {...prev, training_text: e.target.value} : null)}
                          className="col-span-3"
                          placeholder="prix coût tarif combien réparation smartphone"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="response_template" className="text-right">Réponse</Label>
                        <Textarea
                          id="response_template"
                          value={editingData?.response_template || ''}
                          onChange={(e) => setEditingData(prev => prev ? {...prev, response_template: e.target.value} : null)}
                          className="col-span-3"
                          placeholder="Le prix d'une réparation dépend du type de panne..."
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confidence_threshold" className="text-right">Seuil confiance</Label>
                        <Input
                          id="confidence_threshold"
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editingData?.confidence_threshold || 0.8}
                          onChange={(e) => setEditingData(prev => prev ? {...prev, confidence_threshold: parseFloat(e.target.value)} : null)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="is_active" className="text-right">Actif</Label>
                        <Switch
                          id="is_active"
                          checked={editingData?.is_active || false}
                          onCheckedChange={(checked) => setEditingData(prev => prev ? {...prev, is_active: checked} : null)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddModal(false)}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={() => editingData && saveTrainingData(editingData)}
                        disabled={!editingData?.intent || !editingData?.training_text || !editingData?.response_template}
                      >
                        {editingData?.id && editingData.id.trim() !== '' ? 'Mettre à jour' : 'Ajouter'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intent</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Mots-clés</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.intent}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.training_text}</TableCell>
                      <TableCell>{Math.round(item.confidence_threshold * 100)}%</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingData(item);
                              setShowAddModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ai_model">Modèle IA</Label>
                  <Select
                    value={config.ai_model?.replace(/"/g, '') || 'gpt-4o-mini'}
                    onValueChange={(value) => updateConfig('ai_model', `"${value}"`)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mistral">Mistral AI</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="confidence_threshold">Seuil de confiance</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.confidence_threshold || 0.7}
                    onChange={(e) => updateConfig('confidence_threshold', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="max_conversation_length">Messages max par conversation</Label>
                  <Input
                    type="number"
                    value={config.max_conversation_length || 50}
                    onChange={(e) => updateConfig('max_conversation_length', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_voice">Reconnaissance vocale</Label>
                  <Switch
                    id="enable_voice"
                    checked={config.enable_voice === 'true' || config.enable_voice === true}
                    onCheckedChange={(checked) => updateConfig('enable_voice', checked.toString())}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_escalation">Escalation automatique</Label>
                  <Switch
                    id="auto_escalation"
                    checked={config.auto_escalation === 'true' || config.auto_escalation === true}
                    onCheckedChange={(checked) => updateConfig('auto_escalation', checked.toString())}
                  />
                </div>

                <div>
                  <Label htmlFor="escalation_keywords">Mots-clés d'escalation</Label>
                  <Textarea
                    value={JSON.stringify(config.escalation_keywords || []).replace(/[\[\]"]/g, '').split(',').join(', ')}
                    onChange={(e) => {
                      const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                      updateConfig('escalation_keywords', JSON.stringify(keywords));
                    }}
                    placeholder="humain, conseiller, aide, problème"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversations récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotManagement;
