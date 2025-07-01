
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brush, Plus, Image, Video, FileText, Sparkles } from 'lucide-react';

const CreativesLibrary: React.FC = () => {
  const [creatives] = useState([
    {
      id: '1',
      name: 'Bannière Réparation iPhone',
      type: 'image',
      url: '/api/placeholder/300/150',
      ai_generated: true,
      performance_score: 8.5,
      status: 'active'
    },
    {
      id: '2',
      name: 'Vidéo Promo Samsung',
      type: 'video',
      url: '/api/placeholder/300/150',
      ai_generated: false,
      performance_score: 7.2,
      status: 'active'
    },
    {
      id: '3',
      name: 'Texte Offre Spéciale',
      type: 'text',
      ai_generated: true,
      performance_score: 9.1,
      status: 'draft'
    }
  ]);

  const creativeTypes = [
    { id: 'all', label: 'Tous', icon: Brush },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Vidéos', icon: Video },
    { id: 'text', label: 'Textes', icon: FileText }
  ];

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
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Générer avec IA
          </Button>
          <Button>
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
                <p className="text-2xl font-bold">{creatives.length}</p>
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
                <p className="text-2xl font-bold">{creatives.filter(c => c.ai_generated).length}</p>
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
                <p className="text-2xl font-bold">8.3</p>
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
                <p className="text-2xl font-bold">{creatives.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          {creativeTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              <type.icon className="h-4 w-4 mr-2" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatives.map((creative) => (
              <Card key={creative.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {creative.type === 'image' && creative.url && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{creative.name}</h3>
                        <Badge variant={creative.status === 'active' ? "default" : "secondary"}>
                          {creative.status === 'active' ? 'Actif' : 'Brouillon'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {creative.type}
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
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Dupliquer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreativesLibrary;
