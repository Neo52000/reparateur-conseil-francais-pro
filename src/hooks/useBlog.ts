
import { useBlogPosts } from './blog/useBlogPosts';
import { useBlogCategories } from './blog/useBlogCategories';
import { useBlogComments } from './blog/useBlogComments';
import { useBlogNewsletter } from './blog/useBlogNewsletter';
import { useBlogSocial } from './blog/useBlogSocial';

export const useBlog = () => {
  const { loading, fetchPosts, fetchPostBySlug, savePost, deletePost } = useBlogPosts();
  const { fetchCategories } = useBlogCategories();
  const { fetchComments, addComment } = useBlogComments();
  const { subscribeToNewsletter } = useBlogNewsletter();
  const { trackSocialShare } = useBlogSocial();

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
    trackSocialShare
  };
};
