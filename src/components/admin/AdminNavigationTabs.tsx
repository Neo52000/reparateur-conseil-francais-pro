
import React from 'react';
import { Heart, Megaphone } from 'lucide-react';

type TabType = 'subscriptions' | 'repairers' | 'interest' | 'promocodes' | 'scraping' | 'advertising';

interface AdminNavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const AdminNavigationTabs: React.FC<AdminNavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const getTabClassName = (tab: TabType) => 
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-white text-gray-900 shadow'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
      <button
        onClick={() => onTabChange('subscriptions')}
        className={getTabClassName('subscriptions')}
      >
        Abonnements
      </button>
      <button
        onClick={() => onTabChange('repairers')}
        className={getTabClassName('repairers')}
      >
        Réparateurs
      </button>
      <button
        onClick={() => onTabChange('interest')}
        className={getTabClassName('interest')}
      >
        <Heart className="h-4 w-4 mr-1 inline" />
        Demandes d'intérêt
      </button>
      <button
        onClick={() => onTabChange('promocodes')}
        className={getTabClassName('promocodes')}
      >
        Codes Promo
      </button>
      <button
        onClick={() => onTabChange('advertising')}
        className={getTabClassName('advertising')}
      >
        <Megaphone className="h-4 w-4 mr-1 inline" />
        Publicités
      </button>
      <button
        onClick={() => onTabChange('scraping')}
        className={getTabClassName('scraping')}
      >
        Scraping Moderne
      </button>
    </div>
  );
};

export default AdminNavigationTabs;
export type { TabType };
