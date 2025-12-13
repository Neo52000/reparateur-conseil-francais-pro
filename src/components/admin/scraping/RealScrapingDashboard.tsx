import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, RefreshCw, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Eye, Save, Phone, Globe, Building2, Trash2, Settings2, ChevronDown, Brain, Zap, Star, Sparkles } from 'lucide-react';

// Options d'IA disponibles pour le scraping
const AI_OPTIONS = [
  { id: 'lovable', name: 'Lovable AI (Gemini Flash)', icon: Sparkles, description: 'IA par défaut, rapide' },
  { id: 'gemini', name: 'Gemini Pro (Direct)', icon: Zap, description: 'API Google directe' },
  { id: 'openai', name: 'OpenAI GPT', icon: Star, description: 'Très précis' },
  { id: 'mistral', name: 'Mistral AI', icon: Brain, description: 'IA française' },
];

interface ScrapingLog {
  id: string;
  source: string;
  status: string;
  items_scraped: number;
  items_added: number;
  items_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  department_code?: string;
}

interface ScrapedRepairer {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  services?: string[];
  source: string;
}

// Départements organisés par région
const DEPARTMENTS_BY_REGION: Record<string, { code: string; name: string }[]> = {
  'Île-de-France': [
    { code: '75', name: 'Paris' },
    { code: '77', name: 'Seine-et-Marne' },
    { code: '78', name: 'Yvelines' },
    { code: '91', name: 'Essonne' },
    { code: '92', name: 'Hauts-de-Seine' },
    { code: '93', name: 'Seine-Saint-Denis' },
    { code: '94', name: 'Val-de-Marne' },
    { code: '95', name: 'Val-d\'Oise' },
  ],
  'Auvergne-Rhône-Alpes': [
    { code: '01', name: 'Ain' },
    { code: '03', name: 'Allier' },
    { code: '07', name: 'Ardèche' },
    { code: '15', name: 'Cantal' },
    { code: '26', name: 'Drôme' },
    { code: '38', name: 'Isère' },
    { code: '42', name: 'Loire' },
    { code: '43', name: 'Haute-Loire' },
    { code: '63', name: 'Puy-de-Dôme' },
    { code: '69', name: 'Rhône' },
    { code: '73', name: 'Savoie' },
    { code: '74', name: 'Haute-Savoie' },
  ],
  'Provence-Alpes-Côte d\'Azur': [
    { code: '04', name: 'Alpes-de-Haute-Provence' },
    { code: '05', name: 'Hautes-Alpes' },
    { code: '06', name: 'Alpes-Maritimes' },
    { code: '13', name: 'Bouches-du-Rhône' },
    { code: '83', name: 'Var' },
    { code: '84', name: 'Vaucluse' },
  ],
  'Nouvelle-Aquitaine': [
    { code: '16', name: 'Charente' },
    { code: '17', name: 'Charente-Maritime' },
    { code: '19', name: 'Corrèze' },
    { code: '23', name: 'Creuse' },
    { code: '24', name: 'Dordogne' },
    { code: '33', name: 'Gironde' },
    { code: '40', name: 'Landes' },
    { code: '47', name: 'Lot-et-Garonne' },
    { code: '64', name: 'Pyrénées-Atlantiques' },
    { code: '79', name: 'Deux-Sèvres' },
    { code: '86', name: 'Vienne' },
    { code: '87', name: 'Haute-Vienne' },
  ],
  'Occitanie': [
    { code: '09', name: 'Ariège' },
    { code: '11', name: 'Aude' },
    { code: '12', name: 'Aveyron' },
    { code: '30', name: 'Gard' },
    { code: '31', name: 'Haute-Garonne' },
    { code: '32', name: 'Gers' },
    { code: '34', name: 'Hérault' },
    { code: '46', name: 'Lot' },
    { code: '48', name: 'Lozère' },
    { code: '65', name: 'Hautes-Pyrénées' },
    { code: '66', name: 'Pyrénées-Orientales' },
    { code: '81', name: 'Tarn' },
    { code: '82', name: 'Tarn-et-Garonne' },
  ],
  'Bretagne': [
    { code: '22', name: 'Côtes-d\'Armor' },
    { code: '29', name: 'Finistère' },
    { code: '35', name: 'Ille-et-Vilaine' },
    { code: '56', name: 'Morbihan' },
  ],
  'Pays de la Loire': [
    { code: '44', name: 'Loire-Atlantique' },
    { code: '49', name: 'Maine-et-Loire' },
    { code: '53', name: 'Mayenne' },
    { code: '72', name: 'Sarthe' },
    { code: '85', name: 'Vendée' },
  ],
  'Grand Est': [
    { code: '08', name: 'Ardennes' },
    { code: '10', name: 'Aube' },
    { code: '51', name: 'Marne' },
    { code: '52', name: 'Haute-Marne' },
    { code: '54', name: 'Meurthe-et-Moselle' },
    { code: '55', name: 'Meuse' },
    { code: '57', name: 'Moselle' },
    { code: '67', name: 'Bas-Rhin' },
    { code: '68', name: 'Haut-Rhin' },
    { code: '88', name: 'Vosges' },
  ],
  'Hauts-de-France': [
    { code: '02', name: 'Aisne' },
    { code: '59', name: 'Nord' },
    { code: '60', name: 'Oise' },
    { code: '62', name: 'Pas-de-Calais' },
    { code: '80', name: 'Somme' },
  ],
  'Normandie': [
    { code: '14', name: 'Calvados' },
    { code: '27', name: 'Eure' },
    { code: '50', name: 'Manche' },
    { code: '61', name: 'Orne' },
    { code: '76', name: 'Seine-Maritime' },
  ],
  'Centre-Val de Loire': [
    { code: '18', name: 'Cher' },
    { code: '28', name: 'Eure-et-Loir' },
    { code: '36', name: 'Indre' },
    { code: '37', name: 'Indre-et-Loire' },
    { code: '41', name: 'Loir-et-Cher' },
    { code: '45', name: 'Loiret' },
  ],
  'Bourgogne-Franche-Comté': [
    { code: '21', name: 'Côte-d\'Or' },
    { code: '25', name: 'Doubs' },
    { code: '39', name: 'Jura' },
    { code: '58', name: 'Nièvre' },
    { code: '70', name: 'Haute-Saône' },
    { code: '71', name: 'Saône-et-Loire' },
    { code: '89', name: 'Yonne' },
    { code: '90', name: 'Territoire de Belfort' },
  ],
  'Corse': [
    { code: '2A', name: 'Corse-du-Sud' },
    { code: '2B', name: 'Haute-Corse' },
  ],
  'DOM-TOM': [
    { code: '971', name: 'Guadeloupe' },
    { code: '972', name: 'Martinique' },
    { code: '973', name: 'Guyane' },
    { code: '974', name: 'La Réunion' },
    { code: '976', name: 'Mayotte' },
  ],
};

