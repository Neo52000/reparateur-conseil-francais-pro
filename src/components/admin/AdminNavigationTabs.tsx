
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Heart, Tag, Megaphone, Search, Package, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export type TabType = 'subscriptions' | 'repairers' | 'interest' | 'promocodes' | 'advertising' | 'scraping' | 'blog';

interface AdminNavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const AdminNavigationTabs: React.FC<AdminNavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-1">
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Abonnements</span>
          </TabsTrigger>
          <TabsTrigger value="repairers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Réparateurs</span>
          </TabsTrigger>
          <TabsTrigger value="interest" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Intérêts</span>
          </TabsTrigger>
          <TabsTrigger value="promocodes" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Codes Promo</span>
          </TabsTrigger>
          <TabsTrigger value="advertising" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Publicité</span>
          </TabsTrigger>
          <TabsTrigger value="scraping" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Scraping</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Blog</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/repairers">
            <Users className="h-4 w-4 mr-2" />
            Gestion complète
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/catalog">
            <Package className="h-4 w-4 mr-2" />
            Catalogue
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminNavigationTabs;
