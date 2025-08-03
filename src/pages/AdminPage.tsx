import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import AdminTopBar from '@/components/admin/modern/AdminTopBar';
import HorizontalAdminNav from '@/components/admin/modern/HorizontalAdminNav';
import ModernDashboardCards from '@/components/admin/modern/ModernDashboardCards';
import QuickActions from '@/components/admin/modern/QuickActions';
import RecentActivity from '@/components/admin/modern/RecentActivity';
import RepairerList from '@/components/admin/RepairerList';
import ClientInterestManagement from '@/components/ClientInterestManagement';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import RealScrapingDashboard from '@/components/admin/scraping/RealScrapingDashboard';
import AutomatedRelaunchDashboard from '@/components/admin/automation/AutomatedRelaunchDashboard';
import BlogManagement from '@/components/blog/admin/BlogManagement';
import ChatbotManagement from '@/components/admin/ChatbotManagement';
import AdminAuthForm from '@/components/AdminAuthForm';
import { useAuth } from '@/hooks/useAuth';
import AdvancedAdvertisingDashboard from '@/components/advertising/AdvancedAdvertisingDashboard';
import SubscriptionsManagement from '@/components/admin/SubscriptionsManagement';
import SubdomainsManagement from '@/components/admin/SubdomainsManagement';
import LandingPagesManagement from '@/components/admin/landing-pages/LandingPagesManagement';
import AdminPOSManagement from '@/components/admin/AdminPOSManagement';
import AdminEcommerceManagement from '@/components/admin/AdminEcommerceManagement';
import LocalSeoManagement from '@/components/admin/LocalSeoManagement';
import SEOMonitoringDashboard from '@/components/admin/SEOMonitoringDashboard';
import RepairContentGenerator from '@/components/blog/admin/RepairContentGenerator';
import PerformanceManagement from '@/components/admin/PerformanceManagement';
import EnhancedDocumentationManager from '@/components/admin/EnhancedDocumentationManager';
import { AdvertisingAIDashboard } from '@/components/admin/advertising/AdvertisingAIDashboard';
import { AnalyticsDashboard } from '@/components/admin/dashboard/AnalyticsDashboard';
import AdminFeaturesManager from '@/components/admin/AdminFeaturesManager';
import AdminConfigurationPage from '@/components/admin/AdminConfigurationPage';
import ComprehensiveFeaturesManager from '@/components/admin/ComprehensiveFeaturesManager';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor } from 'lucide-react';
import { CheckmateMonitoring } from '@/components/admin/monitoring/CheckmateMonitoring';
import StaticPagesManager from '@/components/admin/StaticPagesManager';
import RealTimeQuotesManager from '@/components/admin/quotes/RealTimeQuotesManager';
import CatalogManagement from '@/components/admin/catalog/CatalogManagement';
import { EnhancedPlanVisualizationTester } from '@/components/admin/plans/EnhancedPlanVisualizationTester';
import { EnhancedDashboardTester } from '@/components/admin/dashboard/EnhancedDashboardTester';
import { EnhancedPOSTester } from '@/components/admin/pos/EnhancedPOSTester';
import { EnhancedEcommerceTester } from '@/components/admin/ecommerce/EnhancedEcommerceTester';
import SystemOptimizationPanel from '@/components/admin/system/SystemOptimizationPanel';
import { SuppliersDirectoryManagement } from '@/components/admin/SuppliersDirectoryManagement';

