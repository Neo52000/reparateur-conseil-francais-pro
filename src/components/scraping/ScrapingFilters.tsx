
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Brain } from 'lucide-react';

interface ScrapingFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  resultsCount: number;
}

const ScrapingFilters = ({
  searchTerm,
  setSearchTerm,
  sourceFilter,
  setSourceFilter,
  statusFilter,
  setStatusFilter,
  resultsCount
}: ScrapingFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Résultats du Scraping IA
          </div>
          <Badge variant="secondary">
            {resultsCount} résultats
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes sources</SelectItem>
              <SelectItem value="pages_jaunes">Pages Jaunes</SelectItem>
              <SelectItem value="google_places">Google Places</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="verified">Vérifiés</SelectItem>
              <SelectItem value="unverified">Non vérifiés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingFilters;
