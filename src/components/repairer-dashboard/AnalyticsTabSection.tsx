
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import PerformanceStats from "./statistics/PerformanceStats";

interface AnalyticsTabSectionProps {
  avgRepairTime: number;
}

const AnalyticsTabSection: React.FC<AnalyticsTabSectionProps> = ({ avgRepairTime }) => (
  <div className="space-y-6">
    <PerformanceStats />
  </div>
);

export default AnalyticsTabSection;
