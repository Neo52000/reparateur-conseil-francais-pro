
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Play, History, FileText, Download, AlertTriangle, CheckCircle, Info, Zap, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PromptExample {
  title: string;
  prompt: string;
  category: string;
}

const promptExamples: PromptExample[] = [
  {
    title: "Réparateurs smartphones département 01",
    prompt: "Établi moi la liste de toutes les boutiques, corners, qui vendent et/ou réparent des smartphones, tablettes, montres connectées, micro soudure dans le département 01 - sous forme de tableau",
    category: "Réparation mobile"
  },
  {
    title: "Magasins informatique Paris",
    prompt: "Trouve tous les magasins d'informatique et réparation d'ordinateurs à Paris, avec leurs coordonnées et services",
    category: "Informatique"
  },
  {
    title: "Services après-vente téléphonie",
    prompt: "Liste des centres de service après-vente pour téléphones mobiles dans les Hauts-de-Seine, format CSV",
    category: "SAV"
  }
];

const AIPromptScraping = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedAI, setSelectedAI] = useState('deepseek');
  const [outputFormat, setOutputFormat] = useState('tableau');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [analysisInfo, setAnalysisInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handlePromptExample = (example: PromptExample) => {
    setPrompt(example.prompt);
    setError('');
  };

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requis",
        description: "Veuillez saisir un prompt pour l'analyse",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      console.log('🚀 Démarrage analyse prompt...');
      
      const { data, error: supabaseError } = await supabase.functions.invoke('ai-prompt-scraping', {
        body: {
          action: 'analyze',
          prompt,
          ai_model: selectedAI,
          output_format: outputFormat
        }
      });

      console.log('📥 Réponse analyse:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('❌ Erreur Supabase:', supabaseError);
        throw new Error(supabaseError.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Réponse invalide du serveur');
      }

      setAnalysisInfo(data.analysis);
      
      toast({
        title: "✅ Prompt analysé avec succès",
        description: `Analyse terminée avec ${selectedAI}. Paramètres détectés et prêts pour l'exécution.`,
      });

    } catch (error: any) {
      console.error('💥 Erreur analyse prompt:', error);
      const errorMessage = error.message || 'Erreur inconnue lors de l\'analyse';
      setError(errorMessage);
      
      toast({
        title: "❌ Erreur d'analyse",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeScraping = async () => {
    if (!analysisInfo) {
      toast({
        title: "Analyse requise",
        description: "Veuillez d'abord analyser le prompt avant l'exécution",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      console.log('🚀 Démarrage exécution scraping...');
      
      const { data, error: supabaseError } = await supabase.functions.invoke('ai-prompt-scraping', {
        body: {
          action: 'execute',
          prompt,
          ai_model: selectedAI,
          output_format: outputFormat,
          analysis: analysisInfo
        }
      });

      console.log('📥 Réponse scraping:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('❌ Erreur Supabase:', supabaseError);
        throw new Error(supabaseError.message || 'Erreur lors de l\'exécution');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Réponse invalide du serveur');
      }

      setResults(data.results || []);
      toast({
        title: "🎯 Scraping terminé avec succès",
        description: `${data.results?.length || 0} résultats obtenus avec ${selectedAI}`,
      });

    } catch (error: any) {
      console.error('💥 Erreur scraping:', error);
      const errorMessage = error.message || 'Erreur inconnue lors du scraping';
      setError(errorMessage);
      
      toast({
        title: "❌ Erreur de scraping",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(results[0]).join(",") + "\n"
      + results.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scraping_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
    setResults([]);
    setAnalysisInfo(null);
    toast({
      title: "🗑️ Résultats supprimés",
      description: "Tous les résultats ont été effacés",
    });
  };

  const groupResultsByCategory = (results: any[]) => {
    if (!results || results.length === 0) return {};
    
    const groups: { [key: string]: any[] } = {};
    
    results.forEach(result => {
      let category = "Boutiques générales";
      
      // Catégorisation basée sur les services et le nom
      if (result.services?.includes('micro-soudure') || result.specialites?.includes('micro-soudure')) {
        category = "Réparation spécialisée et micro-soudure";
      } else if (result.nom?.toLowerCase().includes('orange') || result.nom?.toLowerCase().includes('sfr') || result.nom?.toLowerCase().includes('free') || result.nom?.toLowerCase().includes('bouygues')) {
        category = "Boutiques opérateurs mobiles";
      } else if (result.nom?.toLowerCase().includes('fnac') || result.nom?.toLowerCase().includes('darty') || result.nom?.toLowerCase().includes('boulanger')) {
        category = "Grandes enseignes avec corners réparation";
      } else if (result.services?.includes('réparation')) {
        category = "Réparation spécialisée et micro-soudure";
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(result);
    });
    
    return groups;
  };

  const renderGroupedResults = () => {
    const groupedResults = groupResultsByCategory(results);
    
    return Object.entries(groupedResults).map(([category, items]) => (
      <div key={category} className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b-2 border-blue-200 pb-2">
          {category}
        </h3>
        <div className="grid gap-4">
          {items.map((result, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <strong className="text-blue-700">Nom:</strong>
                  <p className="text-sm">{result.nom || 'Non spécifié'}</p>
                </div>
                <div>
                  <strong className="text-blue-700">Adresse:</strong>
                  <p className="text-sm">{result.adresse || 'Non spécifiée'}</p>
                </div>
                <div>
                  <strong className="text-blue-700">Services:</strong>
                  <p className="text-sm">{result.services || 'Non spécifiés'}</p>
                </div>
                <div>
                  <strong className="text-blue-700">Coordonnées:</strong>
                  <div className="text-sm">
                    {result.telephone && <p>Tél: {result.telephone}</p>}
                    {result.website && <p>Web: {result.website}</p>}
                    {result.email && <p>Email: {result.email}</p>}
                  </div>
                </div>
              </div>
              {result.specialites && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <strong className="text-blue-700">Spécialités:</strong>
                  <p className="text-sm">{result.specialites}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Scraping via Prompt IA</h3>
            <p className="text-sm text-gray-600">Décrivez ce que vous cherchez en langage naturel</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            🧠 IA Configurée
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            📊 Multi-format
          </Badge>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Erreur détectée</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
            Configuration du Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mode de traitement</label>
              <Select value={selectedAI} onValueChange={setSelectedAI}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-3 w-3 text-blue-600" />
                      <span>DeepSeek</span>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  </SelectItem>
                  <SelectItem value="mistral">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-3 w-3 text-orange-600" />
                      <span>Mistral</span>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                      <span>OpenAI</span>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  </SelectItem>
                  <SelectItem value="simulation">
                    <div className="flex items-center space-x-2">
                      <span>Simulation (Test)</span>
                      <Info className="h-3 w-3 text-blue-600" />
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Les API IA sont configurées dans Supabase
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Format de sortie</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tableau">Tableau structuré</SelectItem>
                  <SelectItem value="liste">Liste simple</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Votre Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Exemple: Établi moi la liste de toutes les boutiques qui vendent et/ou réparent des smartphones dans le département 01..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={analyzePrompt} 
              disabled={isProcessing || !prompt.trim()}
              variant="outline"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isProcessing && !analysisInfo ? 'Analyse...' : 'Analyser le prompt'}
            </Button>
            <Button 
              onClick={executeScraping} 
              disabled={isProcessing || !analysisInfo}
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing && analysisInfo ? 'Scraping...' : 'Exécuter le scraping'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exemples de prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-600" />
            Exemples de Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promptExamples.map((example, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handlePromptExample(example)}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{example.title}</h4>
                  <Badge variant="outline" className="text-xs">{example.category}</Badge>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">{example.prompt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse du prompt */}
      {analysisInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Analyse du Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Paramètres détectés:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Types:</strong> {analysisInfo.business_types?.join(', ') || 'Non spécifié'}</li>
                  <li><strong>Services:</strong> {analysisInfo.services?.join(', ') || 'Non spécifié'}</li>
                  <li><strong>Zone:</strong> {analysisInfo.location || 'Non spécifiée'}</li>
                  <li><strong>Format:</strong> {analysisInfo.output_format || outputFormat}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Stratégie de recherche:</h4>
                <p className="text-sm text-gray-600">{analysisInfo.strategy || 'Stratégie standard'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Résultats ({results.length})
              </div>
              <div className="flex space-x-2">
                <Button onClick={clearResults} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderGroupedResults()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPromptScraping;
