import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  search_keywords: string[];
}

export const useDataCollection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [integrating, setIntegrating] = useState(false);
  const [showRedirection, setShowRedirection] = useState(false);

  const generateSerperQuery = (category: BusinessCategory, location: string, customQuery?: string) => {
    if (customQuery) return customQuery;
    const baseKeyword = category.search_keywords[0] || category.name;
    return location ? `${baseKeyword} ${location}` : baseKeyword;
  };

  const handleSerperSearch = async (category: BusinessCategory, location: string, customQuery?: string) => {
    try {
      const query = generateSerperQuery(category, location, customQuery);
      console.log('🔍 Démarrage recherche Serper avec:', { query, location });
      
      const { data, error } = await supabase.functions.invoke('serper-search', {
        body: {
          query,
          type: 'search',
          location: location || 'France',
          num: 20
        }
      });

      if (error) {
        console.error('❌ Erreur Serper API:', error);
        throw error;
      }
      
      console.log('✅ Réponse Serper reçue:', data);
      const results = data.results || [];
      setResults(results);
      
      toast({
        title: "Recherche Serper réussie",
        description: `${results.length} résultats trouvés`
      });
      
      return results;
    } catch (error: any) {
      console.error('Erreur Serper:', error);
      toast({
        title: "Erreur Serper",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleMultiAIPipeline = async (category: BusinessCategory, location: string) => {
    try {
      const searchTerm = category.search_keywords[0] || category.name;
      console.log('🧠 Démarrage Pipeline Multi-IA avec:', { searchTerm, location });
      
      const { data, error } = await supabase.functions.invoke('multi-ai-pipeline', {
        body: {
          searchTerm: searchTerm,
          location: location || 'France',
          testMode: true
        }
      });

      if (error) {
        console.error('❌ Erreur Pipeline Multi-IA:', error);
        throw error;
      }
      
      console.log('✅ Pipeline Multi-IA terminé:', data);
      const results = data.results || [];
      setResults(results);
      
      toast({
        title: "Pipeline Multi-IA réussi",
        description: `${results.length} réparateurs trouvés et enrichis par IA`
      });
      
      return results;
    } catch (error: any) {
      console.error('Erreur Pipeline Multi-IA:', error);
      toast({
        title: "Erreur Pipeline Multi-IA",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleUnifiedScraping = async (category: BusinessCategory, location: string) => {
    try {
      const searchTerm = category.search_keywords[0] || category.name;
      console.log('🚀 Démarrage Unified Scraping avec:', { searchTerm, location });
      
      const { data, error } = await supabase.functions.invoke('unified-scraping', {
        body: {
          searchTerm: searchTerm,
          location: location || 'France',
          sources: ['google_maps', 'serper', 'multi_ai'],
          maxResults: 50,
          enableAI: true,
          enableGeocoding: true,
          categoryId: category.id,
          previewMode: true // Mode preview pour afficher les résultats avant intégration
        }
      });

      if (error) {
        console.error('❌ Erreur Unified Scraping:', error);
        throw error;
      }
      
      console.log('✅ Unified Scraping terminé:', data);
      const stats = data.stats || {};
      setResults(data.results || []);
      
      toast({
        title: "Collecte réussie",
        description: `${stats.totalFound || 0} résultats trouvés et ${stats.totalProcessed || 0} traités. Vérifiez et sélectionnez les résultats à intégrer.`
      });
      
      // Ne pas rediriger automatiquement en mode preview
      return data.results || [];
    } catch (error: any) {
      console.error('Erreur Unified Scraping:', error);
      toast({
        title: "Erreur Scraping Unifié",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleIntegrateToDatabase = async (selectedResults: any[], category: BusinessCategory, location: string) => {
    if (selectedResults.length === 0) {
      toast({
        title: "Aucun résultat sélectionné",
        description: "Veuillez sélectionner au moins un résultat à intégrer",
        variant: "destructive"
      });
      return;
    }

    setIntegrating(true);
    try {
      console.log('💾 Intégration de', selectedResults.length, 'résultats sélectionnés');
      
      const { data, error } = await supabase.functions.invoke('unified-scraping', {
        body: {
          searchTerm: category.search_keywords[0] || category.name,
          location: location || 'France',
          sources: [], // Pas de nouvelles sources, on intègre les résultats fournis
          maxResults: selectedResults.length,
          enableAI: false,
          enableGeocoding: false,
          categoryId: category.id,
          previewMode: false,
          providedResults: selectedResults // Passer les résultats sélectionnés
        }
      });

      if (error) {
        console.error('❌ Erreur intégration:', error);
        throw error;
      }
      
      const stats = data.stats || {};
      
      toast({
        title: "Intégration réussie",
        description: `${stats.totalInserted || 0} réparateurs ajoutés en base de données`
      });
      
      // Afficher le composant de redirection après intégration
      setShowRedirection(true);
      
    } catch (error: any) {
      console.error('Erreur intégration:', error);
      toast({
        title: "Erreur d'intégration",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIntegrating(false);
    }
  };

  const exportResults = (results: any[], categoryName: string) => {
    if (results.length === 0) {
      toast({
        title: "Aucun résultat",
        description: "Pas de données à exporter",
        variant: "destructive"
      });
      return;
    }

    const csv = [
      ['Titre', 'URL', 'Description', 'Position'].join(','),
      ...results.map(r => [
        `"${r.title || r.name || ''}"`,
        `"${r.link || r.website || ''}"`,
        `"${r.snippet || r.description || ''}"`,
        r.position || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats-${categoryName.toLowerCase()}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRedirectToRepairers = () => {
    navigate('/admin?tab=repairers');
  };

  const handleCancelRedirection = () => {
    setShowRedirection(false);
  };

  return {
    results,
    setResults,
    integrating,
    showRedirection,
    generateSerperQuery,
    handleSerperSearch,
    handleMultiAIPipeline,
    handleUnifiedScraping,
    handleIntegrateToDatabase,
    handleRedirectToRepairers,
    handleCancelRedirection,
    exportResults
  };
};