
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogPostEditorHeaderProps {
  post: BlogPost | null | undefined;
  onCancel: () => void;
  aiGenerated: boolean;
}

const BlogPostEditorHeader: React.FC<BlogPostEditorHeaderProps> = ({
  post,
  onCancel
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
    </div>
  );
};

export default BlogPostEditorHeader;
