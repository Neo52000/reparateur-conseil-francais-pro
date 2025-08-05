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
import { useAuth } from '@/hooks/useSimpleAuth';
import { handleAuthError } from '@/services/errorHandlingService';
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
import WeatherDashboard from '@/components/admin/weather/WeatherDashboard';
import { CheckmateMonitoring } from '@/components/admin/monitoring/CheckmateMonitoring';
import StaticPagesManager from '@/components/admin/StaticPagesManager';
import RealTimeQuotesManager from '@/components/admin/quotes/RealTimeQuotesManager';
import CatalogManagement from '@/components/admin/catalog/CatalogManagement';
import { EnhancedPlanVisualizationTester } from '@/components/admin/plans/EnhancedPlanVisualizationTester';
import { EnhancedDashboardTester } from '@/components/admin/dashboard/EnhancedDashboardTester';
import { EnhancedPOSTester } from '@/components/admin/pos/EnhancedPOSTester';
import { EnhancedEcommerceTester } from '@/components/admin/ecommerce/EnhancedEcommerceTester';
import SystemOptimizationPanel from '@/components/admin/system/SystemOptimizationPanel';
import SuppliersManagementTab from '@/components/admin/suppliers/SuppliersManagementTab';
import FeatureFlagsToggle from '@/components/admin/FeatureFlagsToggle';
import ModuleDisabledMessage from '@/components/admin/ModuleDisabledMessage';
import PageBuilderPage from '@/pages/admin/PageBuilderPage';
import { APP_CONFIG } from '@/config';

