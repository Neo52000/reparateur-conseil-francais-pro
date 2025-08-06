
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, FileText, CheckCircle } from 'lucide-react';

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source?: string;
}

interface NewsItemCardProps {
  item: NewsItem;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  onGenerateBlog: (item: NewsItem) => void;
  isLast: boolean;
}

const NewsItemCard: React.FC<NewsItemCardProps> = ({
  item,
  index,
  copiedIndex,
  onCopy,
  onGenerateBlog,
  isLast
}) => {
  const handleCopy = () => {
    const text = `**${item.title}**\n\n${item.summary}\n\nDate: ${item.date || 'Non spécifiée'}\nSource: ${item.source || 'Non spécifiée'}`;
    onCopy(text, index);
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                #{index + 1}
              </span>
              {item.source && (
                <Badge variant="secondary" className="text-xs">
                  {item.source}
                </Badge>
              )}
              {item.date && (
                <span className="text-xs text-muted-foreground">
                  {item.date}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">
              {item.title}
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              {item.summary}
            </p>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Copier cette actualité"
            >
              {copiedIndex === index ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => onGenerateBlog(item)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Générer un article de blog"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {!isLast && <Separator className="mt-4" />}
    </div>
  );
};

export default NewsItemCard;
