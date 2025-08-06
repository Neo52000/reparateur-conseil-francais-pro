
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SOURCES } from './scrapingConstants';

interface ScrapingSourceSelectorProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

const ScrapingSourceSelector: React.FC<ScrapingSourceSelectorProps> = ({
  selectedSource,
  onSourceChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Source de données</label>
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SOURCES.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              <div className="flex items-center">
                <span className="mr-2">{source.icon}</span>
                <div>
                  <div className="font-medium">{source.name}</div>
                  <div className="text-xs text-gray-500">{source.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScrapingSourceSelector;
