
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Code, Upload } from 'lucide-react';
import AIEnhancementButton from '../AIEnhancementButton';

interface ContentEditorToolbarProps {
  content: string;
  editorMode: 'markdown' | 'simple';
  showTemplates: boolean;
  showFileUpload: boolean;
  onContentChange: (content: string) => void;
  onEditorModeChange: (mode: 'markdown' | 'simple') => void;
  onToggleTemplates: () => void;
  onToggleFileUpload: () => void;
}

const ContentEditorToolbar: React.FC<ContentEditorToolbarProps> = ({
  content,
  editorMode,
  showTemplates,
  showFileUpload,
  onContentChange,
  onEditorModeChange,
  onToggleTemplates,
  onToggleFileUpload
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Contenu de l'article</h3>
        <AIEnhancementButton
          field="content"
          currentValue={content}
          onEnhanced={onContentChange}
          size="sm"
          content={content}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTemplates}
        >
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFileUpload}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importer fichier
        </Button>
        <Badge variant={editorMode === 'markdown' ? 'default' : 'outline'}>
          Markdown
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditorModeChange(editorMode === 'markdown' ? 'simple' : 'markdown')}
        >
          {editorMode === 'markdown' ? (
            <>
              <Code className="h-4 w-4 mr-2" />
              Mode simple
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Mode Markdown
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContentEditorToolbar;
