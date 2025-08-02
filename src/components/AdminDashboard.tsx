import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Globe,
  Target,
  FileText,
  TrendingUp,
  Flag,
  Shield,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Smartphone,
  BookOpen,
  Gauge,
  Monitor
} from 'lucide-react';
import RepairerList from './admin/RepairerList';
import ScrapingDashboard from './admin/ScrapingDashboard';
import BlogAdmin from './blog/admin/BlogAdmin';
import RepairContentGenerator from './blog/admin/RepairContentGenerator';
import { RepairerAnalyticsDashboard } from './admin/analytics/RepairerAnalyticsDashboard';

import AuditLogAdmin from './admin/AuditLogAdmin';
import AdvancedAdvertisingDashboard from './advertising/AdvancedAdvertisingDashboard';
import PerformanceManagement from './admin/PerformanceManagement';
import SEOMonitoringDashboard from './admin/SEOMonitoringDashboard';
import LocalSeoManagement from './admin/LocalSeoManagement';
import EnhancedDocumentationManager from './admin/EnhancedDocumentationManager';
import AdminQuoteAssignments from './admin/AdminQuoteAssignments';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
      {icon}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [favoriteTab, setFavoriteTab] = useState<string | null>(null);
  const [tabsScrollPosition, setTabsScrollPosition] = useState(0);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .neq('role', 'admin');

        if (error) {
          console.error('Error fetching stats:', error);
          toast.error('Erreur lors du chargement des statistiques');
          return;
        }

        const repairerCount = data ? data.length : 0;
        setStats({ repairerCount });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const tabCategories = {
    core: [
      { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, priority: 'high', hasAlert: false },
      { id: 'repairers', label: 'Réparateurs', icon: Users, priority: 'high', hasAlert: false },
      { id: 'quote-assignments', label: 'Attribution Devis', icon: FileText, priority: 'high', hasAlert: false },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, priority: 'medium', hasAlert: false }
    ],
    seoPerformance: [
      { id: 'seo', label: 'SEO Monitoring', icon: Search, priority: 'high', hasAlert: true },
      { id: 'local-seo', label: 'Local SEO', icon: MapPin, priority: 'high', hasAlert: false },
      { id: 'pagespeed', label: 'PageSpeed Pro', icon: Gauge, priority: 'high', hasAlert: false },
      { id: 'performance', label: 'Performance', icon: Zap, priority: 'medium', hasAlert: false }
    ],
    contentMarketing: [
      { id: 'blog', label: 'Blog', icon: FileText, priority: 'medium', hasAlert: false },
      { id: 'repair-generator', label: 'Générateur Mobile', icon: Smartphone, priority: 'medium', hasAlert: false },
      { id: 'advertising', label: 'Publicités', icon: Target, priority: 'medium', hasAlert: false }
    ],
    technical: [
      { id: 'scraping', label: 'Scraping', icon: Globe, priority: 'medium', hasAlert: false },
      { id: 'audit', label: 'Audit', icon: Shield, priority: 'medium', hasAlert: false },
      { id: 'documentation', label: 'Documentation', icon: BookOpen, priority: 'medium', hasAlert: false },
      { id: 'flags', label: 'Feature Flags', icon: Flag, priority: 'low', hasAlert: false }
    ]
  };

  const allTabs = [...tabCategories.core, ...tabCategories.seoPerformance, ...tabCategories.contentMarketing, ...tabCategories.technical];

  const scrollTabs = (direction: 'left' | 'right') => {
    const scrollContainer = document.querySelector('.tabs-scroll-container');
    if (scrollContainer) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, tabsScrollPosition - scrollAmount)
        : tabsScrollPosition + scrollAmount;
      
      scrollContainer.scrollTo({ left: newPosition, behavior: 'smooth' });
      setTabsScrollPosition(newPosition);
    }
  };

  const toggleFavorite = (tabId: string) => {
    setFavoriteTab(favoriteTab === tabId ? null : tabId);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" className="ml-auto" onClick={handleSignOut}>
            Se déconnecter
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation améliorée avec catégories */}
          <div className="relative">
            {/* Boutons de navigation */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTabs('left')}
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTabs('right')}
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Conteneur des onglets avec scroll */}
            <div className="overflow-x-auto tabs-scroll-container mx-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-1">
                {/* Onglet favori en premier si défini */}
                {favoriteTab && (
                  <div className="flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1 px-2">Favori</div>
                    {allTabs.filter(tab => tab.id === favoriteTab).map((tab) => (
                      <div key={`fav-${tab.id}`} className="relative">
                        <TabsTrigger 
                          value={tab.id} 
                          className="flex-shrink-0 min-w-[120px] border-2 border-primary/20"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <div className="flex items-center gap-1">
                              {React.createElement(tab.icon, { className: "h-4 w-4" })}
                              {tab.hasAlert && <div className="w-2 h-2 bg-destructive rounded-full" />}
                            </div>
                            <span className="text-xs whitespace-nowrap">{tab.label}</span>
                          </div>
                        </TabsTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(tab.id)}
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-primary text-primary-foreground hover:bg-primary/80"
                        >
                          <Star className="h-2 w-2 fill-current" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <TabsList className="flex w-max bg-transparent p-0 gap-1">
                  {/* Core - Onglets principaux */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground px-2">Principal</div>
                    <div className="flex gap-1">
                      {tabCategories.core.map((tab) => (
                        <div key={tab.id} className="relative">
                          <TabsTrigger 
                            value={tab.id} 
                            className={`flex-shrink-0 min-w-[120px] ${tab.priority === 'high' ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center gap-1">
                                {React.createElement(tab.icon, { className: "h-4 w-4" })}
                                {tab.hasAlert && <div className="w-2 h-2 bg-destructive rounded-full" />}
                              </div>
                              <span className="text-xs whitespace-nowrap">{tab.label}</span>
                            </div>
                          </TabsTrigger>
                          {favoriteTab !== tab.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(tab.id)}
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Star className="h-2 w-2" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO & Performance */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground px-2">SEO & Performance</div>
                    <div className="flex gap-1">
                      {tabCategories.seoPerformance.map((tab) => (
                        <div key={tab.id} className="relative">
                          <TabsTrigger 
                            value={tab.id} 
                            className={`flex-shrink-0 min-w-[120px] ${tab.priority === 'high' ? 'bg-emerald-50 border-emerald-200' : ''}`}
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center gap-1">
                                {React.createElement(tab.icon, { className: "h-4 w-4" })}
                                {tab.hasAlert && <div className="w-2 h-2 bg-destructive rounded-full" />}
                              </div>
                              <span className="text-xs whitespace-nowrap">{tab.label}</span>
                            </div>
                          </TabsTrigger>
                          {favoriteTab !== tab.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(tab.id)}
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Star className="h-2 w-2" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content & Marketing */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground px-2">Contenu & Marketing</div>
                    <div className="flex gap-1">
                      {tabCategories.contentMarketing.map((tab) => (
                        <div key={tab.id} className="relative">
                          <TabsTrigger value={tab.id} className="flex-shrink-0 min-w-[120px]">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center gap-1">
                                {React.createElement(tab.icon, { className: "h-4 w-4" })}
                                {tab.hasAlert && <div className="w-2 h-2 bg-destructive rounded-full" />}
                              </div>
                              <span className="text-xs whitespace-nowrap">{tab.label}</span>
                            </div>
                          </TabsTrigger>
                          {favoriteTab !== tab.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(tab.id)}
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Star className="h-2 w-2" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technique */}
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground px-2">Technique</div>
                    <div className="flex gap-1">
                      {tabCategories.technical.map((tab) => (
                        <div key={tab.id} className="relative">
                          <TabsTrigger 
                            value={tab.id} 
                            className={`flex-shrink-0 min-w-[120px] ${tab.priority === 'high' ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center gap-1">
                                {React.createElement(tab.icon, { className: "h-4 w-4" })}
                                {tab.hasAlert && <div className="w-2 h-2 bg-destructive rounded-full" />}
                              </div>
                              <span className="text-xs whitespace-nowrap">{tab.label}</span>
                            </div>
                          </TabsTrigger>
                          {favoriteTab !== tab.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(tab.id)}
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Star className="h-2 w-2" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsList>
              </div>
            </div>

            {/* Indicateur de scroll */}
            <div className="flex justify-center mt-2">
              <div className="flex gap-1">
                {[...Array(Math.ceil(allTabs.length / 4))].map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-1 rounded-full transition-colors ${
                      Math.floor(tabsScrollPosition / 200) === index ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="dashboard">
            <h2 className="text-2xl font-bold mb-4">Tableau de bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Nombre de réparateurs"
                value={stats?.repairerCount || 0}
                icon={<Users className="h-6 w-6 text-gray-500" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="repairers">
            <h2 className="text-2xl font-bold mb-4">Gestion des réparateurs</h2>
            <RepairerList />
          </TabsContent>

          <TabsContent value="quote-assignments">
            <AdminQuoteAssignments />
          </TabsContent>

          {/* Core Tabs */}
          <TabsContent value="analytics">
            <RepairerAnalyticsDashboard />
          </TabsContent>

          {/* SEO & Performance Tabs */}
          <TabsContent value="seo">
            <h2 className="text-2xl font-bold mb-4">Monitoring SEO & Technique</h2>
            <SEOMonitoringDashboard />
          </TabsContent>

          <TabsContent value="local-seo">
            <h2 className="text-2xl font-bold mb-4">Gestion SEO Local</h2>
            <LocalSeoManagement />
          </TabsContent>

          <TabsContent value="pagespeed">
            <h2 className="text-2xl font-bold mb-4">PageSpeed Pro</h2>
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
          </TabsContent>

          <TabsContent value="performance">
            <h2 className="text-2xl font-bold mb-4">Optimisation de Performance</h2>
            <PerformanceManagement />
          </TabsContent>

          {/* Content & Marketing Tabs */}
          <TabsContent value="blog">
            <h2 className="text-2xl font-bold mb-4">Gestion du Blog</h2>
            <BlogAdmin />
          </TabsContent>

          <TabsContent value="repair-generator">
            <h2 className="text-2xl font-bold mb-4">Générateur de Contenu Mobile</h2>
            <RepairContentGenerator />
          </TabsContent>

          <TabsContent value="advertising">
            <AdvancedAdvertisingDashboard />
          </TabsContent>

          {/* Technical Tabs */}
          <TabsContent value="scraping">
            <h2 className="text-2xl font-bold mb-4">Tableau de bord de Scraping</h2>
            <ScrapingDashboard />
          </TabsContent>

          <TabsContent value="audit">
            <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
            <AuditLogAdmin />
          </TabsContent>

          <TabsContent value="documentation">
            <h2 className="text-2xl font-bold mb-4">Gestion de la Documentation</h2>
            <EnhancedDocumentationManager />
          </TabsContent>

          <TabsContent value="flags">
            <h2 className="text-2xl font-bold mb-4">Feature Flags</h2>
            <div className="text-center p-8 text-muted-foreground">
              <p>Module Feature Flags déplacé vers la gestion des fonctionnalités</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
