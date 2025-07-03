
import React from 'react';
import AdminStatsCards from './AdminStatsCards';
import DashboardOverview from './DashboardOverview';
import DocumentationStatusWidget from './DocumentationStatusWidget';

const AdminDashboardContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminStatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardOverview />
        </div>
        <div>
          <DocumentationStatusWidget />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
