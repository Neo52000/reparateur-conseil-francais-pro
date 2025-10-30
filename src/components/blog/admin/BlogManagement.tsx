
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings, Users, BarChart3, Newspaper, Sparkles, Zap } from 'lucide-react';
import BlogPostsManager from './BlogPostsManager';
import BlogCategoriesManager from './BlogCategoriesManager';
import BlogTemplatesManager from './BlogTemplatesManager';
import BlogAnalytics from './BlogAnalytics';
import BlogSettings from './BlogSettings';
import BlogNewsTracker from './BlogNewsTracker';
import BlogAIGenerator from './BlogAIGenerator';
import { BlogAutomationSettings } from './BlogAutomationSettings';
import { BlogPost } from '@/types/blog';

const BlogManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showNewArticleEditor, setShowNewArticleEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);

  const handleNewArticleClick = () => {
    setActiveTab('posts');
    setShowNewArticleEditor(true);
    setGeneratedPost(null);
  };

  const handleAIGeneratorClick = () => {
    setActiveTab('ai-generator');
    setShowAIGenerator(true);
  };

  const handleArticleGenerated = (post: BlogPost) => {
    setGeneratedPost(post);
    setShowAIGenerator(false);
    setActiveTab('posts');
    setShowNewArticleEditor(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion du Blog</h2>
          <p className="text-gray-600">Gérez vos articles, catégories et templates de génération IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAIGeneratorClick}>
            <Sparkles className="h-4 w-4 mr-2" />
            Générer avec IA
          </Button>
          <Button onClick={handleNewArticleClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="ai-generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Générateur IA
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Templates IA
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Actualités
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Auto
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Réglages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <BlogPostsManager 
            forceShowEditor={showNewArticleEditor}
            onEditorStateChange={setShowNewArticleEditor}
            editingPost={generatedPost}
          />
        </TabsContent>

        <TabsContent value="ai-generator" className="space-y-4">
          <BlogAIGenerator onArticleGenerated={handleArticleGenerated} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <BlogCategoriesManager />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <BlogTemplatesManager />
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <BlogNewsTracker />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <BlogAnalytics />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <BlogAutomationSettings />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <BlogSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManagement;
