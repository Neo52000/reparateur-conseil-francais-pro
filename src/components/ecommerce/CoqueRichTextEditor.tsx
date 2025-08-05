import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Focus from '@tiptap/extension-focus';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoqueTemplatesSelector, CoqueTemplate } from './templates/CoqueTemplates';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Table as TableIcon,
  FileText,
  Award,
  Shield
} from 'lucide-react';

interface CoqueRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
}

const CoqueRichTextEditor: React.FC<CoqueRichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Décrivez votre coque...",
  height = "400px"
}) => {
  const [viewMode, setViewMode] = React.useState<'wysiwyg' | 'html'>('wysiwyg');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('URL du lien:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  const setTextColor = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (editor) {
      editor.chain().focus().setTextAlign(alignment).run();
    }
  };

  const insertTemplate = (template: CoqueTemplate) => {
    if (editor) {
      editor.chain().focus().setContent(template.content).run();
    }
  };

  const insertQuickBadge = (type: 'warranty' | 'quality' | 'eco') => {
    if (!editor) return;
    
    const badges = {
      warranty: '<span style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">🛡️ GARANTIE 2 ANS</span>',
      quality: '<span style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">⭐ QUALITÉ PREMIUM</span>',
      eco: '<span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">🌱 ÉCO-RESPONSABLE</span>'
    };
    
    editor.chain().focus().insertContent(badges[type] + ' ').run();
  };

  if (!editor) {
    return null;
  }

  const predefinedColors = [
    '#000000', '#374151', '#6b7280', '#9ca3af',
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Éditeur de contenu coque
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="border-b border-border p-3 flex items-center gap-1 flex-wrap bg-muted/30">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === 'wysiwyg' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('wysiwyg')}
              className="rounded-r-none"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'html' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('html')}
              className="rounded-l-none"
            >
              <Code2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Templates */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <FileText className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Templates de contenu</h4>
                <CoqueTemplatesSelector onTemplateSelect={insertTemplate} />
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Alignment */}
          <Button
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTextAlign('left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTextAlign('center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTextAlign('right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTextAlign('justify')}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Colors */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Palette className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Couleur du texte</h4>
                <div className="grid grid-cols-8 gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setTextColor(color)}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Table */}
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
          >
            <TableIcon className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Media */}
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Quick Badges */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Award className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Badges rapides</h4>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => insertQuickBadge('warranty')}
                  >
                    <Shield className="w-3 h-3 mr-2" />
                    Garantie 2 ans
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => insertQuickBadge('quality')}
                  >
                    <Award className="w-3 h-3 mr-2" />
                    Qualité Premium
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => insertQuickBadge('eco')}
                  >
                    🌱 Éco-responsable
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Editor Content */}
        <div className="relative" style={{ minHeight: height }}>
          {viewMode === 'wysiwyg' ? (
            <EditorContent 
              editor={editor} 
              className="prose prose-sm max-w-none p-4 focus-within:outline-none [&_.has-focus]:ring-2 [&_.has-focus]:ring-primary/20 [&_.has-focus]:ring-offset-2"
              style={{ minHeight: height }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => {
                onChange(e.target.value);
                editor.commands.setContent(e.target.value);
              }}
              className="w-full p-4 font-mono text-sm bg-background border-0 resize-none focus:outline-none"
              style={{ minHeight: height }}
              placeholder="<h1>Votre contenu HTML...</h1>"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoqueRichTextEditor;