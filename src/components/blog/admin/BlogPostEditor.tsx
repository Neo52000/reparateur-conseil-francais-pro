
import React, { useState, useEffect } from 'react';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AIImageGenerator from './AIImageGenerator';
import BlogPostEditorHeader from './BlogPostEditorHeader';
import BlogPostEditorMainContentEnhanced from './BlogPostEditorMainContentEnhanced';
import BlogPostEditorImageSection from './BlogPostEditorImageSection';
import BlogPostEditorSidebarEnhanced from './BlogPostEditorSidebarEnhanced';
import SlugConflictModal from './SlugConflictModal';

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
  const [showSlugConflict, setShowSlugConflict] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
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
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
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

  const handleSave = async (overwriteExisting = false) => {
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

    try {
      const result = await savePost(postData, overwriteExisting);
      if (result) {
        onSave();
      }
    } catch (error: any) {
      if (error.message === 'DUPLICATE_SLUG') {
        setShowSlugConflict(true);
      }
    }
  };

  const handleSlugConflictOverwrite = async () => {
    setShowSlugConflict(false);
    await handleSave(true);
  };

  const handleSlugConflictNewSlug = async (newSlug: string) => {
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setShowSlugConflict(false);
    
    // Sauvegarder avec le nouveau slug
    const postData = {
      ...formData,
      slug: newSlug,
      id: post?.id
    };

    try {
      const result = await savePost(postData, false);
      if (result) {
        onSave();
      }
    } catch (error: any) {
      if (error.message === 'DUPLICATE_SLUG') {
        toast({
          title: "Erreur",
          description: "Ce slug existe également. Veuillez en choisir un autre.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAutoGenerateImage = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un titre d'article avant de générer une image",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Créer un prompt optimisé basé sur le titre
      const category = categories.find(c => c.id === formData.category_id);
      const categoryContext = category ? ` dans le domaine de ${category.name.toLowerCase()}` : '';
      
      const optimizedPrompt = `Create a professional blog header image for an article titled "${formData.title}"${categoryContext}. Modern, clean design, technology related, smartphone repair, professional service`;

      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: {
          prompt: optimizedPrompt,
          size: '1792x1024',
          style: 'realistic'
        }
      });

      console.log('🖼️ Image generation response:', { data, error });

      if (error) {
        console.error('🚨 Error details:', error);
        throw error;
      }

      if (data?.imageUrl) {
        setFormData(prev => ({ ...prev, featured_image_url: data.imageUrl }));
        toast({
          title: "Succès",
          description: "Image générée automatiquement et ajoutée à l'article !"
        });
      }
    } catch (error) {
      console.error('Erreur génération auto image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image automatiquement. Essayez le générateur avancé.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
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
          <BlogPostEditorMainContentEnhanced
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
            onAutoGenerateImage={handleAutoGenerateImage}
            articleTitle={formData.title}
          />
        </div>

        <BlogPostEditorSidebarEnhanced
          status={formData.status}
          visibility={formData.visibility}
          categoryId={formData.category_id}
          metaTitle={formData.meta_title}
          metaDescription={formData.meta_description}
          keywords={formData.keywords}
          categories={categories}
          title={formData.title}
          content={formData.content}
          onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
          onVisibilityChange={(visibility) => setFormData(prev => ({ ...prev, visibility }))}
          onCategoryChange={(category_id) => setFormData(prev => ({ ...prev, category_id }))}
          onMetaTitleChange={(meta_title) => setFormData(prev => ({ ...prev, meta_title }))}
          onMetaDescriptionChange={(meta_description) => setFormData(prev => ({ ...prev, meta_description }))}
          onKeywordsChange={handleKeywordsChange}
          onSave={() => handleSave(false)}
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

      <SlugConflictModal
        isOpen={showSlugConflict}
        onClose={() => setShowSlugConflict(false)}
        currentSlug={formData.slug}
        onOverwrite={handleSlugConflictOverwrite}
        onUseNewSlug={handleSlugConflictNewSlug}
      />
    </div>
  );
};

export default BlogPostEditor;
