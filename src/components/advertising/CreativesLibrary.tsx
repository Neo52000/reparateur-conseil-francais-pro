import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brush, Plus, Image, Video, FileText, Sparkles, Edit, Copy, Trash2 } from 'lucide-react';
import { useCreatives } from '@/hooks/useCreatives';
import { AICreativeService } from '@/services/advertising/AICreativeService';
import CreateCreativeModal from './modals/CreateCreativeModal';
import EditCreativeModal from './modals/EditCreativeModal';
import AIGenerationModal from './modals/AIGenerationModal';
import { Creative, AIGenerationRequest, CreateCreativeData } from '@/types/creatives';
import { toast } from 'sonner';

const CreativesLibrary: React.FC = () => {
  const {
    creatives,
    loading,
    createCreative,
    updateCreative,
    deleteCreative,
    duplicateCreative,
    uploadFile,
  } = useCreatives();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleAIGeneration = async (request: AIGenerationRequest): Promise<CreateCreativeData> => {
    try {
      const generated = await AICreativeService.generateCreative(request);
      await createCreative(generated);
      toast.success('Créatif généré avec succès par l\'IA !');
      return generated;
    } catch (error) {
      console.error('Error generating creative:', error);
      toast.error('Erreur lors de la génération IA');
      throw error;
    }
  };

  const handleEdit = (creative: Creative) => {
    setSelectedCreative(creative);
    setEditModalOpen(true);
  };

  const handleDuplicate = async (creative: Creative) => {
    try {
      await duplicateCreative(creative.id);
    } catch (error) {
      console.error('Error duplicating creative:', error);
    }
  };

  const handleDelete = async (creative: Creative) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créatif ?')) {
      try {
        await deleteCreative(creative.id);
      } catch (error) {
        console.error('Error deleting creative:', error);
      }
    }
  };

  const creativeTypes = [
    { id: 'all', label: 'Tous', icon: Brush },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Vidéos', icon: Video },
    { id: 'text', label: 'Textes', icon: FileText }
  ];

  const filteredCreatives = activeTab === 'all' 
    ? creatives 
    : creatives.filter(creative => creative.creative_type === activeTab);

  const stats = {
    total: creatives.length,
    aiGenerated: creatives.filter(c => c.ai_generated).length,
    averageScore: creatives.length > 0 
      ? (creatives.reduce((sum, c) => sum + c.performance_score, 0) / creatives.length).toFixed(1)
      : '0',
    active: creatives.filter(c => c.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brush className="h-6 w-6 text-purple-500" />
            Bibliothèque de Créatifs
            <Badge variant="secondary">IA</Badge>
          </h2>
          <p className="text-gray-600">Gestion et génération automatique de contenus publicitaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAiModalOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Générer avec IA
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter créatif
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total créatifs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Brush className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Générés par IA</p>
                <p className="text-2xl font-bold">{stats.aiGenerated}</p>
              </div>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score moyen</p>
                <p className="text-2xl font-bold">{stats.averageScore}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">★</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En production</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {creativeTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              <type.icon className="h-4 w-4 mr-2" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement des créatifs...</p>
            </div>
          ) : filteredCreatives.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun créatif trouvé</p>
              <Button onClick={() => setCreateModalOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier créatif
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreatives.map((creative) => (
                <Card key={creative.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {creative.creative_type === 'image' && creative.creative_url && (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={creative.creative_url} 
                            alt={creative.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {creative.creative_type === 'text' && (
                        <div className="aspect-video bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                          <p className="text-sm text-center line-clamp-3">
                            {creative.creative_data?.content || 'Contenu textuel'}
                          </p>
                        </div>
                      )}
                      
                      {creative.creative_type === 'video' && (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm truncate">{creative.name}</h3>
                          <Badge variant={creative.status === 'active' ? "default" : "secondary"}>
                            {creative.status === 'active' ? 'Actif' : 
                             creative.status === 'draft' ? 'Brouillon' : 'Archivé'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {creative.creative_type}
                            </Badge>
                            {creative.ai_generated && (
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                          </div>
                          <span>Score: {creative.performance_score}/10</span>
                        </div>

                        {creative.tags && creative.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {creative.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {creative.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{creative.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEdit(creative)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDuplicate(creative)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Dupliquer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(creative)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <CreateCreativeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createCreative}
        onUpload={uploadFile}
      />

      <EditCreativeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        creative={selectedCreative}
        onSubmit={updateCreative}
      />

      <AIGenerationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={handleAIGeneration}
      />
    </div>
  );
};

export default CreativesLibrary;
