
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Play, History, FileText, Download } from 'lucide-react';
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
  const { toast } = useToast();

  const handlePromptExample = (example: PromptExample) => {
    setPrompt(example.prompt);
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
    try {
      const { data, error } = await supabase.functions.invoke('ai-prompt-scraping', {
        body: {
          action: 'analyze',
          prompt,
          ai_model: selectedAI,
          output_format: outputFormat
        }
      });

      if (error) throw error;

      setAnalysisInfo(data.analysis);
      toast({
        title: "✅ Prompt analysé",
        description: "Le prompt a été analysé avec succès. Vérifiez les paramètres détectés.",
      });

    } catch (error) {
      console.error('Erreur analyse prompt:', error);
      toast({
        title: "❌ Erreur d'analyse",
        description: "Impossible d'analyser le prompt. Vérifiez votre connexion.",
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
        description: "Veuillez d'abord analyser le prompt",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-prompt-scraping', {
        body: {
          action: 'execute',
          prompt,
          ai_model: selectedAI,
          output_format: outputFormat,
          analysis: analysisInfo
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      toast({
        title: "🎯 Scraping terminé",
        description: `${data.results?.length || 0} résultats obtenus`,
      });

    } catch (error) {
      console.error('Erreur scraping:', error);
      toast({
        title: "❌ Erreur de scraping",
        description: "Impossible d'exécuter le scraping. Vérifiez les logs.",
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
            🧠 IA Intelligente
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            📊 Multi-format
          </Badge>
        </div>
      </div>

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
              <label className="block text-sm font-medium mb-2">Modèle IA</label>
              <Select value={selectedAI} onValueChange={setSelectedAI}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">DeepSeek (Recommandé)</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                </SelectContent>
              </Select>
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
              Analyser le prompt
            </Button>
            <Button 
              onClick={executeScraping} 
              disabled={isProcessing || !analysisInfo}
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Traitement...' : 'Exécuter le scraping'}
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
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {results[0] && Object.keys(results[0]).map((key) => (
                      <th key={key} className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(result).map((value: any, valueIndex) => (
                        <td key={valueIndex} className="border border-gray-200 px-4 py-2 text-sm">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPromptScraping;
