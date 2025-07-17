import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrainingData {
  id: string;
  intent: string;
  training_text: string;
  response_template: string;
  category: string;
  confidence_threshold: number;
  is_active: boolean;
  metadata?: any;
}

const ChatbotResponseEditor = () => {
  const [responses, setResponses] = useState<TrainingData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TrainingData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_training_data')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réponses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (response: TrainingData) => {
    setEditingId(response.id);
    setEditForm(response);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveChanges = async () => {
    if (!editingId || !editForm) return;

    try {
      const { error } = await supabase
        .from('chatbot_training_data')
        .update({
          response_template: editForm.response_template,
          training_text: editForm.training_text,
          confidence_threshold: editForm.confidence_threshold,
          is_active: editForm.is_active
        })
        .eq('id', editingId);

      if (error) throw error;

      await loadResponses();
      setEditingId(null);
      setEditForm({});
      
      toast({
        title: "Succès",
        description: "Réponse mise à jour avec succès"
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('chatbot_training_data')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadResponses();
      
      toast({
        title: "Succès",
        description: `Réponse ${!currentStatus ? 'activée' : 'désactivée'}`
      });
    } catch (error) {
      console.error('Erreur toggle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Éditeur de réponses du chatbot</CardTitle>
          <p className="text-sm text-muted-foreground">
            Modifiez les réponses et déclencheurs du chatbot. Les modifications sont appliquées immédiatement.
          </p>
        </CardHeader>
      </Card>

      {responses.map((response) => (
        <Card key={response.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{response.intent}</CardTitle>
                <Badge 
                  variant={response.is_active ? "default" : "secondary"}
                  className="mt-1"
                >
                  {response.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={response.is_active ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleActive(response.id, response.is_active)}
                >
                  {response.is_active ? "Désactiver" : "Activer"}
                </Button>
                {editingId === response.id ? (
                  <>
                    <Button size="sm" onClick={saveChanges}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing(response)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mots déclencheurs :</label>
              {editingId === response.id ? (
                <Textarea
                  value={editForm.training_text || ''}
                  onChange={(e) => setEditForm({...editForm, training_text: e.target.value})}
                  placeholder="Mots ou phrases qui déclenchent cette réponse"
                  className="mt-1"
                />
              ) : (
                <p className="text-sm bg-muted p-2 rounded mt-1">{response.training_text}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Réponse du chatbot :</label>
              {editingId === response.id ? (
                <Textarea
                  value={editForm.response_template || ''}
                  onChange={(e) => setEditForm({...editForm, response_template: e.target.value})}
                  placeholder="Réponse que le chatbot donnera"
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <p className="text-sm bg-muted p-2 rounded mt-1">{response.response_template}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Catégorie :</label>
                <Badge variant="outline" className="ml-2">{response.category}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Confiance minimum :</label>
                {editingId === response.id ? (
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editForm.confidence_threshold || 0}
                    onChange={(e) => setEditForm({...editForm, confidence_threshold: parseFloat(e.target.value)})}
                    className="ml-2 w-20"
                  />
                ) : (
                  <Badge variant="outline" className="ml-2">{response.confidence_threshold}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChatbotResponseEditor;