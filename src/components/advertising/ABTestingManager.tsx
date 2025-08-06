
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Plus, TrendingUp, BarChart } from 'lucide-react';

const ABTestingManager: React.FC = () => {
  const [tests] = useState([
    {
      id: '1',
      name: 'Test Bannière Homepage',
      status: 'running',
      variants: 2,
      traffic_split: '50/50',
      conversion_rate_a: 3.2,
      conversion_rate_b: 4.1,
      confidence: 85
    },
    {
      id: '2',
      name: 'Test CTA Réparateurs',
      status: 'completed',
      variants: 3,
      traffic_split: '33/33/34',
      conversion_rate_a: 2.8,
      conversion_rate_b: 3.5,
      confidence: 92
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-purple-500" />
            A/B Testing Manager
          </h2>
          <p className="text-gray-600">Optimisation continue par tests A/B</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau test
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tests actifs</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gain de conversion</p>
                <p className="text-2xl font-bold">+28%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tests terminés</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <BarChart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">{test.name}</h3>
                    <Badge variant={test.status === 'running' ? "default" : "secondary"}>
                      {test.status === 'running' ? 'En cours' : 'Terminé'}
                    </Badge>
                    <Badge variant="outline">
                      {test.variants} variantes
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span>Répartition: {test.traffic_split}</span>
                    <span>Confiance: {test.confidence}%</span>
                    <span>Conv. A: {test.conversion_rate_a}%</span>
                    <span>Conv. B: {test.conversion_rate_b}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {test.conversion_rate_b > test.conversion_rate_a && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Variante B gagnante
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Analyser
                  </Button>
                  <Button variant="outline" size="sm">
                    {test.status === 'running' ? 'Arrêter' : 'Dupliquer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ABTestingManager;
