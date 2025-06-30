
import React, { useState, useEffect } from 'react';
import BlogLayout from '@/components/blog/BlogLayout';
import BlogPostList from '@/components/blog/BlogPostList';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';

const BlogClientPage: React.FC = () => {
  const { fetchPosts, fetchCategories, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    const filters = {
      // Afficher les articles publics et mixtes pour les clients
      status: 'published',
      limit: 12,
      offset: currentPage * 12
    };

    const allPosts = await fetchPosts(filters);
    // Filtrer côté client pour inclure 'public' et 'both'
    const filteredPosts = allPosts.filter(post => 
      post.visibility === 'public' || post.visibility === 'both'
    );
    
    if (reset) {
      setPosts(filteredPosts);
      setPage(1);
    } else {
      setPosts(prev => [...prev, ...filteredPosts]);
      setPage(prev => prev + 1);
    }
    
    setHasMore(filteredPosts.length === 12);
  };

  const loadCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
  };

  useEffect(() => {
    loadCategories();
    loadPosts(true);
  }, [selectedCategory]);

  const handleSearch = (query: string) => {
    console.log('Recherche clients:', query);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleLoadMore = () => {
    loadPosts(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Blog Client RepairFirst
          </h1>
          <p className="text-xl text-blue-100">
            Guides, conseils et astuces pour bien entretenir vos appareils
          </p>
        </div>
      </div>

      <BlogLayout
        categories={categories}
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
      >
        <BlogPostList
          posts={posts}
          categories={categories}
          loading={loading}
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          selectedCategory={selectedCategory}
        />
      </BlogLayout>
    </div>
  );
};

export default BlogClientPage;
