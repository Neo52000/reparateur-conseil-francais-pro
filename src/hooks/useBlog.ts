
import { useBlogPosts } from './blog/useBlogPosts';
import { useBlogCategories } from './blog/useBlogCategories';
import { useBlogComments } from './blog/useBlogComments';
import { useBlogNewsletter } from './blog/useBlogNewsletter';
import { useBlogSocial } from './blog/useBlogSocial';
import { useBlogAIGenerator } from './blog/useBlogAIGenerator';

export const useBlog = () => {
  const { loading, fetchPosts, fetchPostBySlug, savePost, deletePost, checkSlugExists } = useBlogPosts();
  const { fetchCategories } = useBlogCategories();
  const { fetchComments, addComment } = useBlogComments();
  const { subscribeToNewsletter } = useBlogNewsletter();
  const { trackSocialShare } = useBlogSocial();
  const { generating, generateArticle, generateImage } = useBlogAIGenerator();

  return {
    loading,
    fetchPosts,
    fetchPostBySlug,
    fetchCategories,
    savePost,
    deletePost,
    fetchComments,
    addComment,
    subscribeToNewsletter,
    trackSocialShare,
    checkSlugExists,
    generating,
    generateArticle,
    generateImage
  };
};

