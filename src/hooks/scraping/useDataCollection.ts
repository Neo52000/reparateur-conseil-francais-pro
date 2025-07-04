import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  search_keywords: string[];
}

export const useDataCollection = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [integrating, setIntegrating] = useState(false);

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

  const handleFirecrawlScraping = async (category: BusinessCategory, location: string) => {
    try {
      const searchTerm = category.search_keywords[0] || category.name;
      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: {
          searchTerm: searchTerm,
          location: location || 'France',
          source: 'pages_jaunes',
          maxResults: 20,
          testMode: true
        }
      });

      if (error) throw error;
      
      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        toast({
          title: "Scraping Firecrawl réussi",
          description: `${data.results.length} résultats trouvés`
        });
      } else {
        toast({
          title: "Scraping terminé",
          description: "Aucun résultat trouvé pour cette recherche"
        });
      }
      
      return data.results || [];
    } catch (error: any) {
      console.error('Erreur Firecrawl:', error);
      toast({
        title: "Erreur Firecrawl",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleIntegrateToDatabase = async (selectedResults: any[], category: BusinessCategory, location: string) => {
    setIntegrating(true);
    try {
      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: {
          searchTerm: category.search_keywords[0] || category.name,
          location: location || 'France',
          source: 'integration',
          maxResults: selectedResults.length,
          testMode: false,
          preProcessedResults: selectedResults
        }
      });

      if (error) throw error;
      
      toast({
        title: "Intégration réussie",
        description: `${selectedResults.length} réparateurs ajoutés à la base de données`
      });
      
      setResults([]);
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

  return {
    results,
    setResults,
    integrating,
    generateSerperQuery,
    handleSerperSearch,
    handleMultiAIPipeline,
    handleFirecrawlScraping,
    handleIntegrateToDatabase,
    exportResults
  };
};