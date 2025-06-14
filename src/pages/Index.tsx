
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Wrench, 
  Calculator, 
  Search, 
  AlertCircle, 
  CheckCircle,
  Phone,
  Battery,
  Volume2,
  Wifi,
  Camera,
  Shield
} from 'lucide-react';
import DiagnosticTool from '@/components/DiagnosticTool';
import RepairGuide from '@/components/RepairGuide';
import PriceCalculator from '@/components/PriceCalculator';
import PartsInventory from '@/components/PartsInventory';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const commonIssues = [
    { icon: Phone, title: 'Écran cassé', severity: 'high', frequency: '45%' },
    { icon: Battery, title: 'Batterie défaillante', severity: 'medium', frequency: '28%' },
    { icon: Volume2, title: 'Problème audio', severity: 'low', frequency: '12%' },
    { icon: Wifi, title: 'Connectivité', severity: 'medium', frequency: '10%' },
    { icon: Camera, title: 'Appareil photo', severity: 'low', frequency: '5%' },
  ];

  const quickStats = [
    { label: 'Réparations aujourd\'hui', value: '23', change: '+12%' },
    { label: 'CA du mois', value: '3,450€', change: '+8%' },
    { label: 'Taux de satisfaction', value: '98%', change: '+2%' },
    { label: 'Temps moyen', value: '45min', change: '-5min' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">TechRepair Advisor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un modèle, une panne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Smartphone className="h-4 w-4 mr-2" />
                Nouveau diagnostic
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="diagnostic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diagnostic" className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Diagnostic
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Guide Réparation
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Calculateur Prix
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Pièces Détachées
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DiagnosticTool />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pannes Fréquentes</CardTitle>
                    <CardDescription>
                      Les problèmes les plus courants cette semaine
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {commonIssues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <issue.icon className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{issue.title}</p>
                            <p className="text-sm text-gray-500">{issue.frequency} des cas</p>
                          </div>
                        </div>
                        <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                          {issue.severity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guide">
            <RepairGuide />
          </TabsContent>

          <TabsContent value="calculator">
            <PriceCalculator />
          </TabsContent>

          <TabsContent value="inventory">
            <PartsInventory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
