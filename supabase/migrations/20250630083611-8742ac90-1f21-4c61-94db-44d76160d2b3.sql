
-- Table pour les catégories de blog
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les articles de blog
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  
  -- Configuration de visibilité
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'repairers', 'both')),
  
  -- Métadonnées
  category_id UUID REFERENCES public.blog_categories(id),
  author_id UUID REFERENCES public.profiles(id),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  
  -- État de publication
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  
  -- Génération IA
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  generation_prompt TEXT,
  
  -- Statistiques
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les templates de génération IA
CREATE TABLE public.blog_generation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id),
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'repairers', 'both')),
  prompt_template TEXT NOT NULL,
  ai_model TEXT DEFAULT 'mistral',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la planification des articles
CREATE TABLE public.blog_scheduling (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.blog_generation_templates(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  custom_cron TEXT,
  next_execution TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  auto_publish BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les commentaires
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  parent_id UUID REFERENCES public.blog_comments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les abonnés newsletter
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{"blog_updates": true, "product_news": true, "promotions": false}'::jsonb,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les partages sociaux
CREATE TABLE public.blog_social_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_visibility ON public.blog_posts(visibility);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments(status);

-- RLS Policies
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_generation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_scheduling ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_social_shares ENABLE ROW LEVEL SECURITY;

-- Policies pour les catégories (lecture publique, écriture admin)
CREATE POLICY "Anyone can view active blog categories" ON public.blog_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage blog categories" ON public.blog_categories
  FOR ALL USING (get_current_user_role() = 'admin');

-- Policies pour les articles
CREATE POLICY "Anyone can view published public posts" ON public.blog_posts
  FOR SELECT USING (
    status = 'published' AND 
    (visibility = 'public' OR visibility = 'both')
  );

CREATE POLICY "Repairers can view their posts" ON public.blog_posts
  FOR SELECT USING (
    status = 'published' AND 
    (visibility = 'repairers' OR visibility = 'both') AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('repairer', 'admin')
    )
  );

CREATE POLICY "Authors and admins can manage posts" ON public.blog_posts
  FOR ALL USING (
    author_id = auth.uid() OR 
    get_current_user_role() = 'admin'
  );

-- Policies pour les commentaires
CREATE POLICY "Anyone can view approved comments" ON public.blog_comments
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can create comments" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and admins can manage comments" ON public.blog_comments
  FOR ALL USING (
    author_id = auth.uid() OR 
    get_current_user_role() = 'admin'
  );

-- Policies pour les templates (admin seulement)
CREATE POLICY "Admins can manage generation templates" ON public.blog_generation_templates
  FOR ALL USING (get_current_user_role() = 'admin');

-- Policies pour la planification (admin seulement)
CREATE POLICY "Admins can manage scheduling" ON public.blog_scheduling
  FOR ALL USING (get_current_user_role() = 'admin');

-- Policies pour newsletter (admin seulement sauf insertion)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL USING (get_current_user_role() = 'admin');

-- Policies pour partages sociaux
CREATE POLICY "Users can share posts" ON public.blog_social_shares
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view share stats" ON public.blog_social_shares
  FOR SELECT USING (true);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_generation_templates_updated_at
  BEFORE UPDATE ON public.blog_generation_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_scheduling_updated_at
  BEFORE UPDATE ON public.blog_scheduling
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion des catégories par défaut
INSERT INTO public.blog_categories (name, slug, description, icon, display_order) VALUES
('Actualités', 'actualites', 'Nouveautés produits et actualités du secteur', 'Newspaper', 1),
('Bons Plans', 'bons-plans', 'Offres spéciales et promotions', 'Tag', 2),
('Conseils d''utilisation', 'conseils-utilisation', 'Guides et astuces pour bien utiliser vos appareils', 'Lightbulb', 3),
('Conseils d''entretien', 'conseils-entretien', 'Comment maintenir vos appareils en bon état', 'Settings', 4),
('Comparatifs', 'comparatifs', 'Comparaisons de produits et services', 'BarChart', 5),
('Services', 'services', 'Présentation de nos services', 'Wrench', 6),
('Portrait Réparateurs', 'portrait-reparateurs', 'Découvrez nos réparateurs partenaires', 'Users', 7);

-- Insertion de templates de génération par défaut
INSERT INTO public.blog_generation_templates (name, category_id, visibility, prompt_template, ai_model) VALUES
(
  'Actualité Produit',
  (SELECT id FROM public.blog_categories WHERE slug = 'actualites'),
  'public',
  'Écris un article de blog professionnel sur les dernières actualités concernant les smartphones et tablettes. L''article doit être informatif, engageant et optimisé SEO. Inclus des conseils pratiques pour les utilisateurs. Longueur : 500-800 mots.',
  'mistral'
),
(
  'Conseil Technique Réparateurs',
  (SELECT id FROM public.blog_categories WHERE slug = 'conseils-entretien'),
  'repairers',
  'Rédige un guide technique détaillé pour les réparateurs professionnels. Inclus des astuces techniques, des procédures de réparation et des bonnes pratiques. Le ton doit être professionnel et technique. Longueur : 800-1200 mots.',
  'mistral'
),
(
  'Comparatif Produits',
  (SELECT id FROM public.blog_categories WHERE slug = 'comparatifs'),
  'both',
  'Crée un comparatif détaillé entre différents modèles de smartphones ou tablettes. Inclus les avantages, inconvénients, prix et recommandations. Structure l''article avec des tableaux comparatifs. Longueur : 600-1000 mots.',
  'mistral'
);
