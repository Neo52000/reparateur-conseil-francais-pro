-- Créer des données de démonstration pour les analytics SEO
INSERT INTO public.local_seo_pages (slug, city, city_slug, service_type, title, meta_description, h1_title, content_paragraph_1, content_paragraph_2, cta_text, repairer_count, average_rating, page_views, click_through_rate, is_published, seo_score)
VALUES 
('reparateur-smartphone-paris', 'Paris', 'paris', 'smartphone', 
'Réparation Smartphone Paris - Devis Gratuit 24h', 
'Réparation smartphone à Paris ✓ Prix transparents ✓ Garantie 6 mois ✓ 150+ réparateurs certifiés',
'Réparation Smartphone Paris - Service Express',
'Paris compte plus de 150 réparateurs de smartphones certifiés, offrant des services de qualité avec garantie. Que votre iPhone, Samsung Galaxy ou autre smartphone nécessite une réparation d''écran, de batterie ou tout autre composant, nos professionnels locaux vous proposent des devis gratuits et des interventions rapides.',
'Notre réseau parisien s''engage pour la réparation écoresponsable, privilégiant les pièces recyclées quand c''est possible. Avec des tarifs transparents et une garantie jusqu''à 6 mois, faire réparer votre smartphone à Paris n''a jamais été aussi simple.',
'Trouvez votre réparateur parisien', 150, 4.8, 1250, 3.2, true, 95),

('reparateur-smartphone-lyon', 'Lyon', 'lyon', 'smartphone',
'Réparation Smartphone Lyon - Experts Locaux',
'Réparation smartphone Lyon ✓ 80+ réparateurs ✓ Intervention rapide ✓ Prix compétitifs',
'Réparation Smartphone Lyon - Service de Proximité', 
'Lyon dispose d''un réseau de 80 réparateurs spécialisés dans la réparation de smartphones. Services disponibles 7j/7 avec intervention possible à domicile.',
'Nos réparateurs lyonnais utilisent des pièces de qualité et offrent une garantie complète sur toutes les réparations effectuées.',
'Contactez un réparateur lyonnais', 80, 4.6, 890, 2.8, true, 88),

('reparateur-smartphone-marseille', 'Marseille', 'marseille', 'smartphone',
'Réparation Smartphone Marseille - Service Rapide', 
'Réparation smartphone Marseille ✓ 65+ experts ✓ Devis gratuit ✓ Réparation express',
'Réparation Smartphone Marseille - Intervention Express',
'Marseille compte 65 réparateurs certifiés pour tous vos besoins de réparation smartphone. Service express disponible pour les réparations urgentes.',
'Des tarifs adaptés au marché marseillais avec une qualité de service optimale et une garantie étendue sur tous les travaux.',
'Trouvez votre expert marseillais', 65, 4.7, 720, 2.5, true, 82);

-- Créer des métriques de performance pour les pages
INSERT INTO public.local_seo_metrics (page_id, date, impressions, clicks, ctr, average_position, bounce_rate, time_on_page, conversions)
SELECT 
  p.id,
  CURRENT_DATE - INTERVAL '7 days' + (INTERVAL '1 day' * generate_series(0, 6)),
  FLOOR(RANDOM() * 500 + 100)::INTEGER,
  FLOOR(RANDOM() * 50 + 10)::INTEGER,
  ROUND((RANDOM() * 5 + 2)::NUMERIC, 2),
  ROUND((RANDOM() * 20 + 5)::NUMERIC, 1),
  ROUND((RANDOM() * 30 + 40)::NUMERIC, 2),
  FLOOR(RANDOM() * 120 + 60)::INTEGER,
  FLOOR(RANDOM() * 5 + 1)::INTEGER
FROM public.local_seo_pages p
WHERE p.is_published = true;

-- Fonction pour obtenir les top 10 des villes performantes
CREATE OR REPLACE FUNCTION public.get_top_performing_cities(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  city TEXT,
  total_views INTEGER,
  avg_ctr NUMERIC,
  total_conversions INTEGER,
  performance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lsp.city,
    lsp.page_views::INTEGER as total_views,
    ROUND(lsp.click_through_rate::NUMERIC, 2) as avg_ctr,
    COALESCE(SUM(lsm.conversions), 0)::INTEGER as total_conversions,
    ROUND((lsp.page_views * lsp.click_through_rate * lsp.seo_score / 100)::NUMERIC, 1) as performance_score
  FROM public.local_seo_pages lsp
  LEFT JOIN public.local_seo_metrics lsm ON lsp.id = lsm.page_id
  WHERE lsp.is_published = true AND lsp.page_views > 0
  GROUP BY lsp.id, lsp.city, lsp.page_views, lsp.click_through_rate, lsp.seo_score
  ORDER BY performance_score DESC
  LIMIT limit_count;
END;
$$;

-- Fonction pour obtenir les performances par service
CREATE OR REPLACE FUNCTION public.get_service_performance()
RETURNS TABLE(
  service_type TEXT,
  total_pages INTEGER,
  avg_views NUMERIC,
  avg_ctr NUMERIC,
  avg_seo_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lsp.service_type,
    COUNT(*)::INTEGER as total_pages,
    ROUND(AVG(lsp.page_views)::NUMERIC, 1) as avg_views,
    ROUND(AVG(lsp.click_through_rate)::NUMERIC, 2) as avg_ctr,
    ROUND(AVG(lsp.seo_score)::NUMERIC, 1) as avg_seo_score
  FROM public.local_seo_pages lsp
  WHERE lsp.is_published = true
  GROUP BY lsp.service_type
  ORDER BY avg_views DESC;
END;
$$;