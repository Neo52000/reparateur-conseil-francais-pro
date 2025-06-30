
import React, { useState, useEffect } from 'react';
import BlogLayout from '@/components/blog/BlogLayout';
import BlogPostList from '@/components/blog/BlogPostList';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';

const BlogPage: React.FC = () => {
  const { fetchPosts, fetchCategories, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    const filters = {
      visibility: 'public',
      category: selectedCategory || undefined,
      status: 'published',
      limit: 12,
      offset: currentPage * 12
    };

    const newPosts = await fetchPosts(filters);
    
    if (reset) {
      setPosts(newPosts);
      setPage(1);
    } else {
      setPosts(prev => [...prev, ...newPosts]);
      setPage(prev => prev + 1);
    }
    
    setHasMore(newPosts.length === 12);
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
    setSearchQuery(query);
    // TODO: Implémenter la recherche textuelle
    console.log('Recherche:', query);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleLoadMore = () => {
    loadPosts(false);
  };

  return (
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
  );
};

export default BlogPage;
