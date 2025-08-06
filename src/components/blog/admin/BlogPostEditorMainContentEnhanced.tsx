
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import ContentPreview from './ContentPreview';
import TemplateSelector from './TemplateSelector';
import EnhancedFileUploadButton from './EnhancedFileUploadButton';
import BlogHeaderSection from './editor/BlogHeaderSection';
import ContentEditorToolbar from './editor/ContentEditorToolbar';

interface BlogPostEditorMainContentEnhancedProps {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onExcerptChange: (excerpt: string) => void;
  onContentChange: (content: string) => void;
}

const BlogPostEditorMainContentEnhanced: React.FC<BlogPostEditorMainContentEnhancedProps> = ({
  title,
  slug,
  excerpt,
  content,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onContentChange
}) => {
  const [editorMode, setEditorMode] = useState<'markdown' | 'simple'>('markdown');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleTemplateSelect = (templateContent: string) => {
    const newContent = content + '\n\n' + templateContent;
    onContentChange(newContent);
    setShowTemplates(false);
  };

  const handleFileContent = (fileContent: string) => {
    const newContent = content + '\n\n' + fileContent;
    onContentChange(newContent);
    setShowFileUpload(false);
  };

  return (
    <div className="space-y-6">
      <BlogHeaderSection
        title={title}
        slug={slug}
        excerpt={excerpt}
        content={content}
        onTitleChange={onTitleChange}
        onSlugChange={onSlugChange}
        onExcerptChange={onExcerptChange}
      />

      <div>
        <ContentEditorToolbar
          content={content}
          editorMode={editorMode}
          showTemplates={showTemplates}
          showFileUpload={showFileUpload}
          onContentChange={onContentChange}
          onEditorModeChange={setEditorMode}
          onToggleTemplates={() => setShowTemplates(!showTemplates)}
          onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
        />

        {showTemplates && (
          <div className="mb-4">
            <TemplateSelector onTemplateSelect={handleTemplateSelect} />
          </div>
        )}

        {showFileUpload && (
          <div className="mb-4">
            <EnhancedFileUploadButton onFileContent={handleFileContent} />
          </div>
        )}

        {editorMode === 'markdown' ? (
          <MarkdownEditor
            value={content}
            onChange={onContentChange}
            title="Contenu de l'article"
            placeholder="# Mon titre d'article

Commencez à écrire votre contenu en Markdown...

## Sous-titre

Votre contenu avec **formatage**, *italique*, et [liens](https://example.com).

### Liste de vérification
- [ ] Tâche 1
- [x] Tâche terminée

> 💡 **Conseil**: Utilisez les templates ci-dessus pour insérer rapidement du contenu formaté."
            height={500}
          />
        ) : (
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Édition
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Aperçu
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Contenu de votre article..."
                    rows={20}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <ContentPreview content={content} title="Aperçu de l'article" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default BlogPostEditorMainContentEnhanced;
