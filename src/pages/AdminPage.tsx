
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardOverview from '@/components/admin/DashboardOverview';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import RepairersTable from '@/components/repairers/RepairersTable';
import ClientInterestManagement from '@/components/ClientInterestManagement';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import AdBannerManagement from '@/components/advertising/AdBannerManagement';
import EnhancedScrapingHub from '@/components/scraping/EnhancedScrapingHub';
import BlogManagement from '@/components/blog/admin/BlogManagement';
import ChatbotManagement from '@/components/admin/ChatbotManagement';
import AdminAuthForm from '@/components/AdminAuthForm';
import { useAuth } from '@/hooks/useAuth';
import { useRepairersData } from '@/hooks/useRepairersData';

const AdminPage = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { subscriptions, repairers, loading: dataLoading, stats, fetchData } = useRepairersData();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté ou pas admin, afficher le formulaire de connexion
  if (!user || !isAdmin || profile?.role !== 'admin') {
    console.log('🚫 AdminPage: User not admin - showing admin auth form');
    return <AdminAuthForm />;
  }

  console.log('✅ AdminPage: Admin access granted');

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'subscriptions': return 'Abonnements';
      case 'repairers': return 'Réparateurs';
      case 'interest': return 'Demandes d\'intérêt';
      case 'promocodes': return 'Codes promo';
      case 'advertising': return 'Publicités';
      case 'scraping': return 'Scraping';
      case 'blog': return 'Blog';
      case 'chatbot': return 'Chatbot IA';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Vue d\'ensemble de la plateforme RepairHub';
      case 'subscriptions': return 'Gestion des abonnements réparateurs';
      case 'repairers': return 'Liste et gestion des réparateurs';
      case 'interest': return 'Demandes d\'intérêt clients';
      case 'promocodes': return 'Codes de réduction et promotions';
      case 'advertising': return 'Banières publicitaires';
      case 'scraping': return 'Outils de collecte de données';
      case 'blog': return 'Gestion du contenu éditorial';
      case 'chatbot': return 'Administration et configuration de l\'assistant intelligent';
      default: return 'Administration de RepairHub';
    }
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <DashboardOverview 
          stats={{
            totalRepairers: stats?.totalRepairers || 0,
            totalSubscriptions: stats?.totalSubscriptions || 0,
            totalInterests: stats?.totalInterests || 0,
            revenue: stats?.totalRevenue || 0
          }}
        />
      );
    }

    if (activeTab === 'subscriptions') {
      return (
        <AdminDashboardContent 
          activeTab="subscriptions"
          subscriptions={subscriptions}
          repairers={repairers}
          onViewProfile={() => {}}
          onRefresh={fetchData}
        />
      );
    }

    if (activeTab === 'repairers') {
      return (
        <RepairersTable
          repairers={repairers}
          onViewProfile={() => {}}
          onRefresh={fetchData}
        />
      );
    }

    if (activeTab === 'interest') {
      return <ClientInterestManagement />;
    }

    if (activeTab === 'promocodes') {
      return <PromoCodesManagement />;
    }

    if (activeTab === 'advertising') {
      return <AdBannerManagement />;
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

    // Default dashboard
    return (
      <DashboardOverview 
        stats={{
          totalRepairers: stats?.totalRepairers || 0,
          totalSubscriptions: stats?.totalSubscriptions || 0,
          totalInterests: stats?.totalInterests || 0,
          revenue: stats?.totalRevenue || 0
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <AdminLayout
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
        onRefresh={fetchData}
      >
        {renderContent()}
      </AdminLayout>
    </div>
  );
};

export default AdminPage;
