
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTabSection from "./OverviewTabSection";
import OrdersTabSection from "./OrdersTabSection";
import CalendarTabSection from "./CalendarTabSection";
import InventoryTabSection from "./InventoryTabSection";
import AnalyticsTabSection from "./AnalyticsTabSection";
import BillingTabSection from "./BillingTabSection";
import ProfileTabSection from "./ProfileTabSection";
import PricingTabSection from "./PricingTabSection";
import DayView from "./calendar/DayView";
import AdvancedAnalytics from "./analytics/AdvancedAnalytics";
import InventoryManagement from "./inventory/InventoryManagement";
import NotificationCenter from "./notifications/NotificationCenter";
import LoyaltyProgram from "./loyalty/LoyaltyProgram";
import { StoreFront } from "../ecommerce/StoreFront";

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
  demoModeEnabled: boolean;
}

const RepairerDashboardTabs: React.FC<RepairerDashboardTabsProps> = ({
  activeTab,
  onTabChange,
  orders,
  appointments,
  inventory,
  profileData,
  avgRepairTime,
  demoModeEnabled
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-11">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="orders">Commandes</TabsTrigger>
        <TabsTrigger value="calendar">Planning</TabsTrigger>
        <TabsTrigger value="inventory">Stock</TabsTrigger>
        <TabsTrigger value="pricing">Tarifs</TabsTrigger>
        <TabsTrigger value="boutique">Boutique</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
        <TabsTrigger value="billing">Facturation</TabsTrigger>
        <TabsTrigger value="profile">Profil</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTabSection
          orders={orders}
          appointments={appointments}
        />
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
        <InventoryManagement 
          inventory={inventory}
          demoModeEnabled={demoModeEnabled}
        />
      </TabsContent>

      <TabsContent value="pricing">
        <PricingTabSection />
      </TabsContent>

      <TabsContent value="boutique">
        <StoreFront />
      </TabsContent>

      <TabsContent value="analytics">
        <div className="space-y-6">
          <AnalyticsTabSection avgRepairTime={avgRepairTime} />
          <AdvancedAnalytics demoModeEnabled={demoModeEnabled} />
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationCenter demoModeEnabled={demoModeEnabled} />
      </TabsContent>

      <TabsContent value="loyalty">
        <LoyaltyProgram demoModeEnabled={demoModeEnabled} />
      </TabsContent>

      <TabsContent value="billing">
        <BillingTabSection />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileTabSection profileData={profileData} />
      </TabsContent>
    </Tabs>
  );
};

export default RepairerDashboardTabs;
