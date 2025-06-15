
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface AnalyticsTabSectionProps {
  avgRepairTime: number;
}

const AnalyticsTabSection: React.FC<AnalyticsTabSectionProps> = ({ avgRepairTime }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <BarChart3 className="h-5 w-5 mr-2" />
        Analyses de performance
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Graphiques et statistiques détaillées</p>
        <div className="grid grid-cols-2 gap-4 mt-6 text-left">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Temps moyen de réparation</p>
            <p className="text-2xl font-bold">{avgRepairTime}j</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Taux de satisfaction</p>
            <p className="text-2xl font-bold">96%</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsTabSection;
