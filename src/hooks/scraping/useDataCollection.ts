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
      console.log('🚀 [DEBUG] Démarrage Unified Scraping avec:', { 
        searchTerm, 
        location, 
        categoryId: category.id,
        categoryName: category.name,
        keywords: category.search_keywords 
      });
      
      // Vérification préalable de la catégorie
      if (!category.id) {
        throw new Error('Catégorie invalide : ID manquant');
      }
      
      console.log('📡 [DEBUG] Appel edge function unified-scraping...');
      const { data, error } = await supabase.functions.invoke('unified-scraping', {
        body: {
          searchTerm: searchTerm,
          location: location || 'France',
          sources: ['serper', 'multi_ai'], // Simplifier pour le debug
          maxResults: 20, // Réduire pour debug
          enableAI: true,
          enableGeocoding: true,
          categoryId: category.id,
          previewMode: true // Mode preview pour afficher les résultats avant intégration
        }
      });

      console.log('📥 [DEBUG] Réponse edge function:', { data, error });

      if (error) {
        console.error('❌ [DEBUG] Erreur détaillée Unified Scraping:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erreur scraping: ${error.message || 'Erreur inconnue'}`);
      }
      
      if (!data) {
        throw new Error('Aucune donnée retournée par l\'edge function');
      }
      
      console.log('✅ [DEBUG] Unified Scraping terminé:', {
        success: data.success,
        stats: data.stats,
        resultsCount: data.results?.length || 0
      });
      
      const stats = data.stats || {};
      const results = data.results || [];
      setResults(results);
      
      toast({
        title: "Collecte réussie",
        description: `${stats.totalFound || 0} résultats trouvés et ${stats.totalProcessed || 0} traités. ${results.length} résultats disponibles pour intégration.`
      });
      
      return results;
    } catch (error: any) {
      console.error('💥 [DEBUG] Erreur complète Unified Scraping:', {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Erreur Scraping Unifié",
        description: `Détail: ${error.message}. Consultez la console pour plus d'infos.`,
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
      console.log('💾 [DEBUG] Début intégration:', {
        selectedCount: selectedResults.length,
        categoryId: category.id,
        categoryName: category.name,
        location,
        sampleResults: selectedResults.slice(0, 2).map(r => ({ name: r.name || r.title, source: r.source }))
      });
      
      // Vérifications préalables
      if (!category.id) {
        throw new Error('Catégorie invalide : ID manquant');
      }
      
      if (selectedResults.some(r => !r.name && !r.title)) {
        console.warn('[DEBUG] Certains résultats n\'ont pas de nom:', selectedResults.filter(r => !r.name && !r.title));
      }
      
      console.log('📡 [DEBUG] Appel intégration vers edge function...');
      const { data, error } = await supabase.functions.invoke('unified-scraping', {
        body: {
          searchTerm: category.search_keywords[0] || category.name,
          location: location || 'France',
          sources: [], // Pas de nouvelles sources, on intègre les résultats fournis
          maxResults: selectedResults.length,
          enableAI: false,
          enableGeocoding: false,
          categoryId: category.id,
          previewMode: false, // MODE INTÉGRATION - pas de preview
          providedResults: selectedResults // Passer les résultats sélectionnés
        }
      });

      console.log('📥 [DEBUG] Réponse intégration:', { data, error });

      if (error) {
        console.error('❌ [DEBUG] Erreur détaillée intégration:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erreur intégration: ${error.message || 'Erreur inconnue'}`);
      }
      
      if (!data) {
        throw new Error('Aucune donnée retournée lors de l\'intégration');
      }
      
      const stats = data.stats || {};
      console.log('✅ [DEBUG] Intégration terminée:', {
        success: data.success,
        stats,
        totalInserted: stats.totalInserted,
        totalProcessed: stats.totalProcessed
      });
      
      if (stats.totalInserted === 0) {
        toast({
          title: "Aucune insertion",
          description: `${stats.totalProcessed || 0} résultats traités mais 0 inséré. Vérifiez les logs pour plus de détails.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Intégration réussie",
          description: `${stats.totalInserted} réparateurs ajoutés en base de données sur ${selectedResults.length} sélectionnés`
        });
        
        // Afficher le composant de redirection après intégration réussie
        setShowRedirection(true);
      }
      
    } catch (error: any) {
      console.error('💥 [DEBUG] Erreur complète intégration:', {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Erreur d'intégration",
        description: `Détail: ${error.message}. Consultez la console pour plus d'infos.`,
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