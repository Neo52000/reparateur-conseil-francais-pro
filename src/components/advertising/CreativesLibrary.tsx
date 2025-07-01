
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Brush, Image, Video, Type, Wand2, Upload, Star } from 'lucide-react';
import { CampaignCreative } from '@/types/advancedAdvertising';
import { toast } from 'sonner';

const CreativesLibrary: React.FC = () => {
  const [creatives, setCreatives] = useState<CampaignCreative[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Données mock pour la démonstration
  const mockCreatives: CampaignCreative[] = [
    {
      id: '1',
      campaign_id: '1',
      creative_type: 'image',
      creative_url: '/lovable-uploads/4bdc75bf-a935-42b0-8ef6-086b5309086f.png',
      creative_data: {
        title: 'Réparation iPhone Express',
        description: 'Votre iPhone réparé en moins de 2h',
        cta_text: 'Réparer maintenant'
      },
      ai_generated: false,
      performance_score: 85,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      campaign_id: '1',
      creative_type: 'image',
      creative_url: '/lovable-uploads/68f25ab9-7b95-45e4-abba-df8bbdb8b6eb.png',
      creative_data: {
        title: 'Expert Réparation Smartphone',
        description: 'Service professionnel de qualité',
        cta_text: 'Découvrir'
      },
      ai_generated: true,
      performance_score: 92,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      campaign_id: '2',
      creative_type: 'text',
      creative_data: {
        title: 'Smartphone cassé ? Solution rapide !',
        description: 'Réparation express par des experts certifiés. Diagnostic gratuit.',
        cta_text: 'Obtenir un devis'
      },
      ai_generated: true,
      performance_score: 78,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const creativeTypes = [
    { value: 'image', label: 'Images', icon: Image, color: 'blue' },
    { value: 'video', label: 'Vidéos', icon: Video, color: 'purple' },
    { value: 'text', label: 'Textes', icon: Type, color: 'green' },
    { value: 'html', label: 'HTML', icon: Brush, color: 'orange' }
  ];

  const generateWithAI = async (type: string) => {
    setLoading(true);
    try {
      // Simulation de génération IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCreative: CampaignCreative = {
        id: Date.now().toString(),
        campaign_id: '1',
        creative_type: type as any,
        creative_data: {
          title: 'Créatif généré par IA',
          description: 'Contenu optimisé automatiquement',
          cta_text: 'Action'
        },
        ai_generated: true,
        performance_score: Math.floor(Math.random() * 30) + 70,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      setCreatives(prev => [newCreative, ...prev]);
      toast.success('Créatif généré avec succès par l\'IA');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const filteredCreatives = activeTab === 'all' 
    ? mockCreatives 
    : mockCreatives.filter(c => c.creative_type === activeTab);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    return 'À améliorer';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brush className="h-6 w-6 text-purple-500" />
            Bibliothèque de créatifs
            <Badge variant="secondary">IA</Badge>
          </h2>
          <p className="text-gray-600">Gérez vos créatifs publicitaires et générez du contenu avec l'IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateWithAI('image')} disabled={loading}>
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? 'Génération...' : 'Générer avec IA'}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau créatif
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {creativeTypes.map(type => {
          const count = mockCreatives.filter(c => c.creative_type === type.value).length;
          const aiCount = mockCreatives.filter(c => c.creative_type === type.value && c.ai_generated).length;
          
          return (
            <Card key={type.value}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{type.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                    {aiCount > 0 && (
                      <p className="text-xs text-blue-600">{aiCount} générés par IA</p>
                    )}
                  </div>
                  <type.icon className={`h-8 w-8 text-${type.color}-500`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Génération IA rapide */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Wand2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Génération automatique de créatifs</h3>
                <p className="text-sm text-purple-700">
                  Laissez l'IA créer des visuels et textes optimisés pour vos campagnes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {creativeTypes.map(type => (
                <Button
                  key={type.value}
                  variant="outline"
                  size="sm"
                  onClick={() => generateWithAI(type.value)}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <type.icon className="h-3 w-3" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation par types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          {creativeTypes.map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              <type.icon className="h-4 w-4 mr-1" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreatives.map((creative) => (
              <Card key={creative.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Aperçu du créatif */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {creative.creative_type === 'image' && creative.creative_url ? (
                      <img
                        src={creative.creative_url}
                        alt="Créatif"
                        className="w-full h-full object-cover"
                      />
                    ) : creative.creative_type === 'text' ? (
                      <div className="p-4 text-center">
                        <h4 className="font-bold text-blue-600 mb-2">
                          {creative.creative_data.title}
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          {creative.creative_data.description}
                        </p>
                        <Button size="sm">
                          {creative.creative_data.cta_text}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {creativeTypes.find(t => t.value === creative.creative_type)?.icon && (
                          <div className="p-4">
                            {React.createElement(
                              creativeTypes.find(t => t.value === creative.creative_type)!.icon,
                              { className: "h-12 w-12 text-gray-400" }
                            )}
                          </div>
                        )}
                        <p className="text-gray-500 text-sm">
                          {creative.creative_data.title}
                        </p>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {creative.ai_generated && (
                        <Badge className="bg-purple-500">
                          <Wand2 className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-white">
                        {creativeTypes.find(t => t.value === creative.creative_type)?.label}
                      </Badge>
                    </div>

                    {/* Score de performance */}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant="outline" 
                        className={`bg-white ${getPerformanceColor(creative.performance_score)}`}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {creative.performance_score}
                      </Badge>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium truncate">
                        {creative.creative_data.title}
                      </h3>
                      <Badge 
                        variant={creative.performance_score >= 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {getPerformanceBadge(creative.performance_score)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {creative.creative_data.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(creative.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Utiliser
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredCreatives.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Brush className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Aucun créatif dans cette catégorie.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <Button variant="outline" onClick={() => generateWithAI('image')}>
                <Wand2 className="h-4 w-4 mr-2" />
                Générer avec IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreativesLibrary;
