
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Brain, Target } from "lucide-react";
import PerformanceStats from "./statistics/PerformanceStats";
import PredictiveAnalytics from "./analytics/PredictiveAnalytics";
import BusinessInsights from "./analytics/BusinessInsights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsTabSectionProps {
  avgRepairTime: number;
}

const AnalyticsTabSection: React.FC<AnalyticsTabSectionProps> = ({ avgRepairTime }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analytics AI</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">Actif</div>
          <p className="text-xs text-muted-foreground">Prédictions en temps réel</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">94/100</div>
          <p className="text-xs text-muted-foreground">+12% ce mois</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Objectifs</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">8/10</div>
          <p className="text-xs text-muted-foreground">Atteints ce mois</p>
        </CardContent>
      </Card>
    </div>

    <Tabs defaultValue="performance" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="predictions">Prédictions IA</TabsTrigger>
        <TabsTrigger value="insights">Insights Business</TabsTrigger>
      </TabsList>

      <TabsContent value="performance">
        <PerformanceStats />
      </TabsContent>

      <TabsContent value="predictions">
        <PredictiveAnalytics />
      </TabsContent>

      <TabsContent value="insights">
        <BusinessInsights />
      </TabsContent>
    </Tabs>
  </div>
);

export default AnalyticsTabSection;
