
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import AdminNavigationTabs, { TabType } from '@/components/admin/AdminNavigationTabs';
import RepairersTable from '@/components/repairers/RepairersTable';
import ClientInterestManagement from '@/components/ClientInterestManagement';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import AdBannerManagement from '@/components/advertising/AdBannerManagement';
import EnhancedScrapingHub from '@/components/scraping/EnhancedScrapingHub';
import BlogManagement from '@/components/blog/admin/BlogManagement';
import AdminAuthForm from '@/components/AdminAuthForm';
import { useAuth } from '@/hooks/useAuth';

const AdminPage = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');

  // Debug logs pour comprendre l'état
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

  // Si pas d'utilisateur connecté, afficher le formulaire de connexion admin
  if (!user) {
    console.log('🚫 AdminPage: No user - showing admin auth form');
    return <AdminAuthForm />;
  }

  // Si utilisateur connecté mais pas admin, afficher le debug ou rediriger
  if (!isAdmin || profile?.role !== 'admin') {
    console.log('🚫 AdminPage: User not admin - showing debug or auth form');
    return <AdminAuthForm />;
  }

  console.log('✅ AdminPage: Admin access granted');

  const handleRefresh = () => {
    console.log('🔄 AdminPage: Refreshing data...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AdminDashboardHeader onRefresh={handleRefresh} />
        
        <div className="mt-8">
          <AdminNavigationTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="mt-6">
            {activeTab === 'subscriptions' && (
              <AdminDashboardContent 
                activeTab={activeTab}
                subscriptions={[]}
                repairers={[]}
                onViewProfile={() => {}}
                onRefresh={handleRefresh}
              />
            )}
            {activeTab === 'repairers' && (
              <RepairersTable
                repairers={[]}
                onViewProfile={() => {}}
                onRefresh={handleRefresh}
              />
            )}
            {activeTab === 'interest' && <ClientInterestManagement />}
            {activeTab === 'promocodes' && <PromoCodesManagement />}
            {activeTab === 'advertising' && <AdBannerManagement />}
            {activeTab === 'scraping' && <EnhancedScrapingHub />}
            {activeTab === 'blog' && <BlogManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
