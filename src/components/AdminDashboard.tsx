import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Globe,
  Target,
  FileText,
  TrendingUp,
  Flag,
  Shield,
  Zap,
  Search
} from 'lucide-react';
import RepairerList from './admin/RepairerList';
import ScrapingDashboard from './admin/ScrapingDashboard';
import BlogAdmin from './blog/admin/BlogAdmin';
import RepairContentGenerator from './blog/admin/RepairContentGenerator';
import FeatureFlagAdmin from './admin/FeatureFlagAdmin';
import AuditLogAdmin from './admin/AuditLogAdmin';
import AdvancedAdvertisingDashboard from './advertising/AdvancedAdvertisingDashboard';
import PerformanceManagement from './admin/PerformanceManagement';
import SEOMonitoringDashboard from './admin/SEOMonitoringDashboard';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
      {icon}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .neq('role', 'admin');

        if (error) {
          console.error('Error fetching stats:', error);
          toast.error('Erreur lors du chargement des statistiques');
          return;
        }

        const repairerCount = data ? data.length : 0;
        setStats({ repairerCount });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'repairers', label: 'Réparateurs', icon: Users },
    { id: 'scraping', label: 'Scraping', icon: Globe },
    { id: 'advertising', label: 'Publicités', icon: Target },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'seo', label: 'SEO Monitoring', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'flags', label: 'Feature Flags', icon: Flag },
    { id: 'audit', label: 'Audit', icon: Shield }
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" className="ml-auto" onClick={handleSignOut}>
            Se déconnecter
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-shrink-0 min-w-[120px]">
                  <div className="flex flex-col items-center space-y-1">
                    {React.createElement(tab.icon, { className: "h-4 w-4" })}
                    <span className="text-xs whitespace-nowrap">{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <h2 className="text-2xl font-bold mb-4">Tableau de bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Nombre de réparateurs"
                value={stats?.repairerCount || 0}
                icon={<Users className="h-6 w-6 text-gray-500" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="repairers">
            <h2 className="text-2xl font-bold mb-4">Gestion des réparateurs</h2>
            <RepairerList />
          </TabsContent>

          <TabsContent value="scraping">
            <h2 className="text-2xl font-bold mb-4">Tableau de bord de Scraping</h2>
            <ScrapingDashboard />
          </TabsContent>

          <TabsContent value="advertising">
            <AdvancedAdvertisingDashboard />
          </TabsContent>

          <TabsContent value="blog">
            <h2 className="text-2xl font-bold mb-4">Gestion du Blog</h2>
            <Tabs defaultValue="management" className="space-y-4">
              <TabsList>
                <TabsTrigger value="management">Gestion classique</TabsTrigger>
                <TabsTrigger value="repair-generator">Générateur Réparation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="management">
                <BlogAdmin />
              </TabsContent>
              
              <TabsContent value="repair-generator">
                <RepairContentGenerator />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="seo">
            <h2 className="text-2xl font-bold mb-4">Monitoring SEO & Technique</h2>
            <SEOMonitoringDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <div>Contenu des analytics</div>
          </TabsContent>

          <TabsContent value="performance">
            <h2 className="text-2xl font-bold mb-4">Optimisation de Performance</h2>
            <PerformanceManagement />
          </TabsContent>

          <TabsContent value="flags">
            <h2 className="text-2xl font-bold mb-4">Feature Flags</h2>
            <FeatureFlagAdmin />
          </TabsContent>

          <TabsContent value="audit">
            <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
            <AuditLogAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
