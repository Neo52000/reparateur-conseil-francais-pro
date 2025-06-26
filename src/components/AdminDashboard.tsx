
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, Zap, Users, TrendingUp, RefreshCw, Heart } from 'lucide-react';
import ScrapingControl from './ScrapingControl';
import ClientAccessControl from './ClientAccessControl';
import PromoCodesManagement from './PromoCodesManagement';
import ClientInterestManagement from './ClientInterestManagement';
import RepairersTable from './repairers/RepairersTable';
import SubscriptionsTable from './repairers/SubscriptionsTable';
import RepairerProfileModal from './RepairerProfileModal';
import { useRepairersData } from '@/hooks/useRepairersData';

const AdminDashboard = () => {
  const { subscriptions, repairers, loading, stats, fetchData } = useRepairersData();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'repairers' | 'scraping' | 'promocodes' | 'interest'>('subscriptions');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { toast } = useToast();

  const handleViewProfile = (repairerId: string) => {
    setSelectedRepairerId(repairerId);
    setProfileModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backoffice Administrateur</h1>
          <p className="text-gray-600">Gestion de la plateforme RepairHub</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Client Access Control - Added at the top for visibility */}
      <ClientAccessControl />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Réparateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRepairers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réparateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRepairers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue.toFixed(2)}€</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Annuels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.yearlyRevenue.toFixed(2)}€</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Abonnements
        </button>
        <button
          onClick={() => setActiveTab('repairers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'repairers'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Réparateurs
        </button>
        <button
          onClick={() => setActiveTab('interest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'interest'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart className="h-4 w-4 mr-1 inline" />
          Demandes d'intérêt
        </button>
        <button
          onClick={() => setActiveTab('promocodes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'promocodes'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Codes Promo
        </button>
        <button
          onClick={() => setActiveTab('scraping')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'scraping'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Scraping Moderne
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'subscriptions' && (
        <SubscriptionsTable 
          subscriptions={subscriptions}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'repairers' && (
        <RepairersTable
          repairers={repairers}
          onViewProfile={handleViewProfile}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'interest' && <ClientInterestManagement />}

      {activeTab === 'promocodes' && <PromoCodesManagement />}

      {activeTab === 'scraping' && (
        <div className="space-y-6">
          <ScrapingControl />
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Scraping Moderne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Fonctionnalités du Scraping Moderne</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Détection automatique avec classification IA (Mistral)</li>
                    <li>• Géocodage précis avec Nominatim OpenStreetMap</li>
                    <li>• Scraping web avancé avec Firecrawl</li>
                    <li>• Vérification automatique des entreprises via API gouvernementale</li>
                    <li>• Déduplication intelligente des résultats</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Services intégrés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">Mistral AI</div>
                      <div className="text-sm text-blue-800">Classification intelligente</div>
                      <Badge className="mt-1 bg-green-100 text-green-800">✓ Configuré</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">Nominatim</div>
                      <div className="text-sm text-blue-800">Géocodage gratuit</div>
                      <Badge className="mt-1 bg-green-100 text-green-800">✓ Gratuit</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">Firecrawl</div>
                      <div className="text-sm text-blue-800">Scraping web</div>
                      <Badge className="mt-1 bg-orange-100 text-orange-800">Clé requise</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedRepairerId(null);
          }}
          repairerId={selectedRepairerId}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
