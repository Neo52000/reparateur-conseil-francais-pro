
import React, { useState, useEffect } from 'react';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import AIImageGenerator from './AIImageGenerator';
import BlogPostEditorHeader from './BlogPostEditorHeader';
import BlogPostEditorMainContent from './BlogPostEditorMainContent';
import BlogPostEditorImageSection from './BlogPostEditorImageSection';
import BlogPostEditorSidebar from './BlogPostEditorSidebar';

interface BlogPostEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
  const { savePost, fetchCategories } = useBlog();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    visibility: 'public' as 'public' | 'repairers' | 'both',
    status: 'draft' as 'draft' | 'pending' | 'scheduled' | 'published' | 'archived',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    keywords: [] as string[],
    ai_generated: false,
    view_count: 0,
    comment_count: 0,
    share_count: 0
  });

  useEffect(() => {
    loadCategories();
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        category_id: post.category_id || '',
        visibility: post.visibility,
        status: post.status,
        featured_image_url: post.featured_image_url || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        keywords: post.keywords || [],
        ai_generated: post.ai_generated,
        view_count: post.view_count,
        comment_count: post.comment_count,
        share_count: post.share_count
      });
    }
  }, [post]);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleKeywordsChange = (keywordsStr: string) => {
    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);
    setFormData(prev => ({ ...prev, keywords }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Erreur",
        description: "Le titre et le contenu sont requis",
        variant: "destructive"
      });
      return;
    }

    const postData = {
      ...formData,
      id: post?.id
    };

    const result = await savePost(postData);
    if (result) {
      onSave();
    }
  };

  return (
    <div className="space-y-6">
      <BlogPostEditorHeader
        post={post}
        onCancel={onCancel}
        aiGenerated={formData.ai_generated}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BlogPostEditorMainContent
            title={formData.title}
            slug={formData.slug}
            excerpt={formData.excerpt}
            content={formData.content}
            onTitleChange={handleTitleChange}
            onSlugChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
            onExcerptChange={(excerpt) => setFormData(prev => ({ ...prev, excerpt }))}
            onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
          />

          <BlogPostEditorImageSection
            featuredImageUrl={formData.featured_image_url}
            onImageUrlChange={(featured_image_url) => setFormData(prev => ({ ...prev, featured_image_url }))}
            onShowImageGenerator={() => setShowImageGenerator(true)}
          />
        </div>

        <BlogPostEditorSidebar
          status={formData.status}
          visibility={formData.visibility}
          categoryId={formData.category_id}
          metaTitle={formData.meta_title}
          metaDescription={formData.meta_description}
          keywords={formData.keywords}
          categories={categories}
          onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
          onVisibilityChange={(visibility) => setFormData(prev => ({ ...prev, visibility }))}
          onCategoryChange={(category_id) => setFormData(prev => ({ ...prev, category_id }))}
          onMetaTitleChange={(meta_title) => setFormData(prev => ({ ...prev, meta_title }))}
          onMetaDescriptionChange={(meta_description) => setFormData(prev => ({ ...prev, meta_description }))}
          onKeywordsChange={handleKeywordsChange}
          onSave={handleSave}
        />
      </div>

      {showImageGenerator && (
        <AIImageGenerator
          onImageGenerated={(imageUrl) => {
            setFormData(prev => ({ ...prev, featured_image_url: imageUrl }));
            setShowImageGenerator(false);
          }}
          onClose={() => setShowImageGenerator(false)}
          articleTitle={formData.title}
        />
      )}
    </div>
  );
};

export default BlogPostEditor;
