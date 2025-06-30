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
import { useAuth } from '@/hooks/useAuth';

const AdminPage = () => {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');

  if (!user) {
    return <Navigate to="/client-auth" replace />;
  }

  if (!isAdmin || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-700">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AdminDashboardHeader />
        
        <div className="mt-8">
          <AdminNavigationTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="mt-6">
            {activeTab === 'subscriptions' && <AdminDashboardContent />}
            {activeTab === 'repairers' && <RepairersTable />}
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
