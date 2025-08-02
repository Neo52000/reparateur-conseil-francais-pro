
import React, { useState, useEffect } from 'react';
import { useBlog } from '@/hooks/useBlog';
import { useGamification } from '@/hooks/useGamification';
import { BlogPost } from '@/types/blog';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogLayout from '@/components/blog/BlogLayout';
import ProgressBar from '@/components/gamification/ProgressBar';

const BlogRepairerPage: React.FC = () => {
  const { fetchPosts, loading } = useBlog();
  const gamification = useGamification();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadPosts();
    // Tracker l'activité de visite du blog réparateurs
    gamification.updateStreak();
    gamification.trackAction('blog_category_discovered', { category: 'repairers' });
  }, []);

  const loadPosts = async () => {
    const data = await fetchPosts({
      visibility: 'repairers',
      status: 'published'
    });
    setPosts(data);
  };

  return (
    <BlogLayout 
      title="Blog Réparateurs" 
      subtitle="Ressources et actualités pour les professionnels"
      backButtonUrl="/repairer"
      backButtonText="Retour à l'espace réparateur"
    >
      {/* Barre de progression gamification */}
      {!gamification.loading && (
        <div className="mb-8">
          <ProgressBar
            currentLevel={gamification.level}
            currentXP={gamification.currentXP}
            nextLevelXP={gamification.nextLevelXP}
            totalXP={gamification.totalXP}
          />
        </div>
      )}
      
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
