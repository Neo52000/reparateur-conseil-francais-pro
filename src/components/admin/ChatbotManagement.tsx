
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart3, 
  MessageSquare, 
  Brain, 
  Settings, 
  TrendingUp, 
  Users, 
  Star,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatbotAnalytics {
  totalConversations: number;
  activeConversations: number;
  completedConversations: number;
  averageSatisfaction: number;
  topIntents: Array<{ intent: string; count: number }>;
  responseAccuracy: number;
}

interface TrainingData {
  id: string;
  category: string;
  intent: string;
  training_text: string;
  response_template: string;
  confidence_threshold: number;
  is_active: boolean;
}

interface ChatbotConfig {
  ai_model: string;
  confidence_threshold: number;
  max_conversation_length: number;
  enable_voice: boolean;
  enable_learning: boolean;
  bot_personality: any;
}

const ChatbotManagement = () => {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingData | null>(null);
  const [showAddTraining, setShowAddTraining] = useState(false);
  
  const { toast } = useToast();

  // Charger les analytics
  useEffect(() => {
    loadAnalytics();
    loadTrainingData();
    loadConfiguration();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Récupérer les métriques de base
      const { data: conversations } = await supabase
        .from('chatbot_conversations')
        .select('status, satisfaction_score, created_at');

      const { data: messages } = await supabase
        .from('chatbot_messages')
        .select('sender_type, message_type, confidence_score')
        .eq('sender_type', 'bot');

      if (conversations && messages) {
        const totalConversations = conversations.length;
        const activeConversations = conversations.filter(c => c.status === 'active').length;
        const completedConversations = conversations.filter(c => c.status === 'completed').length;
        
        const satisfactionScores = conversations
          .filter(c => c.satisfaction_score)
          .map(c => c.satisfaction_score);
        const averageSatisfaction = satisfactionScores.length > 0 
          ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length 
          : 0;

        const confidenceScores = messages
          .filter(m => m.confidence_score)
          .map(m => m.confidence_score);
        const responseAccuracy = confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
          : 0;

        setAnalytics({
          totalConversations,
          activeConversations,
          completedConversations,
          averageSatisfaction,
          responseAccuracy,
          topIntents: [] // À implémenter avec plus de données
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    }
  };

  const loadTrainingData = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainingData(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'entraînement:', error);
    }
  };

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_configuration')
        .select('*');

      if (error) throw error;

      const configObject = data.reduce((acc, item) => {
        acc[item.config_key] = JSON.parse(item.config_value);
        return acc;
      }, {} as any);

      setConfig(configObject);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  };

  const saveTrainingData = async (data: Partial<TrainingData>) => {
    setLoading(true);
    try {
      if (editingTraining) {
        const { error } = await supabase
          .from('chatbot_training_data')
          .update(data)
          .eq('id', editingTraining.id);
        
        if (error) throw error;
        toast({ title: "Données d'entraînement mises à jour" });
      } else {
        const { error } = await supabase
          .from('chatbot_training_data')
          .insert(data);
        
        if (error) throw error;
        toast({ title: "Données d'entraînement ajoutées" });
      }

      setEditingTraining(null);
      setShowAddTraining(false);
      loadTrainingData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('chatbot_configuration')
        .update({ config_value: JSON.stringify(value) })
        .eq('config_key', key);

      if (error) throw error;
      
      setConfig(prev => prev ? { ...prev, [key]: value } : null);
      toast({ title: "Configuration mise à jour" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration",
        variant: "destructive"
      });
    }
  };

  const TrainingDataForm = ({ data, onSave, onCancel }: {
    data?: TrainingData;
    onSave: (data: Partial<TrainingData>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      category: data?.category || '',
      intent: data?.intent || '',
      training_text: data?.training_text || '',
      response_template: data?.response_template || '',
      confidence_threshold: data?.confidence_threshold || 0.8,
      device_type: data?.device_type || '',
      brand: data?.brand || '',
      model: data?.model || '',
      repair_type: data?.repair_type || '',
      is_active: data?.is_active ?? true
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>{data ? 'Modifier' : 'Ajouter'} une donnée d'entraînement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: greeting, diagnostic, appointment"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Intention</label>
              <Input
                value={formData.intent}
                onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                placeholder="Ex: salutation, identify_device"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Texte d'entraînement</label>
            <Textarea
              value={formData.training_text}
              onChange={(e) => setFormData({ ...formData, training_text: e.target.value })}
              placeholder="Mots-clés séparés par des virgules"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Modèle de réponse</label>
            <Textarea
              value={formData.response_template}
              onChange={(e) => setFormData({ ...formData, response_template: e.target.value })}
              placeholder="Modèle de réponse avec variables si nécessaire"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Type d'appareil</label>
              <Input
                value={formData.device_type}
                onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                placeholder="smartphone, tablet..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Marque</label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="iPhone, Samsung..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Modèle</label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="iPhone 14, Galaxy S23..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm">Actif</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm">Seuil de confiance:</label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.confidence_threshold}
                onChange={(e) => setFormData({ ...formData, confidence_threshold: parseFloat(e.target.value) })}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => onSave(formData)} disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion du Chatbot IA</h2>
        <Button onClick={() => setShowAddTraining(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter données d'entraînement
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="training">Base de connaissances</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conversations totales</p>
                      <p className="text-2xl font-bold">{analytics.totalConversations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conversations actives</p>
                      <p className="text-2xl font-bold">{analytics.activeConversations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Satisfaction moyenne</p>
                      <p className="text-2xl font-bold">{analytics.averageSatisfaction.toFixed(1)}/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Précision des réponses</p>
                      <p className="text-2xl font-bold">{(analytics.responseAccuracy * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="training">
          <div className="space-y-6">
            {(showAddTraining || editingTraining) && (
              <TrainingDataForm
                data={editingTraining || undefined}
                onSave={saveTrainingData}
                onCancel={() => {
                  setEditingTraining(null);
                  setShowAddTraining(false);
                }}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Données d'entraînement</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Intention</TableHead>
                      <TableHead>Texte d'entraînement</TableHead>
                      <TableHead>Seuil</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.intent}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.training_text}
                        </TableCell>
                        <TableCell>{item.confidence_threshold}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTraining(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration">
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Modèle IA</label>
                    <Select
                      value={config.ai_model}
                      onValueChange={(value) => updateConfiguration('ai_model', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Seuil de confiance minimum</label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.confidence_threshold}
                      onChange={(e) => updateConfiguration('confidence_threshold', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Messages max par conversation</label>
                    <Input
                      type="number"
                      value={config.max_conversation_length}
                      onChange={(e) => updateConfiguration('max_conversation_length', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Fonctionnalités vocales</label>
                    <Switch
                      checked={config.enable_voice}
                      onCheckedChange={(checked) => updateConfiguration('enable_voice', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Apprentissage automatique</label>
                    <Switch
                      checked={config.enable_learning}
                      onCheckedChange={(checked) => updateConfiguration('enable_learning', checked)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Nom du bot</label>
                    <Input
                      value={config.bot_personality?.name || ''}
                      onChange={(e) => updateConfiguration('bot_personality', {
                        ...config.bot_personality,
                        name: e.target.value
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Conversations récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de visualisation des conversations à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotManagement;
