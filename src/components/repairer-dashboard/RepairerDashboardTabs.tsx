import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Calendar,
  Package,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Wand2,
  Shield,
  Recycle,
  Brain,
} from 'lucide-react';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';
import RepairerAppointmentsCalendar from './RepairerAppointmentsCalendar';
import AnalyticsTabSection from './AnalyticsTabSection';
import ProfileTabSection from './ProfileTabSection';
import PricingTabSection from './PricingTabSection';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DayView from './calendar/DayView';
import AdvancedAnalytics from './analytics/AdvancedAnalytics';
import AdvertisingDashboard from '@/components/advertising/AdvertisingDashboard';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';
import ComplianceModule from '@/components/compliance/ComplianceModule';
import TeamManagement from './TeamManagement';
import ServicesManagement from './ServicesManagement';
import QualiReparDashboard from '@/components/qualirepar/QualiReparDashboard';
import ModulesStore from '@/components/modules/ModulesStore';
import AIAssistantDashboard from '@/components/ai-assistant/AIAssistantDashboard';

interface Appointment {
  id: string;
  client: string;
  time: string;
  service: string;
  phone: string;
}

interface ProfileData {
  name: string;
  rating: number;
  totalRepairs: number;
  joinDate: string;
}

interface RepairerDashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  appointments: Appointment[];
  profileData: ProfileData;
  avgRepairTime: number;
}

const RepairerDashboardTabs: React.FC<RepairerDashboardTabsProps> = ({
  activeTab,
  onTabChange,
  appointments,
  profileData,
  avgRepairTime,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-12">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Aperçu
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Planning
        </TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Services
        </TabsTrigger>
        <TabsTrigger value="qualirepar" className="flex items-center gap-2">
          <Recycle className="h-4 w-4" />
          QualiRépar
        </TabsTrigger>
        <TabsTrigger value="pricing" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Tarifs
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Équipe
        </TabsTrigger>
        <TabsTrigger value="advertising" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Pub IA
        </TabsTrigger>
        <TabsTrigger value="jarvis" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Jarvis IA
        </TabsTrigger>
        <TabsTrigger value="modules" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Modules
        </TabsTrigger>
        <TabsTrigger value="compliance" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Conformité
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Mes données
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <EnhancedDashboard orders={[]} appointments={appointments} />
      </TabsContent>

      <TabsContent value="calendar">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planning des rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RepairerAppointmentsCalendar />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DayView
              selectedDate={new Date()}
              appointments={appointments.map((apt) => ({
                id: apt.id,
                appointment_date: new Date().toISOString(),
                duration_minutes: 60,
                client_name: apt.client,
                service: apt.service,
                status: 'scheduled',
              }))}
              onAppointmentClick={(apt) => console.log('Appointment clicked:', apt)}
              onTimeSlotClick={(time) => console.log('Time slot clicked:', time)}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="services">
        <ServicesManagement />
      </TabsContent>

      <TabsContent value="qualirepar">
        <QualiReparDashboard />
      </TabsContent>

      <TabsContent value="pricing">
        <PricingTabSection />
      </TabsContent>

      <TabsContent value="analytics">
        <div className="space-y-6">
          <AnalyticsTabSection avgRepairTime={avgRepairTime} />
          <AdvancedAnalytics />
        </div>
      </TabsContent>

      <TabsContent value="team">
        <TeamManagement />
      </TabsContent>

      <TabsContent value="advertising">
        <AdvertisingDashboard />
      </TabsContent>

      <TabsContent value="jarvis">
        <AIAssistantDashboard repairerId="demo-repairer-id" />
      </TabsContent>

      <TabsContent value="modules">
        <ModulesStore />
      </TabsContent>

      <TabsContent value="compliance">
        <div className="space-y-6">
          <ComplianceModule />
          <AuditLogsViewer />
        </div>
      </TabsContent>

      <TabsContent value="profile">
        <ProfileTabSection profileData={profileData} />
      </TabsContent>

      <TabsContent value="data">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Gestion des données personnelles (RGPD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Accédez à vos droits RGPD et gérez vos préférences de confidentialité.
              </p>
              <a href="/mes-donnees" className="text-primary hover:underline">
                Accéder au centre de gestion des données →
              </a>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RepairerDashboardTabs;