const AdminPage = () => {
  const {
    user,
    profile,
    isAdmin,
    loading
  } = useAuth();

  // Debugging complet de l'état d'authentification
  console.log('🔍 AdminPage Auth State:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, email: profile.email, role: profile.role } : null,
    isAdmin,
    loading,
    timestamp: new Date().toISOString()
  });
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
    console.log('🚫 AdminPage: Access denied', { hasUser: !!user, isAdmin });
    return <AdminAuthForm />;
  }

  console.log('✅ AdminPage: Access granted to admin interface');
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
      case 'weather':
        return 'Météo Chaumont';
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
        return APP_CONFIG.features.enableSuppliersDirectory ? 'Annuaire Fournisseurs' : 'Module Désactivé';
      case 'page-builder':
        return 'Constructeur de Pages';
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
      case 'weather':
        return 'Données météorologiques en temps réel pour Chaumont';
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
      case 'feature-flags':
        return 'Gestion des feature flags et modules actifs/inactifs';
      case 'suppliers':
        return APP_CONFIG.features.enableSuppliersDirectory 
          ? 'Gestion de l\'annuaire des fournisseurs et modération des avis'
          : 'Module fournisseurs temporairement désactivé pour diagnostic';
      case 'static-pages':
        return 'Gestion des pages statiques (mentions légales, CGU, etc.)';
      case 'page-builder':
        return 'Créez et modifiez facilement vos pages avec un constructeur visuel simple';
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
        return APP_CONFIG.features.enableAdvertisingAI ? (
          <AdvertisingAIDashboard />
        ) : (
          <ModuleDisabledMessage module="Publicité IA" description="Module publicité IA désactivé pour diagnostic" />
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'weather':
        return APP_CONFIG.features.enableWeatherModule ? (
          <WeatherDashboard />
        ) : (
          <ModuleDisabledMessage module="Météo" description="Module météorologique désactivé pour diagnostic" />
        );
        case 'scraping':
          return APP_CONFIG.features.enableScrapingModule ? (
            <RealScrapingDashboard />
          ) : (
            <ModuleDisabledMessage module="Scraping" description="Module scraping désactivé pour diagnostic" />
          );
        case 'automation':
          return APP_CONFIG.features.enableAutomationModule ? (
            <AutomatedRelaunchDashboard />
          ) : (
            <ModuleDisabledMessage module="Automatisation" description="Module automatisation désactivé pour diagnostic" />
          );
      case 'monitoring':
        return APP_CONFIG.features.enableMonitoringModule ? (
          <CheckmateMonitoring />
        ) : (
          <ModuleDisabledMessage module="Monitoring" description="Module monitoring désactivé pour diagnostic" />
        );
      case 'blog':
        return APP_CONFIG.features.enableBlogModule ? (
          <BlogManagement />
        ) : (
          <ModuleDisabledMessage module="Blog" description="Module blog & contenu désactivé pour diagnostic" />
        );
      case 'chatbot':
        return APP_CONFIG.features.enableChatbotModule ? (
          <ChatbotManagement />
        ) : (
          <ModuleDisabledMessage module="Chatbot" description="Module chatbot IA désactivé pour diagnostic" />
        );
      case 'pos-admin':
        return APP_CONFIG.features.enablePOSModule ? (
          <AdminPOSManagement />
        ) : (
          <ModuleDisabledMessage module="POS" description="Module point de vente désactivé pour diagnostic" />
        );
      case 'ecommerce-admin':
        return APP_CONFIG.features.enableEcommerceModule ? (
          <EnhancedEcommerceTester />
        ) : (
          <ModuleDisabledMessage module="E-commerce" description="Module e-commerce désactivé pour diagnostic" />
        );
      case 'local-seo':
        return APP_CONFIG.features.enableSEOModule ? (
          <LocalSeoManagement />
        ) : (
          <ModuleDisabledMessage module="SEO Local" description="Module SEO local désactivé pour diagnostic" />
        );
      case 'seo-monitoring':
        return APP_CONFIG.features.enableSEOModule ? (
          <SEOMonitoringDashboard />
        ) : (
          <ModuleDisabledMessage module="SEO Monitoring" description="Module SEO monitoring désactivé pour diagnostic" />
        );
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
        return APP_CONFIG.features.enablePlansTester ? (
          <EnhancedPlanVisualizationTester />
        ) : (
          <ModuleDisabledMessage module="Plans Tester" description="Module test plans désactivé" />
        );
      case 'dashboard-tester':
        return APP_CONFIG.features.enableDashboardTester ? (
          <EnhancedDashboardTester />
        ) : (
          <ModuleDisabledMessage module="Dashboard Tester" description="Module test dashboard désactivé" />
        );
      case 'pos-tester':
        return APP_CONFIG.features.enablePOSTester ? (
          <EnhancedPOSTester />
        ) : (
          <ModuleDisabledMessage module="POS Tester" description="Module test POS désactivé" />
        );
      case 'configuration':
        return <AdminConfigurationPage />;
      case 'feature-flags':
        return <FeatureFlagsToggle />;
      case 'static-pages':
        return <StaticPagesManager />;
      case 'suppliers':
        return APP_CONFIG.features.enableSuppliersDirectory ? (
          <SuppliersManagementTab />
        ) : (
          <ModuleDisabledMessage module="Fournisseurs" description="Module annuaire fournisseurs désactivé pour diagnostic" />
        );
      case 'system-optimization':
        return <SystemOptimizationPanel />;
      case 'page-builder':
        return <PageBuilderPage />;
      default:
        return <AdminDashboardContent activeTab={activeTab} subscriptions={[]} repairers={[]} onViewProfile={() => {}} onRefresh={async () => {}} />;
    }
  };
  const handleNewAction = () => {
    switch (activeTab) {
      case 'quotes':
        // Ouvrir modal de création de devis
        window.dispatchEvent(new CustomEvent('admin:create-quote'));
        break;
      case 'repairers':
        // Rediriger vers inscription réparateur
        window.open('/repairer-auth', '_blank');
        break;
      case 'blog':
        // Créer nouveau post de blog
        window.dispatchEvent(new CustomEvent('admin:new-blog-post'));
        break;
      default:
        window.open('/', '_blank');
        break;
    }
  };

  const handleVisitAction = () => {
    switch (activeTab) {
      case 'quotes':
        // Visiter page de demande de devis
        window.open('/search', '_blank');
        break;
      case 'repairers':
        // Visiter page réparateurs
        window.open('/search', '_blank');
        break;
      case 'blog':
        // Visiter le blog
        window.open('/blog', '_blank');
        break;
      default:
        // Visiter la page d'accueil
        window.open('/', '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminTopBar 
        userName={user?.email || 'Admin'} 
        onNewAction={handleNewAction}
        onVisitAction={handleVisitAction}
      />
      <HorizontalAdminNav activeTab={activeTab} />
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};
export default AdminPage;