import React, { Suspense, lazy, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AdminReauthGate } from '@/components/admin/security/AdminReauthGate';
import AdminAuthForm from '@/components/AdminAuthForm';

// Eager : navigation + dashboard initial (rendu de FCP admin)
import AdminTopBar from '@/components/admin/modern/AdminTopBar';
import HorizontalAdminNav from '@/components/admin/modern/HorizontalAdminNav';
import ModernDashboardCards from '@/components/admin/modern/ModernDashboardCards';
import QuickActions from '@/components/admin/modern/QuickActions';
import RecentActivity from '@/components/admin/modern/RecentActivity';

// Lazy : un chunk par tab (chargé à la demande). Permet de descendre
// le chunk principal AdminPage de ~2.7 MB à <500 KB.
const SubscriptionsManagement = lazy(() => import('@/components/admin/SubscriptionsManagement'));
const SubdomainsManagement = lazy(() => import('@/components/admin/SubdomainsManagement'));
const LandingPagesManagement = lazy(() => import('@/components/admin/landing-pages/LandingPagesManagement'));
const RepairerList = lazy(() => import('@/components/admin/RepairerList'));
const CatalogManagement = lazy(() => import('@/components/admin/catalog/CatalogManagement'));
const ClientInterestManagement = lazy(() => import('@/components/ClientInterestManagement'));
const AdvancedAdvertisingDashboard = lazy(() => import('@/components/advertising/AdvancedAdvertisingDashboard'));
const AdvertisingAIDashboard = lazy(() =>
  import('@/components/admin/advertising/AdvertisingAIDashboard').then((m) => ({ default: m.AdvertisingAIDashboard })),
);
const AnalyticsDashboard = lazy(() =>
  import('@/components/admin/dashboard/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard })),
);
const ScrapingHub = lazy(() => import('@/components/admin/scraping/ScrapingHub'));
const AutomatedRelaunchDashboard = lazy(() => import('@/components/admin/automation/AutomatedRelaunchDashboard'));
const CheckmateMonitoring = lazy(() =>
  import('@/components/admin/monitoring/CheckmateMonitoring').then((m) => ({ default: m.CheckmateMonitoring })),
);
const BlogManagement = lazy(() => import('@/components/blog/admin/BlogManagement'));
const SocialBoosterDashboard = lazy(() => import('@/components/admin/social-booster/SocialBoosterDashboard'));
const ChatbotManagement = lazy(() => import('@/components/admin/ChatbotManagement'));
const LocalSeoManagement = lazy(() => import('@/components/admin/LocalSeoManagement'));
const SeoToolsPanel = lazy(() => import('@/components/admin/SeoToolsPanel'));
const RepairerSeoPanel = lazy(() => import('@/components/admin/RepairerSeoPanel'));
const SEOMonitoringDashboard = lazy(() => import('@/components/admin/SEOMonitoringDashboard'));
const RepairContentGenerator = lazy(() => import('@/components/blog/admin/RepairContentGenerator'));
const PerformanceManagement = lazy(() => import('@/components/admin/PerformanceManagement'));
const EnhancedDocumentationManager = lazy(() => import('@/components/admin/EnhancedDocumentationManager'));
const ComprehensiveFeaturesManager = lazy(() => import('@/components/admin/ComprehensiveFeaturesManager'));
const EnhancedPlanVisualizationTester = lazy(() =>
  import('@/components/admin/plans/EnhancedPlanVisualizationTester').then((m) => ({ default: m.EnhancedPlanVisualizationTester })),
);
const EnhancedDashboardTester = lazy(() =>
  import('@/components/admin/dashboard/EnhancedDashboardTester').then((m) => ({ default: m.EnhancedDashboardTester })),
);
const AdminConfigurationPage = lazy(() => import('@/components/admin/AdminConfigurationPage'));
const StaticPagesManager = lazy(() => import('@/components/admin/StaticPagesManager'));
const SuppliersDirectoryManagement = lazy(() =>
  import('@/components/admin/SuppliersDirectoryManagement').then((m) => ({ default: m.SuppliersDirectoryManagement })),
);
const SystemOptimizationPanel = lazy(() => import('@/components/admin/system/SystemOptimizationPanel'));
const SystemDiagnosticsPanel = lazy(() =>
  import('@/components/admin/SystemDiagnosticsPanel').then((m) => ({ default: m.SystemDiagnosticsPanel })),
);
const ChatbotPerformancePanel = lazy(() => import('@/components/admin/ChatbotPerformancePanel'));
const ExclusivityZonesAdmin = lazy(() =>
  import('@/components/admin/exclusivity').then((m) => ({ default: m.ExclusivityZonesAdmin })),
);
const AiCmoDashboard = lazy(() =>
  import('@/components/admin/ai-cmo').then((m) => ({ default: m.AiCmoDashboard })),
);
const AdminSeoProgrammaticPanel = lazy(() =>
  import('@/components/admin/seo').then((m) => ({ default: m.AdminSeoProgrammaticPanel })),
);
const AdminSeoMachinePanel = lazy(() =>
  import('@/components/admin/seo').then((m) => ({ default: m.AdminSeoMachinePanel })),
);

const TabFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const VALID_TABS = [
  'dashboard', 'subscriptions', 'subdomains', 'landing-pages', 'repairers',
  'catalog', 'interest', 'advertising', 'advertising-ai', 'analytics',
  'scraping', 'automation', 'monitoring', 'blog', 'social-booster', 'chatbot',
  'local-seo', 'seo-tools', 'repairer-seo', 'seo-monitoring', 'repair-generator',
  'pagespeed-pro', 'performance', 'documentation', 'features-manager',
  'plans-tester', 'dashboard-tester', 'configuration', 'suppliers',
  'static-pages', 'system-diagnostics', 'system-optimization',
  'chatbot-performance', 'exclusivity-zones', 'seo-programmatic',
  'seo-machine', 'ai-cmo',
];

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (!currentTab) {
      const lastTab = sessionStorage.getItem('lastAdminTab') || 'dashboard';
      setSearchParams({ tab: lastTab }, { replace: true });
    } else if (!VALID_TABS.includes(currentTab)) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (activeTab && VALID_TABS.includes(activeTab)) {
      sessionStorage.setItem('lastAdminTab', activeTab);
    }
  }, [activeTab]);

  const handleVerified = () => {
    const lastTab = sessionStorage.getItem('lastAdminTab');
    const currentTab = searchParams.get('tab');
    if (!currentTab && lastTab) {
      setSearchParams({ tab: lastTab }, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminAuthForm onSuccess={() => navigate('/admin')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Vue d'ensemble de votre plateforme TopRéparateurs</p>
              </div>
              <ModernDashboardCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity />
                <QuickActions />
              </div>
            </div>
          </div>
        );
      case 'subscriptions': return <SubscriptionsManagement />;
      case 'subdomains': return <SubdomainsManagement />;
      case 'landing-pages': return <LandingPagesManagement />;
      case 'repairers': return <RepairerList />;
      case 'catalog': return <CatalogManagement />;
      case 'interest': return <ClientInterestManagement />;
      case 'advertising': return <AdvancedAdvertisingDashboard />;
      case 'advertising-ai': return <AdvertisingAIDashboard />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'scraping': return <ScrapingHub />;
      case 'automation': return <AutomatedRelaunchDashboard />;
      case 'monitoring': return <CheckmateMonitoring />;
      case 'blog': return <BlogManagement />;
      case 'social-booster': return <SocialBoosterDashboard />;
      case 'chatbot': return <ChatbotManagement />;
      case 'local-seo': return <LocalSeoManagement />;
      case 'seo-tools': return <SeoToolsPanel />;
      case 'repairer-seo': return <RepairerSeoPanel />;
      case 'seo-monitoring': return <SEOMonitoringDashboard />;
      case 'repair-generator': return <RepairContentGenerator />;
      case 'pagespeed-pro':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold">Analyses PageSpeed Avancées</h3>
                  <p className="text-muted-foreground">Monitoring des performances en temps réel</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">95</div>
                    <div className="text-sm text-muted-foreground">Score Mobile</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">98</div>
                    <div className="text-sm text-muted-foreground">Score Desktop</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">0.8s</div>
                    <div className="text-sm text-muted-foreground">LCP Moyen</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        );
      case 'performance': return <PerformanceManagement />;
      case 'documentation': return <EnhancedDocumentationManager />;
      case 'features-manager': return <ComprehensiveFeaturesManager />;
      case 'plans-tester': return <EnhancedPlanVisualizationTester />;
      case 'dashboard-tester': return <EnhancedDashboardTester />;
      case 'configuration': return <AdminConfigurationPage />;
      case 'static-pages': return <StaticPagesManager />;
      case 'suppliers': return <SuppliersDirectoryManagement />;
      case 'system-optimization': return <SystemOptimizationPanel />;
      case 'system-diagnostics': return <SystemDiagnosticsPanel />;
      case 'chatbot-performance': return <ChatbotPerformancePanel />;
      case 'exclusivity-zones': return <ExclusivityZonesAdmin />;
      case 'ai-cmo': return <AiCmoDashboard />;
      case 'seo-programmatic': return <AdminSeoProgrammaticPanel />;
      case 'seo-machine': return <AdminSeoMachinePanel />;
      default:
        return (
          <div className="p-6 text-center text-muted-foreground">
            Onglet inconnu : {activeTab}
          </div>
        );
    }
  };

  return (
    <AdminReauthGate onVerified={handleVerified}>
      <div className="min-h-screen bg-background">
        <AdminTopBar userName={user?.email || 'Admin'} />
        <HorizontalAdminNav />
        <main className="p-6">
          <Suspense fallback={<TabFallback />}>{renderContent()}</Suspense>
        </main>
      </div>
    </AdminReauthGate>
  );
};

export default AdminPage;
