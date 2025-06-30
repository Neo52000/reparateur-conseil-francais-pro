
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogPageContent from '@/components/blog/BlogPage';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BlogPageContent />
      <Footer />
    </div>
  );
};

export default BlogPage;
