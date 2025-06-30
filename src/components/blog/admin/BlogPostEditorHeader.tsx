
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogPostEditorHeaderProps {
  post: BlogPost | null | undefined;
  onCancel: () => void;
  aiGenerated: boolean;
}

const BlogPostEditorHeader: React.FC<BlogPostEditorHeaderProps> = ({
  post,
  onCancel,
  aiGenerated
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onCancel}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      <h2 className="text-2xl font-bold">
        {post ? 'Modifier l\'article' : 'Nouvel article'}
      </h2>
      {aiGenerated && (
        <Badge variant="secondary">
          <Wand2 className="h-3 w-3 mr-1" />
          Généré par IA
        </Badge>
      )}
    </div>
  );
};

export default BlogPostEditorHeader;
