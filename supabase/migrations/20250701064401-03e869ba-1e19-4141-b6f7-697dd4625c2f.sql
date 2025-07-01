
-- Créer la fonction pour incrémenter le compteur de partages des articles de blog
CREATE OR REPLACE FUNCTION public.increment_share_count(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.blog_posts 
  SET share_count = share_count + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$function$
