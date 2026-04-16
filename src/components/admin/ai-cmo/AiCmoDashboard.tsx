import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAiCmo } from './useAiCmo';
import AiCmoProfile from './AiCmoProfile';
import AiCmoCompetitors from './AiCmoCompetitors';
import AiCmoQuestions from './AiCmoQuestions';
import AiCmoResults from './AiCmoResults';
import AiCmoStats from './AiCmoStats';
import AiCmoRecommendations from './AiCmoRecommendations';
import AiCmoMarketingPrompts from './AiCmoMarketingPrompts';

const AiCmoDashboard: React.FC = () => {
  const hook = useAiCmo();

  // Track which lazy tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  const handleTabChange = useCallback(
    (value: string) => {
      if (loadedTabs.has(value)) return;

      setLoadedTabs((prev) => new Set(prev).add(value));

      switch (value) {
        case 'results':
          hook.fetchPromptRuns(0);
          break;
        case 'dashboard':
          hook.fetchDashboardStats();
          break;
        case 'recommendations':
          hook.fetchRecommendations();
          break;
        // 'prompts-library' is static, no fetch needed
      }
    },
    [loadedTabs, hook]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI-CMO</h2>
        <p className="text-muted-foreground">
          Monitoring de visibilite de votre marque dans les IA conversationnelles
        </p>
      </div>

      <Tabs defaultValue="profile" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="competitors">Concurrents</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="results">Resultats</TabsTrigger>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="prompts-library">Prompts Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AiCmoProfile
            profile={hook.profile}
            loading={hook.loadingProfile}
            saving={hook.saving}
            onSave={hook.saveProfile}
          />
        </TabsContent>

        <TabsContent value="competitors">
          <AiCmoCompetitors
            competitors={hook.competitors}
            loading={hook.loadingCompetitors}
            saving={hook.saving}
            onSave={hook.saveCompetitors}
          />
        </TabsContent>

        <TabsContent value="questions">
          <AiCmoQuestions
            questions={hook.questions}
            loading={hook.loadingQuestions}
            saving={hook.saving}
            onSave={hook.saveQuestions}
          />
        </TabsContent>

        <TabsContent value="results">
          <AiCmoResults
            runs={hook.promptRuns}
            loading={hook.loadingRuns}
            page={hook.runsPage}
            total={hook.runsTotal}
            perPage={hook.runsPerPage}
            onPageChange={(page) => hook.fetchPromptRuns(page)}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <AiCmoStats
            stats={hook.dashboardStats}
            costs={hook.llmCosts}
            loading={hook.loadingStats}
            loadingCosts={hook.loadingCosts}
          />
        </TabsContent>

        <TabsContent value="recommendations">
          <AiCmoRecommendations
            recommendations={hook.recommendations}
            loading={hook.loadingRecommendations}
          />
        </TabsContent>

        <TabsContent value="prompts-library">
          <AiCmoMarketingPrompts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiCmoDashboard;
