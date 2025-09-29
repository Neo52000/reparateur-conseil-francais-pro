import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NF203ComplianceMonitor } from './NF203ComplianceMonitor';
import { NF203ArchiveManager } from './NF203ArchiveManager';
import { NF203PeriodClosure } from './NF203PeriodClosure';
import { FECExportPanel } from './FECExportPanel';
import { Shield, Archive, Calendar, FileText } from 'lucide-react';

interface NF203DashboardProps {
  repairerId: string;
  siren: string;
}

export function NF203Dashboard({ repairerId, siren }: NF203DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Conformité NF203
        </h1>
        <p className="text-muted-foreground">
          Système de facturation électronique certifié et conforme aux normes françaises
        </p>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Conformité</span>
          </TabsTrigger>
          <TabsTrigger value="archives" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archives</span>
          </TabsTrigger>
          <TabsTrigger value="closures" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Clôtures</span>
          </TabsTrigger>
          <TabsTrigger value="fec" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export FEC</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4 mt-6">
          <NF203ComplianceMonitor repairerId={repairerId} />
        </TabsContent>

        <TabsContent value="archives" className="space-y-4 mt-6">
          <NF203ArchiveManager repairerId={repairerId} />
        </TabsContent>

        <TabsContent value="closures" className="space-y-4 mt-6">
          <NF203PeriodClosure repairerId={repairerId} />
        </TabsContent>

        <TabsContent value="fec" className="space-y-4 mt-6">
          <FECExportPanel repairerId={repairerId} siren={siren} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