const DEFAULT_PROMPT = `Tu es un expert en réparation de smartphones en France. Génère une liste de boutiques de réparation de téléphones RÉELLES et UNIQUES pour {zoneName}.

IMPORTANT: 
- Génère des données réalistes avec des noms d'entreprises crédibles et variés
- Utilise des adresses complètes avec numéros de rue DIFFÉRENTS
- Les numéros de téléphone doivent être valides au format français
- Évite les doublons de noms

Pour chaque réparateur, fournis EXACTEMENT ce format JSON:
{
  "name": "Nom de la boutique (ex: Phone Repair Express, iDoctor, MobileFix, Dr Phone, etc.)",
  "address": "Adresse complète avec numéro de rue (ex: 15 rue du Commerce)",
  "postal_code": "{zoneCode}",
  "city": "{zoneName}",
  "phone": "Numéro au format 01 23 45 67 89 ou 06 12 34 56 78",
  "services": ["Réparation écran", "Changement batterie", "Réparation connecteur"],
  "description": "Description courte de la boutique (30 mots max)"
}

RETOURNE UNIQUEMENT un tableau JSON valide, sans texte avant ou après, sans balises markdown.`;

const RealScrapingDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('Île-de-France');
  const [selectedDepartment, setSelectedDepartment] = useState('75');
  const [testMode, setTestMode] = useState(true);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<ScrapedRepairer[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [promptOpen, setPromptOpen] = useState(false);
  const [selectedAI, setSelectedAI] = useState('lovable');
  const { toast } = useToast();

  useEffect(() => {
    loadScrapingLogs();
    checkActiveScrapingStatus();
    
    const interval = setInterval(() => {
      if (isScrapingActive) {
        loadScrapingLogs();
        checkActiveScrapingStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isScrapingActive]);

  // Mettre à jour le département quand la région change
  useEffect(() => {
    const departments = DEPARTMENTS_BY_REGION[selectedRegion];
    if (departments && departments.length > 0) {
      setSelectedDepartment(departments[0].code);
    }
  }, [selectedRegion]);

  const loadScrapingLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des logs:', error);
    }
  };

  const checkActiveScrapingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('id')
        .eq('status', 'running')
        .limit(1);

      if (error) throw error;
      setIsScrapingActive((data || []).length > 0);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
    }
  };

  const startScraping = async () => {
    if (isScrapingActive) {
      toast({
        title: "Scraping déjà actif",
        description: "Un processus de scraping est déjà en cours.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setPreviewResults([]);
    setSelectedItems(new Set());
    setCurrentLogId(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-scrape-repairers', {
        body: {
          department_code: selectedDepartment,
          test_mode: testMode,
          ai_provider: selectedAI,
          custom_prompt: customPrompt !== DEFAULT_PROMPT ? customPrompt : undefined
        }
      });

      if (error) throw error;

      if (data?.success) {
        setPreviewResults(data.results || []);
        setCurrentLogId(data.log_id);
        // Sélectionner tous par défaut
        setSelectedItems(new Set(data.results?.map((_: any, i: number) => i) || []));
        
        toast({
          title: "Scraping terminé",
          description: `${data.total_found} réparateurs trouvés. Vérifiez et validez les résultats.`,
        });
        await loadScrapingLogs();
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du scraping:', error);
      toast({
        title: "Erreur de scraping",
        description: error.message || 'Impossible de démarrer le scraping',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(previewResults.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const validateAndInsert = async () => {
    if (!currentLogId || selectedItems.size === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un réparateur à importer.",
        variant: "destructive"
      });
      return;
    }

    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-scraping', {
        body: {
          log_id: currentLogId,
          selected_ids: Array.from(selectedItems),
          results: previewResults
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Import réussi !",
          description: data.message,
        });
        setPreviewResults([]);
        setSelectedItems(new Set());
        setCurrentLogId(null);
        await loadScrapingLogs();
      } else {
        throw new Error(data?.error || 'Erreur lors de la validation');
      }
    } catch (error: any) {
      console.error('❌ Erreur validation:', error);
      toast({
        title: "Erreur de validation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handleGeocodeRepairers = async () => {
    setGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-repairers', {
        body: { limit: 50 }
      });
      
      if (error) throw error;
      
      toast({
        title: "Géocodage terminé",
        description: data?.message || `${data?.geocoded || 0} réparateurs géocodés`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de géocoder les réparateurs",
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer tout l'historique des scrapings ?")) {
      return;
    }

    setDeletingHistory(true);
    try {
      const { error } = await supabase
        .from('scraping_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tous

      if (error) throw error;

      setLogs([]);
      toast({
        title: "Historique supprimé",
        description: "Tout l'historique des scrapings a été supprimé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'historique",
        variant: "destructive"
      });
    } finally {
      setDeletingHistory(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />;
      case 'preview':
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      completed: { variant: 'default', label: 'Terminé' },
      failed: { variant: 'destructive', label: 'Échoué' },
      running: { variant: 'secondary', label: 'En cours' },
      preview: { variant: 'outline', label: 'Prévisualisation' },
    };
    
    const { variant, label } = config[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const currentDepartments = DEPARTMENTS_BY_REGION[selectedRegion] || [];

  return (
    <div className="space-y-6">
      {/* Configuration du scraping */}
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Génération de réparateurs avec l'IA
          </CardTitle>
          <CardDescription>
            Génération automatisée via Lovable AI avec prévisualisation avant insertion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Région</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(DEPARTMENTS_BY_REGION).map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Département</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentDepartments.map(dept => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">IA utilisée</label>
              <Select value={selectedAI} onValueChange={setSelectedAI}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_OPTIONS.map(ai => (
                    <SelectItem key={ai.id} value={ai.id}>
                      <span className="flex items-center gap-2">
                        <ai.icon className="h-4 w-4" />
                        {ai.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mode test */}
          <div className="flex items-center gap-2">
            <Checkbox 
              id="testMode" 
              checked={testMode} 
              onCheckedChange={(checked) => setTestMode(checked === true)}
            />
            <label htmlFor="testMode" className="text-sm font-medium cursor-pointer">
              Mode test (limité à ~15 résultats)
            </label>
          </div>

          {/* Éditeur de prompt */}
          <Collapsible open={promptOpen} onOpenChange={setPromptOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Personnaliser le prompt IA
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${promptOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="space-y-2">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Prompt personnalisé pour la génération IA..."
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles : {'{zoneName}'}, {'{zoneCode}'}, {'{count}'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomPrompt(DEFAULT_PROMPT)}
                >
                  Réinitialiser le prompt
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={startScraping}
              disabled={loading || isScrapingActive}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              🤖 Générer avec l'IA
            </Button>

            <Button
              onClick={handleGeocodeRepairers}
              disabled={geocoding}
              variant="secondary"
            >
              {geocoding ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Géocoder réparateurs
            </Button>
          </div>

          {isScrapingActive && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />
                <span className="font-medium text-orange-800 dark:text-orange-200">Scraping en cours...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prévisualisation des résultats */}
      {previewResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Prévisualisation ({previewResults.length} résultats)
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Tout sélectionner
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Tout désélectionner
                </Button>
              </div>
            </div>
            <CardDescription>
              {selectedItems.size} réparateur(s) sélectionné(s) pour import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {previewResults.map((repairer, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.has(index) ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSelectItem(index)}
                  >
                    <Checkbox 
                      checked={selectedItems.has(index)}
                      onCheckedChange={() => toggleSelectItem(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-shrink-0">
                      {repairer.logo_url ? (
                        <img 
                          src={repairer.logo_url} 
                          alt={repairer.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(repairer.name)}`;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{repairer.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{repairer.address}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{repairer.city} ({repairer.postal_code})</span>
                        {repairer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {repairer.phone}
                          </span>
                        )}
                        {repairer.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Site web
                          </span>
                        )}
                      </div>
                    </div>
                    {repairer.latitude && repairer.longitude && (
                      <Badge variant="outline" className="flex-shrink-0">
                        📍 Géolocalisé
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t flex justify-end">
              <Button 
                onClick={validateAndInsert}
                disabled={validating || selectedItems.size === 0}
                className="min-w-[200px]"
              >
                {validating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Importer {selectedItems.size} réparateur(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des scrapings</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadScrapingLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button 
                onClick={handleDeleteHistory} 
                variant="destructive" 
                size="sm"
                disabled={deletingHistory || logs.length === 0}
              >
                {deletingHistory ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Supprimer tout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique de scraping</p>
                <p className="text-sm">Lancez votre premier scraping pour voir les résultats ici</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.source}</span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Démarré: {new Date(log.started_at).toLocaleString('fr-FR')}
                      </div>
                      {log.completed_at && (
                        <div className="text-sm text-muted-foreground">
                          Durée: {formatDuration(log.started_at, log.completed_at)}
                        </div>
                      )}
                      {log.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          Erreur: {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {log.items_scraped || 0} trouvés
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.items_added || 0} ajoutés, {log.items_updated || 0} modifiés
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealScrapingDashboard;
