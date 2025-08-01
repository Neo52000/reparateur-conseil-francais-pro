import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler, withErrorHandling } from '@/utils/errorHandling';
import { apiManager } from '@/services/scraping/ApiManager';

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

  const handleSerperSearch = withErrorHandling(async (category: BusinessCategory, location: string, customQuery?: string) => {
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
  }, 'SerperSearch');

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
      
      console.log('📡 [DEBUG] Intégration directe en base...');
      // Intégration directe via l'API repairers
      const { data, error } = await supabase.from('repairers').insert(
        selectedResults.map(result => ({
          name: result.name || result.title || 'Nom inconnu',
          address: result.address || '',
          city: result.city || location || '',
          postal_code: result.postal_code || '',
          phone: result.phone || '',
          website: result.website || result.link || '',
          services: result.services || ['Réparation smartphone'],
          price_range: result.price_range || 'Non spécifié',
          source: result.source || 'manuel',
          is_verified: false,
          rating: result.rating || null,
          scraped_at: new Date().toISOString()
        }))
      ).select();

      console.log('📥 [DEBUG] Réponse intégration:', { data, error });

      if (error) {
        console.error('❌ [DEBUG] Erreur intégration directe:', error);
        throw new Error(`Erreur intégration: ${error.message || 'Erreur inconnue'}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée insérée');
      }
      
      console.log('✅ [DEBUG] Intégration terminée:', {
        totalInserted: data.length,
        totalProcessed: selectedResults.length
      });
      
      toast({
        title: "Intégration réussie",
        description: `${data.length} réparateurs ajoutés en base de données sur ${selectedResults.length} sélectionnés`
      });
      
      // Afficher le composant de redirection après intégration réussie
      setShowRedirection(true);
      
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

    try {
      // Dynamically import Papa Parse
      import('papaparse').then((Papa) => {
        // Préparer les données pour l'export
        const exportData = results.map(r => ({
          Titre: r.title || r.name || '',
          URL: r.link || r.website || '',
          Description: r.snippet || r.description || '',
          Position: r.position || '',
          Source: r.source || '',
          Ville: r.city || '',
          Adresse: r.address || '',
          Téléphone: r.phone || ''
        }));

        // Générer le CSV avec Papa Parse
        const csv = Papa.default.unparse(exportData);
        
        // Créer et télécharger le fichier
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultats-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export réussi",
          description: `${results.length} résultats exportés en CSV`
        });
      }).catch((error) => {
        console.error('Erreur lors de l\'import de Papa Parse:', error);
        toast({
          title: "Erreur d'export",
          description: "Impossible d'exporter les données",
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast({
        title: "Erreur d'export", 
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive"
      });
    }
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
    
    handleIntegrateToDatabase,
    handleRedirectToRepairers,
    handleCancelRedirection,
    exportResults
  };
};