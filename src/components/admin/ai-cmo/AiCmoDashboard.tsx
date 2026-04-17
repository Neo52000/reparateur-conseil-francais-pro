import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Swords,
  MessageSquare,
  FileSearch,
  LayoutDashboard,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
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
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI-CMO — Intelligence concurrentielle</h2>
          <p className="text-muted-foreground">
            Monitoring de visibilite de votre marque dans les IA conversationnelles
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto md:h-10 gap-1 md:gap-0">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="competitors" className="gap-1.5">
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">Concurrents</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5">
            <FileSearch className="w-4 h-4" />
            <span className="hidden sm:inline">Resultats</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1.5">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1.5">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Recommandations</span>
          </TabsTrigger>
          <TabsTrigger value="prompts-library" className="gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Prompts Marketing</span>
          </TabsTrigger>
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
            onRefresh={() => hook.fetchDashboardStats()}
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