const AdminPage = () => {
  const {
    user,
    profile,
    isAdmin,
    loading
  } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Si on est en cours de chargement, afficher un loading optimisé
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>;
  }

  // Si pas d'utilisateur ou pas admin, afficher le formulaire de connexion
  if (!user || !isAdmin) {
    return <AdminAuthForm />;
  }
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Administrateur';
      case 'subscriptions':
        return 'Gestion Abonnements';
      case 'subdomains':
        return 'Sous-domaines';
      case 'landing-pages':
        return 'Landing Pages';
      case 'repairers':
        return 'Réparateurs';
      case 'quotes':
        return 'Gestion des Devis';
      case 'catalog':
        return 'Catalogue Produits';
      case 'interest':
        return 'Demandes d\'intérêt';
      case 'promocodes':
        return 'Codes Promo';
      case 'advertising':
        return 'Publicités';
      case 'advertising-ai':
        return 'Publicité IA';
      case 'analytics':
        return 'Analytics';
      case 'scraping':
        return 'Scraping';
      case 'automation':
        return 'Relances Automatiques';
      case 'monitoring':
        return 'Monitoring Checkmate';
      case 'blog':
        return 'Blog & Contenu';
      case 'chatbot':
        return 'Chatbot';
      case 'pos-admin':
        return 'Administration POS';
      case 'ecommerce-admin':
        return 'E-commerce';
      case 'local-seo':
        return 'SEO Local';
      case 'seo-monitoring':
        return 'Monitoring SEO';
      case 'repair-generator':
        return 'Générateur Contenu';
      case 'pagespeed-pro':
        return 'PageSpeed Pro';
      case 'performance':
        return 'Performance';
      case 'documentation':
        return 'Documentation';
      case 'features-manager':
        return 'Gestion Fonctionnalités';
      case 'plans-tester':
        return 'Test Interface Plans';
      case 'dashboard-tester':
        return 'Test Interface Réparateur';
      case 'pos-tester':
        return 'Test Interface POS';
      case 'configuration':
        return 'Configuration';
      case 'suppliers':
        return 'Annuaire Fournisseurs';
      default:
        return 'Dashboard';
    }
  };
  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Vue d\'ensemble de la plateforme RepairHub';
      case 'subscriptions':
        return 'Gestion des abonnements réparateurs';
      case 'subdomains':
        return 'Configuration des sous-domaines et landing pages';
      case 'landing-pages':
        return 'Création et gestion des landing pages personnalisées';
      case 'repairers':
        return 'Liste et gestion des réparateurs';
      case 'quotes':
        return 'Suivi et modération des demandes de devis clients';
      case 'catalog':
        return 'Gestion du catalogue de la recherche en 5 étapes (types, marques, modèles, réparations)';
      case 'interest':
        return 'Demandes d\'intérêt clients';
      case 'promocodes':
        return 'Codes de réduction et promotions';
      case 'advertising':
        return 'Bannières publicitaires';
      case 'advertising-ai':
        return 'Campagnes publicitaires intelligentes avec IA';
      case 'analytics':
        return 'Analyses détaillées et métriques de performance';
      case 'scraping':
        return 'Outils de collecte de données';
      case 'automation':
        return 'Système automatisé de relance client et réactivation des comptes inactifs';
      case 'monitoring':
        return 'Surveillance uptime, performance et métriques business exclusives';
      case 'blog':
        return 'Gestion du contenu éditorial';
      case 'chatbot':
        return 'Administration et configuration de l\'assistant intelligent';
      case 'pos-admin':
        return 'Administration des systèmes POS';
      case 'ecommerce-admin':
        return 'Administration des boutiques e-commerce';
      case 'local-seo':
        return 'Génération automatique de pages SEO locales optimisées';
      case 'seo-monitoring':
        return 'Monitoring SEO et surveillance technique en temps réel';
      case 'repair-generator':
        return 'Générateur de contenu pour réparation mobile';
      case 'pagespeed-pro':
        return 'Analyses PageSpeed avancées et optimisation performance';
      case 'performance':
        return 'Optimisation et surveillance des performances globales';
      case 'documentation':
        return 'Gestion de la documentation technique et utilisateur';
      case 'features-manager':
        return 'Gestionnaire centralisé de toutes les fonctionnalités et modules';
      case 'plans-tester':
        return 'Interface de test et configuration pour l\'affichage des plans réparateurs';
      case 'dashboard-tester':
        return 'Interface de test et configuration pour le tableau de bord réparateur';
      case 'pos-tester':
        return 'Interface de test et configuration pour le système de point de vente';
      case 'configuration':
        return 'Configuration générale de l\'application';
      case 'suppliers':
        return 'Gestion de l\'annuaire des fournisseurs et modération des avis';
      case 'static-pages':
        return 'Gestion des pages statiques (mentions légales, CGU, etc.)';
      default:
        return 'Administration de RepairHub';
    }
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Modern Dashboard Overview */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Vue d'ensemble de votre plateforme RepairHub</p>
              </div>
              
              {/* Stats Cards */}
              <ModernDashboardCards />
              
              {/* Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity />
                <QuickActions />
              </div>
            </div>
          </div>
        );
      case 'subscriptions':
        return <SubscriptionsManagement />;
      case 'subdomains':
        return <SubdomainsManagement />;
      case 'landing-pages':
        return <LandingPagesManagement />;
      case 'repairers':
        return <RepairerList />;
      case 'quotes':
        return <RealTimeQuotesManager />;
      case 'catalog':
        return <CatalogManagement />;
      case 'interest':
        return <ClientInterestManagement />;
      case 'promocodes':
        return <PromoCodesManagement />;
      case 'advertising':
        return <AdvancedAdvertisingDashboard />;
      case 'advertising-ai':
        return <AdvertisingAIDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
        case 'scraping':
          return <RealScrapingDashboard />;
        case 'automation':
          return <AutomatedRelaunchDashboard />;
      case 'monitoring':
        return <CheckmateMonitoring />;
      case 'blog':
        return <BlogManagement />;
      case 'chatbot':
        return <ChatbotManagement />;
      case 'pos-admin':
        return <AdminPOSManagement />;
      case 'ecommerce-admin':
        return <EnhancedEcommerceTester />;
      case 'local-seo':
        return <LocalSeoManagement />;
      case 'seo-monitoring':
        return <SEOMonitoringDashboard />;
      case 'repair-generator':
        return <RepairContentGenerator />;
      case 'pagespeed-pro':
        return <Card>
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
          </Card>;
      case 'performance':
        return <PerformanceManagement />;
      case 'documentation':
        return <EnhancedDocumentationManager />;
      case 'features-manager':
        return <ComprehensiveFeaturesManager />;
      case 'plans-tester':
        return <EnhancedPlanVisualizationTester />;
      case 'dashboard-tester':
        return <EnhancedDashboardTester />;
      case 'pos-tester':
        return <EnhancedPOSTester />;
      case 'configuration':
        return <AdminConfigurationPage />;
      case 'static-pages':
        return <StaticPagesManager />;
      case 'suppliers':
        return <SuppliersDirectoryManagement />;
      case 'system-optimization':
        return <SystemOptimizationPanel />;
      default:
        return <AdminDashboardContent activeTab={activeTab} subscriptions={[]} repairers={[]} onViewProfile={() => {}} onRefresh={async () => {}} />;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <AdminTopBar userName={user?.email || 'Admin'} />
      <HorizontalAdminNav />
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};
export default AdminPage;