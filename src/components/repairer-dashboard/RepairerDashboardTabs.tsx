import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Package, 
  Receipt, 
  Settings, 
  Store, 
  TrendingUp, 
  Users,
  Wand2,
  Palette,
  Shield,
  RefreshCw,
  Recycle,
  Brain,
  FileText
} from 'lucide-react';
import OverviewTabSection from "./OverviewTabSection";
import EnhancedOverviewTab from "./EnhancedOverviewTab";
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';
import OrdersTabSection from "./OrdersTabSection";
import CalendarTabSection from "./CalendarTabSection";
import InventoryTabSection from "./InventoryTabSection";
import AnalyticsTabSection from "./AnalyticsTabSection";
import BillingTabSection from "./BillingTabSection";
import ProfileTabSection from "./ProfileTabSection";
import PricingTabSection from "./PricingTabSection";
import DayView from "./calendar/DayView";
import AdvancedAnalytics from "./analytics/AdvancedAnalytics";
import AdvertisingDashboard from '@/components/advertising/AdvertisingDashboard';
import StoreCustomizer from '@/components/ecommerce/StoreCustomizer';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';
import InventorySyncManager from '@/components/inventory/InventorySyncManager';
import ComplianceModule from '@/components/compliance/ComplianceModule';
import TeamManagement from './TeamManagement';
import EcommerceInterface from '@/components/ecommerce/EcommerceInterface';
import ServicesManagement from './ServicesManagement';
import QualiReparDashboard from '@/components/qualirepar/QualiReparDashboard';
import ModulesStore from '@/components/modules/ModulesStore';
import AIAssistantDashboard from '@/components/ai-assistant/AIAssistantDashboard';
import GeolocationSeoPhase from '@/components/phase5/GeolocationSeoPhase';
import QuoteRequestsTabSection from './QuoteRequestsTabSection';
import { NF203Dashboard } from '@/components/nf203';
import { useRepairerLegalInfo } from '@/hooks/useRepairerLegalInfo';
import { useAuth } from '@/hooks/useAuth';

interface Order {
  id: string;
  client: string;
  device: string;
  issue: string;
  status: string;
  priority: string;
  estimatedPrice: number;
}

interface Appointment {
  id: string;
  client: string;
  time: string;
  service: string;
  phone: string;
}

interface InventoryItem {
  id: string;
  part: string;
  stock: number;
  minStock: number;
  price: number;
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
  orders: Order[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  profileData: ProfileData;
  avgRepairTime: number;
  dashboardConfig?: any;
}

const RepairerDashboardTabs: React.FC<RepairerDashboardTabsProps> = ({
  activeTab,
  onTabChange,
  orders,
  appointments,
  inventory,
  profileData,
  avgRepairTime,
  dashboardConfig
}) => {
  const { user } = useAuth();
  const { data: legalInfo } = useRepairerLegalInfo(user?.id);
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-16">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Aperçu
        </TabsTrigger>
        <TabsTrigger value="quotes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Devis
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Commandes
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Planning
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Stock
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
        <TabsTrigger value="ecommerce" className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          E-commerce
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
        <TabsTrigger value="store" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Boutique
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
        <TabsTrigger value="geolocation-seo" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Géo & SEO
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <EnhancedDashboard
          orders={orders}
          appointments={appointments}
        />
      </TabsContent>

      <TabsContent value="quotes">
        <QuoteRequestsTabSection />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersTabSection orders={orders} />
      </TabsContent>

      <TabsContent value="calendar">
        <div className="space-y-6">
          <CalendarTabSection />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DayView
              selectedDate={new Date()}
              appointments={appointments.map(apt => ({
                id: apt.id,
                appointment_date: new Date().toISOString(),
                duration_minutes: 60,
                client_name: apt.client,
                service: apt.service,
                status: 'scheduled'
              }))}
              onAppointmentClick={(apt) => console.log('Appointment clicked:', apt)}
              onTimeSlotClick={(time) => console.log('Time slot clicked:', time)}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="inventory">
        <div className="space-y-6">
          <InventoryTabSection inventory={inventory} />
          <InventorySyncManager />
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

      <TabsContent value="ecommerce">
        <EcommerceInterface />
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

      <TabsContent value="store">
        <StoreCustomizer />
      </TabsContent>

      <TabsContent value="jarvis">
        <AIAssistantDashboard repairerId="demo-repairer-id" />
      </TabsContent>

      <TabsContent value="modules">
        <ModulesStore />
      </TabsContent>

      <TabsContent value="compliance">
        <div className="space-y-6">
          {user?.id && legalInfo?.siren && (
            <NF203Dashboard 
              repairerId={user.id} 
              siren={legalInfo.siren} 
            />
          )}
          <ComplianceModule />
          <AuditLogsViewer />
        </div>
      </TabsContent>

      <TabsContent value="billing">
        <BillingTabSection />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileTabSection profileData={profileData} />
      </TabsContent>

      <TabsContent value="geolocation-seo">
        <GeolocationSeoPhase />
      </TabsContent>
    </Tabs>
  );
};

export default RepairerDashboardTabs;