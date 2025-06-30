
import { BlogPost } from '@/types/blog';

export const cleanPostData = (post: any) => {
  console.log('🧹 Cleaning post data:', post);
  const cleanedPost = { ...post };
  
  // Convertir les chaînes vides en null pour les UUIDs
  if (cleanedPost.category_id === '') {
    console.log('Converting empty category_id to null');
    cleanedPost.category_id = null;
  }
  if (cleanedPost.author_id === '') {
    console.log('Converting empty author_id to null');
    cleanedPost.author_id = null;
  }
  
  // Nettoyer les autres champs optionnels
  if (cleanedPost.featured_image_url === '') {
    cleanedPost.featured_image_url = null;
  }
  if (cleanedPost.meta_title === '') {
    cleanedPost.meta_title = null;
  }
  if (cleanedPost.meta_description === '') {
    cleanedPost.meta_description = null;
  }
  if (cleanedPost.excerpt === '') {
    cleanedPost.excerpt = null;
  }
  
  // S'assurer que les keywords sont un tableau
  if (!Array.isArray(cleanedPost.keywords)) {
    cleanedPost.keywords = [];
  }
  
  // Supprimer les champs undefined
  Object.keys(cleanedPost).forEach(key => {
    if (cleanedPost[key] === undefined) {
      delete cleanedPost[key];
    }
  });
  
  console.log('🧹 Cleaned post data:', cleanedPost);
  return cleanedPost;
};
