import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import RepairerList from '@/components/admin/RepairerList';
import ClientInterestManagement from '@/components/ClientInterestManagement';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import EnhancedScrapingHub from '@/components/scraping/EnhancedScrapingHub';
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
import { RepairersAnalytics } from '@/components/admin/analytics/RepairersAnalytics';
import AdminFeaturesManager from '@/components/admin/AdminFeaturesManager';
import AdminConfigurationPage from '@/components/admin/AdminConfigurationPage';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

const AdminPage = () => {
  console.log('🔄 AdminPage - Starting render');
  
  try {
    const { user, profile, isAdmin, loading } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    console.log('🔍 AdminPage - Auth state:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      isAdmin,
      loading
    });

    // Si on est en cours de chargement, afficher un loading
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification des permissions...</p>
          </div>
        </div>
      );
    }

    // Si pas d'utilisateur connecté ou pas admin, afficher le formulaire de connexion
    if (!user || !isAdmin) {
      console.log('🚫 AdminPage: User not admin - showing admin auth form');
      return <AdminAuthForm />;
    }

    console.log('✅ AdminPage: Admin access granted');

    const getPageTitle = () => {
      switch (activeTab) {
        case 'dashboard': return 'Dashboard';
        case 'subscriptions': return 'Abonnements';
        case 'subdomains': return 'Sous-domaines';
        case 'landing-pages': return 'Landing Pages';
        case 'repairers': return 'Réparateurs';
        case 'interest': return 'Demandes d\'intérêt';
        case 'promocodes': return 'Codes promo';
        case 'advertising': return 'Publicités';
        case 'advertising-ai': return 'Publicité IA';
        case 'analytics': return 'Analytics';
        case 'scraping': return 'Scraping';
        case 'blog': return 'Blog';
        case 'chatbot': return 'Chatbot IA';
        case 'pos-admin': return 'POS Admin';
        case 'ecommerce-admin': return 'E-commerce Admin';
        case 'local-seo': return 'SEO Local';
        case 'seo-monitoring': return 'SEO Monitoring';
        case 'repair-generator': return 'Générateur Mobile';
        case 'pagespeed-pro': return 'PageSpeed Pro';
        case 'performance': return 'Performance';
        case 'documentation': return 'Documentation';
        case 'features-manager': return 'Gestion Fonctionnalités';
        default: return 'Dashboard';
      }
    };

    const getPageSubtitle = () => {
      switch (activeTab) {
        case 'dashboard': return 'Vue d\'ensemble de la plateforme RepairHub';
        case 'subscriptions': return 'Gestion des abonnements réparateurs';
        case 'subdomains': return 'Configuration des sous-domaines et landing pages';
        case 'landing-pages': return 'Création et gestion des landing pages personnalisées';
        case 'repairers': return 'Liste et gestion des réparateurs';
        case 'interest': return 'Demandes d\'intérêt clients';
        case 'promocodes': return 'Codes de réduction et promotions';
        case 'advertising': return 'Banières publicitaires';
        case 'advertising-ai': return 'Campagnes publicitaires intelligentes avec IA';
        case 'analytics': return 'Analyses détaillées et métriques de performance';
        case 'scraping': return 'Outils de collecte de données';
        case 'blog': return 'Gestion du contenu éditorial';
        case 'chatbot': return 'Administration et configuration de l\'assistant intelligent';
        case 'pos-admin': return 'Administration des systèmes POS';
        case 'ecommerce-admin': return 'Administration des boutiques e-commerce';
        case 'local-seo': return 'Génération automatique de pages SEO locales optimisées';
        case 'seo-monitoring': return 'Monitoring SEO et surveillance technique en temps réel';
        case 'repair-generator': return 'Générateur de contenu pour réparation mobile';
        case 'pagespeed-pro': return 'Analyses PageSpeed avancées et optimisation performance';
        case 'performance': return 'Optimisation et surveillance des performances globales';
        case 'documentation': return 'Gestion de la documentation technique et utilisateur';
        case 'features-manager': return 'Gestionnaire centralisé de toutes les fonctionnalités et modules';
        default: return 'Administration de RepairHub';
      }
    };

    const renderContent = () => {
      if (activeTab === 'dashboard') {
        return (
          <AdminDashboardContent 
            activeTab={activeTab}
            subscriptions={[]}
            repairers={[]}
            onViewProfile={() => {}}
            onRefresh={async () => {}}
          />
        );
      }

      if (activeTab === 'subscriptions') {
        return <SubscriptionsManagement />;
      }

      if (activeTab === 'subdomains') {
        return <SubdomainsManagement />;
      }

      if (activeTab === 'landing-pages') {
        return <LandingPagesManagement />;
      }

      if (activeTab === 'repairers') {
        return <RepairerList />;
      }

      if (activeTab === 'interest') {
        return <ClientInterestManagement />;
      }

      if (activeTab === 'promocodes') {
        return <PromoCodesManagement />;
      }

      if (activeTab === 'advertising') {
        return <AdvancedAdvertisingDashboard />;
      }

      if (activeTab === 'advertising-ai') {
        return <AdvertisingAIDashboard />;
      }

      if (activeTab === 'analytics') {
        return <RepairersAnalytics />;
      }

      if (activeTab === 'scraping') {
        return <EnhancedScrapingHub />;
      }

      if (activeTab === 'blog') {
        return <BlogManagement />;
      }

      if (activeTab === 'chatbot') {
        return <ChatbotManagement />;
      }

      if (activeTab === 'pos-admin') {
        return <AdminPOSManagement />;
      }

      if (activeTab === 'ecommerce-admin') {
        return <AdminEcommerceManagement />;
      }

      if (activeTab === 'local-seo') {
        return <LocalSeoManagement />;
      }

      if (activeTab === 'seo-monitoring') {
        return <SEOMonitoringDashboard />;
      }

      if (activeTab === 'repair-generator') {
        return <RepairContentGenerator />;
      }

      if (activeTab === 'pagespeed-pro') {
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
                    <div className="text-2xl font-bold text-green-600">87</div>
                    <div className="text-sm text-muted-foreground">Score Mobile</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">92</div>
                    <div className="text-sm text-muted-foreground">Score Desktop</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">1.2s</div>
                    <div className="text-sm text-muted-foreground">LCP Moyen</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        );
      }

      if (activeTab === 'performance') {
        return <PerformanceManagement />;
      }

      if (activeTab === 'documentation') {
        return <EnhancedDocumentationManager />;
      }

      if (activeTab === 'features-manager') {
        return <AdminFeaturesManager />;
      }

      if (activeTab === 'configuration') {
        return <AdminConfigurationPage />;
      }

      // Default dashboard avec données simplifiées
      return (
        <AdminDashboardContent 
          activeTab={activeTab}
          subscriptions={[]}
          repairers={[]}
          onViewProfile={() => {}}
          onRefresh={async () => {}}
        />
      );
    };

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex h-screen bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">{getPageTitle()}</h1>
                <p className="text-muted-foreground">{getPageSubtitle()}</p>
              </div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans AdminPage:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-4">Une erreur s'est produite lors du chargement de la page d'administration.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

export default AdminPage;