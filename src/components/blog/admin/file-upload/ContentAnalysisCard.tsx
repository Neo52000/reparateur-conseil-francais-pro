
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ContentComparison } from '@/services/blog/contentPreprocessor';

interface ContentAnalysisCardProps {
  comparison: ContentComparison;
}

const ContentAnalysisCard: React.FC<ContentAnalysisCardProps> = ({ comparison }) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="text-sm space-y-1">
          <p><strong>Analyse des modifications:</strong></p>
          <p>• Lignes modifiées: {comparison.linesChanged}</p>
          <p>• Caractères modifiés: {comparison.charactersChanged}</p>
          {comparison.majorChanges.length > 0 && (
            <div>
              <p>• Changements majeurs:</p>
              <ul className="ml-4 list-disc">
                {comparison.majorChanges.map((change: string, index: number) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentAnalysisCard;
