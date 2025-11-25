-- ============================================
-- MIGRATION CRITIQUE : Correction vulnérabilité escalade de privilèges
-- ÉTAPE 1/2 : Corriger fonctions et politiques RLS
-- ============================================

-- Corriger les fonctions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM public.user_roles WHERE user_id = auth.uid() AND is_active = true LIMIT 1), 'user');
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role(user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = has_admin_role.user_id AND role = 'admin' AND is_active = true);
$$;

-- Mettre à jour TOUTES les politiques qui dépendent de profiles.role

-- scraping_logs
DROP POLICY IF EXISTS "Admins can manage scraping logs" ON public.scraping_logs;
CREATE POLICY "Admins can manage scraping logs" ON public.scraping_logs FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- feature_flags_by_plan
DROP POLICY IF EXISTS "admin-only" ON public.feature_flags_by_plan;
CREATE POLICY "admin-only" ON public.feature_flags_by_plan FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- promo_codes
DROP POLICY IF EXISTS "Admins can manage all promo codes" ON public.promo_codes;
CREATE POLICY "Admins can manage all promo codes" ON public.promo_codes FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- client_interest_requests
DROP POLICY IF EXISTS "Allow admins to view all requests" ON public.client_interest_requests;
DROP POLICY IF EXISTS "Allow admins to update requests" ON public.client_interest_requests;
CREATE POLICY "Allow admins to view all requests" ON public.client_interest_requests FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Allow admins to update requests" ON public.client_interest_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- closed_businesses
DROP POLICY IF EXISTS "Admins can manage closed businesses" ON public.closed_businesses;
CREATE POLICY "Admins can manage closed businesses" ON public.closed_businesses FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- pappers_verification_cache
DROP POLICY IF EXISTS "Admins can manage pappers cache" ON public.pappers_verification_cache;
CREATE POLICY "Admins can manage pappers cache" ON public.pappers_verification_cache FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- ad_banners
DROP POLICY IF EXISTS "Admins can manage ad banners" ON public.ad_banners;
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.ad_banners;
CREATE POLICY "Admins can manage all banners" ON public.ad_banners FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- storage.objects (banner images)
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;
CREATE POLICY "Admins can upload banner images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ad-banners' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Admins can delete banner images" ON storage.objects FOR DELETE
USING (bucket_id = 'ad-banners' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- ad_impressions
DROP POLICY IF EXISTS "Admins can view all impressions" ON public.ad_impressions;
CREATE POLICY "Admins can view all impressions" ON public.ad_impressions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- ad_clicks
DROP POLICY IF EXISTS "Admins can view all clicks" ON public.ad_clicks;
CREATE POLICY "Admins can view all clicks" ON public.ad_clicks FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- blog_posts (repairer)
DROP POLICY IF EXISTS "Repairers can view their posts" ON public.blog_posts;
CREATE POLICY "Repairers can view their posts" ON public.blog_posts FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'repairer') AND is_active = true) AND author_id = auth.uid());

-- admin_audit_logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Only admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Only admins can insert audit logs" ON public.admin_audit_logs FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- audit_cleanup_config
DROP POLICY IF EXISTS "Only admins can manage audit cleanup config" ON public.audit_cleanup_config;
CREATE POLICY "Only admins can manage audit cleanup config" ON public.audit_cleanup_config FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- documentation_versions
DROP POLICY IF EXISTS "Only admins can manage documentation versions" ON public.documentation_versions;
CREATE POLICY "Only admins can manage documentation versions" ON public.documentation_versions FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- notifications (admin insert)
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- global_pos_settings
DROP POLICY IF EXISTS "Only admins can manage global POS settings" ON public.global_pos_settings;
CREATE POLICY "Only admins can manage global POS settings" ON public.global_pos_settings FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- global_ecommerce_settings
DROP POLICY IF EXISTS "Only admins can manage global ecommerce settings" ON public.global_ecommerce_settings;
CREATE POLICY "Only admins can manage global ecommerce settings" ON public.global_ecommerce_settings FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- configuration_templates
DROP POLICY IF EXISTS "Only admins can manage configuration templates" ON public.configuration_templates;
CREATE POLICY "Only admins can manage configuration templates" ON public.configuration_templates FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- deployment_history
DROP POLICY IF EXISTS "Only admins can manage deployment history" ON public.deployment_history;
CREATE POLICY "Only admins can manage deployment history" ON public.deployment_history FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- performance_metrics
DROP POLICY IF EXISTS "Admins can view all performance metrics" ON public.performance_metrics;
CREATE POLICY "Admins can view all performance metrics" ON public.performance_metrics FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- subscription_plans
DROP POLICY IF EXISTS "Admins can update subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can insert subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can delete subscription plans" ON public.subscription_plans;
CREATE POLICY "Admins can update subscription plans" ON public.subscription_plans FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Admins can insert subscription plans" ON public.subscription_plans FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Admins can delete subscription plans" ON public.subscription_plans FOR DELETE
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- storage.objects (landing page media)
DROP POLICY IF EXISTS "Admins can upload landing page media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update landing page media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete landing page media" ON storage.objects;
CREATE POLICY "Admins can upload landing page media" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'landing-pages' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Admins can update landing page media" ON storage.objects FOR UPDATE
USING (bucket_id = 'landing-pages' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));
CREATE POLICY "Admins can delete landing page media" ON storage.objects FOR DELETE
USING (bucket_id = 'landing-pages' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- nf203_archives
DROP POLICY IF EXISTS "Repairers can view their archives" ON public.nf203_archives;
DROP POLICY IF EXISTS "System can update archive status" ON public.nf203_archives;
CREATE POLICY "Repairers can view their archives" ON public.nf203_archives FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'repairer') AND is_active = true));

-- nf203_period_closures
DROP POLICY IF EXISTS "Repairers can view their closures" ON public.nf203_period_closures;
CREATE POLICY "Repairers can view their closures" ON public.nf203_period_closures FOR SELECT
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'repairer') AND is_active = true));

-- repairer_seo_pages
DROP POLICY IF EXISTS "Admins peuvent gérer toutes les pages SEO" ON public.repairer_seo_pages;
CREATE POLICY "Admins peuvent gérer toutes les pages SEO" ON public.repairer_seo_pages FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- blog_automation_schedules (toutes les politiques)
DROP POLICY IF EXISTS "admin_select_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_insert_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_update_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_delete_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can create schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can manage automation schedules" ON public.blog_automation_schedules;

CREATE POLICY "Admins can manage automation schedules" ON public.blog_automation_schedules FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- Blog templates
DROP POLICY IF EXISTS "Admins can manage all templates" ON public.blog_generation_templates;
CREATE POLICY "Admins can manage all templates" ON public.blog_generation_templates FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- Blog posts (admin)
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));

-- Blog categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.blog_categories;
CREATE POLICY "Admins can manage categories" ON public.blog_categories FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true));