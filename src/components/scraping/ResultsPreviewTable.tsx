import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Check, 
  X, 
  Edit, 
  MapPin, 
  Phone, 
  Globe,
  Star,
  Database,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScrapedResult {
  id?: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  lat?: number;
  lng?: number;
  confidence?: number;
  source: string;
  services?: string[];
  specialties?: string[];
  price_range?: string;
}

interface ResultsPreviewTableProps {
  results: ScrapedResult[];
  onResultsChange: (results: ScrapedResult[]) => void;
  onIntegrateToDatabase: (selectedResults: ScrapedResult[]) => void;
  isIntegrating?: boolean;
}

const ResultsPreviewTable: React.FC<ResultsPreviewTableProps> = ({
  results,
  onResultsChange,
  onIntegrateToDatabase,
  isIntegrating = false
}) => {
  const { toast } = useToast();
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const handleSelectResult = (resultIndex: number) => {
    const resultId = `result-${resultIndex}`;
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResults.length === results.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(results.map((_, index) => `result-${index}`));
    }
  };

  const handleEditResult = (resultIndex: number, field: string, value: string) => {
    const updatedResults = results.map((result, index) => 
      index === resultIndex 
        ? { ...result, [field]: value }
        : result
    );
    onResultsChange(updatedResults);
  };

  const handleDeleteResult = (resultIndex: number) => {
    const updatedResults = results.filter((_, index) => index !== resultIndex);
    onResultsChange(updatedResults);
    
    // Mettre à jour les sélections
    const resultId = `result-${resultIndex}`;
    setSelectedResults(prev => prev.filter(id => id !== resultId));
    
    toast({
      title: "Résultat supprimé",
      description: "Le résultat a été retiré de la liste"
    });
  };

  const handleIntegrate = () => {
    const selectedIndices = selectedResults.map(id => parseInt(id.split('-')[1]));
    const resultsToIntegrate = results.filter((_, index) => selectedIndices.includes(index));
    
    if (resultsToIntegrate.length === 0) {
      toast({
        title: "Aucun résultat sélectionné",
        description: "Veuillez sélectionner au moins un résultat à intégrer",
        variant: "destructive"
      });
      return;
    }
    
    onIntegrateToDatabase(resultsToIntegrate);
  };

  const getQualityScore = (result: ScrapedResult): number => {
    let score = 0;
    
    // Score basé sur la complétude des données
    if (result.name) score += 20;
    if (result.address && result.address !== 'Adresse non disponible') score += 15;
    if (result.phone && result.phone !== 'Non disponible') score += 15;
    if (result.email) score += 10;
    if (result.website) score += 10;
    if (result.lat && result.lng) score += 15;
    if (result.description && result.description.length > 20) score += 10;
    if (result.confidence && result.confidence > 0.7) score += 5;
    
    return Math.min(100, score);
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-admin-green text-white">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-admin-orange text-white">Bon</Badge>;
    if (score >= 40) return <Badge className="bg-admin-yellow text-black">Moyen</Badge>;
    return <Badge variant="destructive">Faible</Badge>;
  };

  const filteredResults = showOnlySelected 
    ? results.filter((_, index) => selectedResults.includes(`result-${index}`))
    : results;

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Aucun résultat
          </h3>
          <p className="text-muted-foreground">
            Lancez un scraping pour voir les résultats ici
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-admin-blue" />
              Résultats du Scraping ({results.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnlySelected(!showOnlySelected)}
                className="flex items-center space-x-2"
              >
                {showOnlySelected ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showOnlySelected ? 'Voir tout' : 'Sélectionnés uniquement'}</span>
              </Button>
              <Button
                onClick={handleIntegrate}
                disabled={selectedResults.length === 0 || isIntegrating}
                className="bg-admin-green hover:bg-admin-green/90"
              >
                <Database className="h-4 w-4 mr-2" />
                Intégrer en Base ({selectedResults.length})
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tableau des résultats */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96 w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedResults.length === results.length && results.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Qualité</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result, actualIndex) => {
                  const resultIndex = results.findIndex(r => r === result);
                  const resultId = `result-${resultIndex}`;
                  const isSelected = selectedResults.includes(resultId);
                  const qualityScore = getQualityScore(result);
                  
                  return (
                    <TableRow key={resultIndex} className={isSelected ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectResult(resultIndex)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            value={result.name}
                            onChange={(e) => handleEditResult(resultIndex, 'name', e.target.value)}
                            className="font-medium text-sm border-none p-0 h-auto focus-visible:ring-0"
                          />
                          {result.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            value={result.address}
                            onChange={(e) => handleEditResult(resultIndex, 'address', e.target.value)}
                            className="text-xs border-none p-0 h-auto focus-visible:ring-0"
                          />
                          <div className="flex items-center space-x-1 text-xs">
                            <span>{result.postal_code}</span>
                            <span>{result.city}</span>
                            {result.lat && result.lng && (
                              <MapPin className="h-3 w-3 text-admin-green" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {result.phone && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <Input
                                value={result.phone}
                                onChange={(e) => handleEditResult(resultIndex, 'phone', e.target.value)}
                                className="border-none p-0 h-auto focus-visible:ring-0"
                              />
                            </div>
                          )}
                          {result.website && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Globe className="h-3 w-3" />
                              <span className="truncate max-w-24">{result.website}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getQualityBadge(qualityScore)}
                          <div className="text-xs text-muted-foreground">
                            {qualityScore}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {result.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResult(resultIndex)}
                          className="h-8 w-8 p-0 text-admin-red hover:text-admin-red hover:bg-admin-red/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{results.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-admin-green">{selectedResults.length}</div>
              <div className="text-xs text-muted-foreground">Sélectionnés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-admin-orange">
                {results.filter(r => getQualityScore(r) >= 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Qualité OK</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-admin-blue">
                {results.filter(r => r.lat && r.lng).length}
              </div>
              <div className="text-xs text-muted-foreground">Géolocalisés</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPreviewTable;