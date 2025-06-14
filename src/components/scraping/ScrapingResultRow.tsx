
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { 
  Eye, 
  CheckCircle, 
  XCircle,
  MapPin,
  Phone,
  Globe,
  Star,
  Edit
} from 'lucide-react';

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

interface ScrapingResultRowProps {
  result: RepairerResult;
  isSelected: boolean;
  onSelectItem: (id: string) => void;
  onView: (result: RepairerResult) => void;
  onEdit: (result: RepairerResult) => void;
}

const ScrapingResultRow = ({
  result,
  isSelected,
  onSelectItem,
  onView,
  onEdit
}: ScrapingResultRowProps) => {
  const getPriceRangeBadge = (range: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[range as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <TableRow key={result.id}>
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectItem(result.id)}
          className="rounded"
        />
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{result.name}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {result.address}, {result.city}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {result.phone && (
            <div className="text-sm flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {result.phone}
            </div>
          )}
          {result.website && (
            <div className="text-sm flex items-center">
              <Globe className="h-3 w-3 mr-1" />
              <a href={result.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                Site web
              </a>
            </div>
          )}
          {result.rating && (
            <div className="text-sm flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              {result.rating}/5
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {result.services?.slice(0, 2).map((service, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
          {result.services?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{result.services.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getPriceRangeBadge(result.price_range)}>
          {result.price_range}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {result.source}
        </Badge>
      </TableCell>
      <TableCell>
        {result.is_verified ? (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Vérifié
          </Badge>
        ) : (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(result)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(result)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ScrapingResultRow;
