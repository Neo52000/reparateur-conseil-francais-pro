import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Smartphone, 
  MapPin, 
  Zap, 
  FileText, 
  Download, 
  Settings,
  Wand2,
  Globe,
  DollarSign,
  MessageSquare,
  Leaf,
  Search,
  RefreshCw,
  Copy,
  Eye
} from 'lucide-react';

interface RepairTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  targetAudience: 'public' | 'repairers' | 'both';
  category: string;
  variables: string[];
}

interface GenerationConfig {
  city: string;
  postalCode: string;
  deviceType: string;
  repairType: string;
  template: string;
  includePricing: boolean;
  includeTestimonials: boolean;
  includeEcoData: boolean;
  includeLocalLinks: boolean;
  wordCount: number;
  tone: 'professional' | 'friendly' | 'technical';
}

interface GeneratedContent {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  excerpt: string;
  structure: {
    h1: string;
    h2Sections: string[];
    callToAction: string;
  };
  pricingTable?: any;
  testimonials?: any[];
  ecoData?: any;
  internalLinks?: Array<{title: string; url: string}>;
}

const RepairContentGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const [repairTypes, setRepairTypes] = useState<string[]>([]);
  const [templates, setTemplates] = useState<RepairTemplate[]>([]);
  const [config, setConfig] = useState<GenerationConfig>({
    city: '',
    postalCode: '',
    deviceType: 'smartphone',
    repairType: 'écran',
    template: 'guide-local',
    includePricing: true,
    includeTestimonials: true,
    includeEcoData: true,
    includeLocalLinks: true,
    wordCount: 700,
    tone: 'friendly'
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    fetchInitialData();
    initializeTemplates();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Récupérer les villes depuis les réparateurs
      const { data: repairers } = await supabase
        .from('repairers')
        .select('city')
        .not('city', 'is', null);

      if (repairers) {
        const uniqueCities = [...new Set(repairers.map(r => r.city))].sort();
        setCities(uniqueCities);
      }

      // Récupérer les types d'appareils
      const { data: brands } = await supabase
        .from('brands')
        .select('name');

      if (brands) {
        setDeviceTypes(['smartphone', 'tablette', 'ordinateur portable', 'console de jeu']);
      }

      // Types de réparation courants
      setRepairTypes([
        'écran', 'batterie', 'caméra', 'haut-parleur', 
        'microphone', 'connecteur de charge', 'bouton power',
        'vitre arrière', 'carte mère', 'mémoire'
      ]);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const initializeTemplates = async () => {
    try {
      // Charger les templates depuis la base de données
      const { data: dbTemplates, error } = await supabase
        .from('repair_content_templates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Erreur chargement templates DB:', error);
        // Fallback sur les templates par défaut
        setTemplates(getDefaultTemplates());
        return;
      }

      // Convertir les templates DB au format attendu
      const convertedTemplates: RepairTemplate[] = (dbTemplates || []).map(template => ({
        id: template.id,
        name: template.name,
        description: `Template ${template.category} pour ${template.device_type || 'tout appareil'}`,
        prompt: template.content_template,
        targetAudience: 'both' as const,
        category: template.category,
        variables: Object.keys(template.variables || {})
      }));

      // Ajouter les templates par défaut si la DB est vide
      if (convertedTemplates.length === 0) {
        setTemplates(getDefaultTemplates());
      } else {
        setTemplates([...convertedTemplates, ...getDefaultTemplates()]);
      }
    } catch (error) {
      console.error('Erreur initialisation templates:', error);
      setTemplates(getDefaultTemplates());
    }
  };

  const getDefaultTemplates = (): RepairTemplate[] => {
    return [
      {
        id: 'guide-local',
        name: 'Guide Réparation Local',
        description: 'Guide complet de réparation avec focus local et prix',
        prompt: `Rédigez un guide complet de 700 mots sur la réparation de {deviceType} à {city}. 
        Incluez un tableau des prix moyens, 3 conseils écoresponsables, 
        et terminez par un CTA vers les réparateurs locaux.`,
        targetAudience: 'public',
        category: 'guide',
        variables: ['city', 'deviceType', 'repairType', 'averagePrice']
      },
      {
        id: 'eco-impact',
        name: 'Impact Écologique',
        description: 'Article sur l\'impact environnemental de la réparation',
        prompt: `Créez un article sur l'impact écologique de la réparation de {deviceType} à {city}. 
        Incluez des statistiques CO2, témoignages clients de {city}, 
        et un tableau comparatif prix réparation/neuf.`,
        targetAudience: 'both',
        category: 'écologie',
        variables: ['city', 'deviceType', 'co2Savings', 'testimonials']
      },
      {
        id: 'local-news',
        name: 'Actualité Réparation Locale',
        description: 'Article d\'actualité sur les tendances locales',
        prompt: `Rédigez un article d'actualité sur les tendances de réparation {deviceType} à {city}. 
        Utilisez les données de {repairerCount} réparateurs locaux, 
        prix moyens {averagePrice}€, et 2 témoignages récents.`,
        targetAudience: 'public',
        category: 'actualité',
        variables: ['city', 'deviceType', 'repairerCount', 'averagePrice']
      }
    ];
  };

  const generateContent = async () => {
    if (!config.city || !config.deviceType) {
      toast.error('Veuillez sélectionner une ville et un type d\'appareil');
      return;
    }

    setLoading(true);
    try {
      // 1. Récupérer les données locales
      const localData = await fetchLocalData();
      
      // 2. Générer le contenu via IA
      console.log('📝 Début génération IA...');
      const content = await generateAIContent(localData);
      console.log('✅ Contenu IA généré:', content);
      
      // 3. Enrichir avec les données locales
      const enrichedContent = await enrichContent(content, localData);
      console.log('🎯 Contenu enrichi final:', enrichedContent);
      
      setGeneratedContent(enrichedContent);
      setPreviewMode('preview'); // Basculer automatiquement en mode préview
      toast.success('Contenu généré avec succès');
      
    } catch (error) {
      console.error('Erreur génération contenu:', error);
      toast.error('Erreur lors de la génération du contenu');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalData = async () => {
    // Récupérer les réparateurs locaux
    const { data: localRepairers } = await supabase
      .from('repairers')
      .select('id, name, city')
      .ilike('city', `%${config.city}%`);

    // Récupérer les témoignages locaux
    const { data: testimonials } = await supabase
      .from('client_reviews')
      .select('comment, overall_rating')
      .eq('status', 'approved')
      .gte('overall_rating', 4)
      .limit(3);

    // Prix moyens simulés basés sur le type d'appareil et de réparation
    const mockPrices: Record<string, Record<string, number>> = {
      'smartphone': { 'écran': 80, 'batterie': 50, 'caméra': 60 },
      'tablette': { 'écran': 120, 'batterie': 70, 'caméra': 80 },
      'ordinateur portable': { 'écran': 200, 'batterie': 90, 'clavier': 60 }
    };

    const averagePrice = mockPrices[config.deviceType]?.[config.repairType] || 50;

    return {
      repairerCount: localRepairers?.length || 0,
      averagePrice,
      testimonials: testimonials || [],
      localRepairers: localRepairers || [],
      pricingData: []
    };
  };

  const generateAIContent = async (localData: any) => {
    const selectedTemplate = templates.find(t => t.id === config.template);
    if (!selectedTemplate) throw new Error('Template non trouvé');

    // Construire le prompt avec les variables
    let prompt = selectedTemplate.prompt
      .replace('{city}', config.city)
      .replace('{deviceType}', config.deviceType)
      .replace('{repairType}', config.repairType)
      .replace('{repairerCount}', localData.repairerCount.toString())
      .replace('{averagePrice}', localData.averagePrice.toFixed(0));

    // Ajouter les instructions SEO
    prompt += `\n\nExigences SEO:
    - Titre H1 optimisé avec mots-clés locaux
    - 3-4 sections H2 structurées
    - Méta-titre et description uniques
    - 5-8 mots-clés pertinents
    - Call-to-action "Trouvez un réparateur près de chez vous"
    - Ton ${config.tone} et ${config.wordCount} mots environ`;

    const response = await supabase.functions.invoke('generate-mobile-content', {
      body: {
        city: config.city,
        deviceType: config.deviceType,
        repairType: config.repairType,
        template: config.template,
        tone: config.tone,
        wordCount: config.wordCount,
        includePricing: config.includePricing,
        includeTestimonials: config.includeTestimonials,
        includeEcoData: config.includeEcoData
      }
    });

    if (response.error) {
      console.error('Erreur edge function:', response.error);
      throw new Error(response.error.message || 'Erreur génération IA');
    }

    console.log('🎯 Réponse edge function:', response.data);
    
    // Gérer différents formats de réponse
    if (response.data?.success && response.data?.content) {
      return response.data.content;
    } else if (response.data?.content) {
      return response.data.content;
    } else if (response.data) {
      return response.data;
    }
    
    throw new Error('Format de réponse inattendu de l\'API');
  };

  const enrichContent = async (content: any, localData: any): Promise<GeneratedContent> => {
    // Enrichir avec tableau de prix
    const pricingTable = config.includePricing ? generatePricingTable(localData) : null;
    
    // Ajouter témoignages
    const selectedTestimonials = config.includeTestimonials ? localData.testimonials.slice(0, 2) : [];
    
    // Données écoresponsables
    const ecoData = config.includeEcoData ? generateEcoData() : null;
    
    // Liens internes
    const internalLinks = config.includeLocalLinks ? await generateInternalLinks() : [];

    return {
      title: content.title || `Réparation ${config.deviceType} ${config.city} - Guide Complet 2024`,
      slug: `reparation-${config.deviceType.toLowerCase()}-${config.city.toLowerCase().replace(/\s+/g, '-')}`,
      content: content.content || '',
      metaTitle: content.metaTitle || `Réparation ${config.deviceType} ${config.city} | Prix et Devis Gratuit`,
      metaDescription: content.metaDescription || `Réparation ${config.deviceType} à ${config.city}. Prix transparents, réparateurs certifiés. Devis gratuit en 24h. ✓ Garantie ✓ Écologique`,
      keywords: content.keywords || [`réparation ${config.deviceType}`, `${config.city}`, `prix ${config.repairType}`, 'écologique', 'garantie'],
      excerpt: content.excerpt || '',
      structure: content.structure || {
        h1: `Réparation ${config.deviceType} ${config.city} - Guide Complet 2024`,
        h2Sections: [
          `Pourquoi réparer plutôt que racheter à ${config.city} ?`,
          `Prix moyens réparation ${config.deviceType} à ${config.city}`,
          `Témoignages clients de ${config.city}`,
          `Trouvez votre réparateur à ${config.city}`
        ],
        callToAction: 'Obtenez un devis gratuit maintenant'
      },
      pricingTable,
      testimonials: selectedTestimonials,
      ecoData,
      internalLinks
    };
  };

  const generatePricingTable = (localData: any) => {
    const basePrice = localData.averagePrice || 50;
    return {
      title: `Prix moyens réparation ${config.deviceType} à ${config.city}`,
      rows: [
        { repair: `Écran ${config.deviceType}`, price: `${Math.round(basePrice * 1.2)}€`, duration: '2h', warranty: '3 mois' },
        { repair: 'Batterie', price: `${Math.round(basePrice * 0.8)}€`, duration: '30min', warranty: '6 mois' },
        { repair: 'Connecteur charge', price: `${Math.round(basePrice * 0.6)}€`, duration: '1h', warranty: '3 mois' },
        { repair: 'Haut-parleur', price: `${Math.round(basePrice * 0.7)}€`, duration: '45min', warranty: '3 mois' }
      ]
    };
  };

  const generateEcoData = () => ({
    co2Saved: Math.round(Math.random() * 20 + 15), // 15-35 kg CO2
    lifespanExtended: Math.round(Math.random() * 12 + 12), // 12-24 mois
    wasteReduced: Math.round(Math.random() * 200 + 300), // 300-500g
    recycledParts: Math.round(Math.random() * 30 + 70) // 70-100%
  });

  const generateInternalLinks = async (): Promise<Array<{title: string; url: string}>> => {
    const { data: seoPages } = await supabase
      .from('local_seo_pages')
      .select('slug, title')
      .ilike('city', `%${config.city}%`)
      .limit(3);

    return seoPages?.map(page => ({
      title: page.title,
      url: `/ville/${page.slug}`
    })) || [];
  };

  const exportToMarkdown = () => {
    if (!generatedContent) return;

    const markdown = `---
title: "${generatedContent.title}"
slug: "${generatedContent.slug}"
meta_title: "${generatedContent.metaTitle}"
meta_description: "${generatedContent.metaDescription}"
keywords: [${generatedContent.keywords.map(k => `"${k}"`).join(', ')}]
city: "${config.city}"
device_type: "${config.deviceType}"
repair_type: "${config.repairType}"
generated_at: "${new Date().toISOString()}"
---

# ${generatedContent.structure.h1}

${generatedContent.content}

${generatedContent.pricingTable ? `
## ${generatedContent.pricingTable.title}

| Réparation | Prix | Durée | Garantie |
|------------|------|-------|----------|
${generatedContent.pricingTable.rows.map(row => 
  `| ${row.repair} | ${row.price} | ${row.duration} | ${row.warranty} |`
).join('\n')}
` : ''}

${generatedContent.testimonials?.length > 0 ? `
## Témoignages clients de ${config.city}

${generatedContent.testimonials.map(t => `
> "${t.comment}"  
> **${t.client_name || 'Client vérifié'}** - Note: ${t.overall_rating}/5 ⭐
`).join('\n')}
` : ''}

${generatedContent.ecoData ? `
## Impact écologique de la réparation

- 🌱 **CO2 économisé** : ${generatedContent.ecoData.co2Saved} kg vs achat neuf
- ⏱️ **Durée de vie prolongée** : +${generatedContent.ecoData.lifespanExtended} mois
- ♻️ **Déchets évités** : ${generatedContent.ecoData.wasteReduced}g
- 🔧 **Pièces recyclées** : ${generatedContent.ecoData.recycledParts}%
` : ''}

## ${generatedContent.structure.callToAction}

[Trouvez un réparateur près de chez vous](/search?city=${encodeURIComponent(config.city)})

${generatedContent.internalLinks?.length > 0 ? `
### Liens utiles
${generatedContent.internalLinks.map(link => `- [${link.title}](${link.url})`).join('\n')}
` : ''}
`;

    // Télécharger le fichier
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedContent.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Fichier Markdown téléchargé');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Générateur de Contenu Réparation Mobile
          </h2>
          <p className="text-muted-foreground">
            Créez du contenu optimisé SEO avec données locales et écoresponsables
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          IA + Données Locales
        </Badge>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="template">Templates</TabsTrigger>
          <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
          <TabsTrigger value="export">Export & CMS</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration de génération
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Localisation */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Localisation
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Select value={config.city} onValueChange={(value) => setConfig({...config, city: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Code postal (optionnel)</Label>
                    <Input 
                      value={config.postalCode}
                      onChange={(e) => setConfig({...config, postalCode: e.target.value})}
                      placeholder="75001"
                    />
                  </div>
                </div>

                {/* Appareil & Réparation */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Appareil & Réparation
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Type d'appareil</Label>
                    <Select value={config.deviceType} onValueChange={(value) => setConfig({...config, deviceType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type de réparation</Label>
                    <Select value={config.repairType} onValueChange={(value) => setConfig({...config, repairType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {repairTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Options de contenu */}
              <div className="space-y-4">
                <h4 className="font-semibold">Options d'enrichissement</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Tableau des prix
                    </Label>
                    <Switch 
                      checked={config.includePricing}
                      onCheckedChange={(checked) => setConfig({...config, includePricing: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Témoignages clients
                    </Label>
                    <Switch 
                      checked={config.includeTestimonials}
                      onCheckedChange={(checked) => setConfig({...config, includeTestimonials: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      Données écologiques
                    </Label>
                    <Switch 
                      checked={config.includeEcoData}
                      onCheckedChange={(checked) => setConfig({...config, includeEcoData: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Liens internes
                    </Label>
                    <Switch 
                      checked={config.includeLocalLinks}
                      onCheckedChange={(checked) => setConfig({...config, includeLocalLinks: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Paramètres de contenu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={config.template} onValueChange={(value) => setConfig({...config, template: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nombre de mots</Label>
                  <Input 
                    type="number"
                    value={config.wordCount}
                    onChange={(e) => setConfig({...config, wordCount: parseInt(e.target.value)})}
                    min={400}
                    max={1200}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ton</Label>
                  <Select value={config.tone} onValueChange={(value) => setConfig({...config, tone: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Amical</SelectItem>
                      <SelectItem value="professional">Professionnel</SelectItem>
                      <SelectItem value="technical">Technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={generateContent} 
                  disabled={loading || !config.city || !config.deviceType}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Générer le contenu
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <Button variant="outline" onClick={exportToMarkdown}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Markdown
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-colors ${
                  config.template === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setConfig({...config, template: template.id})}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge variant="secondary">{template.targetAudience}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <div className="text-xs bg-muted p-2 rounded">
                    <strong>Variables:</strong> {template.variables.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {generatedContent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prévisualisation du contenu</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={previewMode === 'edit' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('edit')}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Édition
                    </Button>
                    <Button 
                      variant={previewMode === 'preview' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('preview')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Aperçu
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {previewMode === 'edit' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Titre</Label>
                        <Input 
                          value={generatedContent.title}
                          onChange={(e) => setGeneratedContent({
                            ...generatedContent,
                            title: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input 
                          value={generatedContent.slug}
                          onChange={(e) => setGeneratedContent({
                            ...generatedContent,
                            slug: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Méta description</Label>
                      <Textarea 
                        value={generatedContent.metaDescription}
                        onChange={(e) => setGeneratedContent({
                          ...generatedContent,
                          metaDescription: e.target.value
                        })}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Contenu</Label>
                      <Textarea 
                        value={generatedContent.content}
                        onChange={(e) => setGeneratedContent({
                          ...generatedContent,
                          content: e.target.value
                        })}
                        rows={20}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => navigator.clipboard.writeText(generatedContent.content)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier le contenu
                      </Button>
                      <Button variant="outline" onClick={exportToMarkdown}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <h1>{generatedContent.title}</h1>
                    <div className="text-sm text-muted-foreground mb-4">
                      <strong>URL:</strong> /{generatedContent.slug}<br/>
                      <strong>Méta:</strong> {generatedContent.metaDescription}
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: (typeof generatedContent.content === 'string' ? generatedContent.content : String(generatedContent.content || '')).replace(/\n/g, '<br>') }} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun contenu généré</h3>
                <p className="text-muted-foreground">
                  Configurez les paramètres et générez du contenu pour voir la prévisualisation
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export et intégration CMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Fonctionnalités d'export et d'intégration disponibles une fois le contenu généré.
              </div>
              
              {generatedContent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={exportToMarkdown} className="h-auto p-4">
                    <div className="text-left">
                      <div className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Export Markdown
                      </div>
                      <div className="text-sm opacity-80">
                        Fichier .md avec frontmatter YAML
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" disabled>
                    <div className="text-left">
                      <div className="font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Webhook Notion
                      </div>
                      <div className="text-sm opacity-80">
                        Synchronisation automatique (à venir)
                      </div>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  Générez du contenu pour accéder aux options d'export
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RepairContentGenerator;