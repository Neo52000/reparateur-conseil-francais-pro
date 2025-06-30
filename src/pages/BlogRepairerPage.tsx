
import React, { useState, useEffect } from 'react';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/types/blog';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogLayout from '@/components/blog/BlogLayout';

const BlogRepairerPage: React.FC = () => {
  const { fetchPosts, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await fetchPosts({
      visibility: 'repairers',
      status: 'published'
    });
    setPosts(data);
  };

  return (
    <BlogLayout title="Blog Réparateurs" subtitle="Ressources et actualités pour les professionnels">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      
      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun article disponible pour le moment.</p>
        </div>
      )}
    </BlogLayout>
  );
};

export default BlogRepairerPage;
