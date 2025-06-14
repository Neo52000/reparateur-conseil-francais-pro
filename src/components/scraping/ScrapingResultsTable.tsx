
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain } from 'lucide-react';
import ScrapingResultRow from './ScrapingResultRow';

interface RepairerResult {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  services: string[];
  price_range: string;
  source: string;
  is_verified: boolean;
  rating?: number;
  scraped_at: string;
}

interface ScrapingResultsTableProps {
  results: RepairerResult[];
  loading: boolean;
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
  onView: (result: RepairerResult) => void;
  onEdit: (result: RepairerResult) => void;
}

const ScrapingResultsTable = ({
  results,
  loading,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit
}: ScrapingResultsTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedItems.length === results.length && results.length > 0}
                  onChange={onSelectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Brain className="h-6 w-6 animate-pulse mr-2" />
                    Chargement des résultats...
                  </div>
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Aucun résultat trouvé
                </TableCell>
              </TableRow>
            ) : (
              results.map((result) => (
                <ScrapingResultRow
                  key={result.id}
                  result={result}
                  isSelected={selectedItems.includes(result.id)}
                  onSelectItem={onSelectItem}
                  onView={onView}
                  onEdit={onEdit}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScrapingResultsTable;
