import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import QualiReparWizard from '@/components/qualirepar/v2/QualiReparWizard';
import QualiReparDashboard from '@/components/qualirepar/v2/QualiReparDashboard';

const QualiReparPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      <Helmet>
        <title>Module QualiRépar v2 - Conforme API Officielle | iRepar</title>
        <meta name="description" content="Module QualiRépar v2 entièrement conforme à l'API officielle du Fonds Réparation. Tableau de bord, création de dossiers et suivi en temps réel." />
      </Helmet>
      
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Module QualiRépar v2</h1>
            <p className="text-muted-foreground mt-2">
              Interface conforme à l'API officielle du Fonds Réparation
            </p>
          </div>
          
          {!showWizard && (
            <Button onClick={() => setShowWizard(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau dossier
            </Button>
          )}
        </div>

        {showWizard ? (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowWizard(false)}
              className="mb-4"
            >
              ← Retour au tableau de bord
            </Button>
            <QualiReparWizard 
              onComplete={() => setShowWizard(false)}
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="wizard" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau dossier
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <QualiReparDashboard />
            </TabsContent>

            <TabsContent value="wizard" className="mt-6">
              <QualiReparWizard 
                onComplete={() => setActiveTab('dashboard')}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default QualiReparPage;