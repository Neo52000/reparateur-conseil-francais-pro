
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart3, Settings, FileText } from 'lucide-react';
import AdminAuditLogsViewer from './AdminAuditLogsViewer';
import AdminAuditAnalytics from './AdminAuditAnalytics';
import AdminAuditCleanupConfig from './AdminAuditCleanupConfig';
import AdminAuditReports from './AdminAuditReports';

const AuditLogAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Administration des Logs d'Audit</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Surveillance et analyse complète des actions administratives
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs d'audit
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <AdminAuditLogsViewer />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAuditAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <AdminAuditReports />
        </TabsContent>

        <TabsContent value="config">
          <AdminAuditCleanupConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLogAdmin;
