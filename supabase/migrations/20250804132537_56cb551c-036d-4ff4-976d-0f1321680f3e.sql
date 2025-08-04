-- PHASE 2 & 3 : Configuration avancée et fonctions automatiques (CORRIGÉE)

-- Supprimer l'ancienne politique temporaire et créer les bonnes politiques RLS
DROP POLICY IF EXISTS "Admin email can manage suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Premium repairers can view suppliers" ON public.suppliers_directory;

-- Politiques RLS pour suppliers_directory
CREATE POLICY "Admins can manage all suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Premium repairers can view active suppliers" 
ON public.suppliers_directory 
FOR SELECT 
TO authenticated 
USING (
  status = 'active' AND 
  has_paid_subscription(auth.uid())
);

-- Politiques RLS pour suppliers_directory_reviews
CREATE POLICY "Premium repairers can view published reviews" 
ON public.suppliers_directory_reviews 
FOR SELECT 
TO authenticated 
USING (
  status = 'published' AND 
  has_paid_subscription(auth.uid())
);

CREATE POLICY "Premium repairers can create reviews" 
ON public.suppliers_directory_reviews 
FOR INSERT 
TO authenticated 
WITH CHECK (
  has_paid_subscription(auth.uid()) AND 
  repairer_id = auth.uid()
);

CREATE POLICY "Admins can manage all reviews" 
ON public.suppliers_directory_reviews 
FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_suppliers_directory_status ON public.suppliers_directory(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_directory_featured ON public.suppliers_directory(is_featured);
CREATE INDEX IF NOT EXISTS idx_suppliers_directory_brands ON public.suppliers_directory USING GIN(brands_sold);
CREATE INDEX IF NOT EXISTS idx_suppliers_directory_products ON public.suppliers_directory USING GIN(product_types);
CREATE INDEX IF NOT EXISTS idx_suppliers_directory_specialties ON public.suppliers_directory USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_suppliers_reviews_supplier ON public.suppliers_directory_reviews(supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_reviews_status ON public.suppliers_directory_reviews(status);

-- Insérer quelques données de test pour valider le système
INSERT INTO public.suppliers_directory (
  name, description, brands_sold, product_types, website, phone, email,
  address, specialties, certifications, payment_terms, minimum_order,
  delivery_info, is_verified, is_featured, status
) VALUES 
(
  'TechParts France',
  'Grossiste spécialisé en pièces détachées pour smartphones et tablettes. Plus de 15 ans d''expérience dans la réparation mobile.',
  ARRAY['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus'],
  ARRAY['Écrans', 'Batteries', 'Connecteurs', 'Haut-parleurs', 'Caméras'],
  'https://www.techparts-france.com',
  '+33 1 42 86 75 23',
  'commercial@techparts-france.com',
  '{"street": "125 Avenue de la République", "city": "Paris", "postal_code": "75011", "country": "France"}',
  ARRAY['Réparation iPhone', 'Réparation Samsung', 'Pièces OEM', 'Livraison express'],
  ARRAY['Certification Apple', 'ISO 9001'],
  'Paiement à 30 jours fin de mois',
  50.00,
  '{"standard": "24-48h", "express": "Même jour avant 14h", "zones": ["France métropolitaine", "DOM-TOM"]}',
  true,
  true,
  'active'
),
(
  'Mobile Supply Pro',
  'Fournisseur européen de composants mobiles avec stock permanent et garantie étendue.',
  ARRAY['Samsung', 'Google', 'Sony', 'Nokia', 'Motorola'],
  ARRAY['Écrans OLED', 'Batteries Li-ion', 'Flex', 'Modules caméra'],
  'https://mobilesupplypro.eu',
  '+33 4 91 22 33 44',
  'orders@mobilesupplypro.eu',
  '{"street": "Zone Industrielle des Baux", "city": "Marseille", "postal_code": "13014", "country": "France"}',
  ARRAY['Écrans OLED', 'Garantie 24 mois', 'Formation technique'],
  ARRAY['CE', 'RoHS'],
  'Paiement comptant -2%, 30 jours net',
  100.00,
  '{"standard": "48-72h", "express": "24h", "international": "3-5 jours"}',
  true,
  false,
  'active'
);

-- Insérer quelques avis de test (avec les bons types JSONB)
INSERT INTO public.suppliers_directory_reviews (
  supplier_id, repairer_id, rating, title, content, pros, cons, verified_purchase, status
) 
SELECT 
  s.id,
  (SELECT user_id FROM public.repairer_subscriptions WHERE subscription_tier IN ('premium', 'enterprise') LIMIT 1),
  5,
  'Excellent fournisseur, très fiable',
  'Commande reçue rapidement, pièces de qualité. Le service client est réactif et professionnel.',
  '["Livraison rapide", "Qualité des pièces", "Service client"]'::jsonb,
  '["Prix un peu élevé"]'::jsonb,
  true,
  'published'
FROM public.suppliers_directory s 
WHERE s.name = 'TechParts France'
LIMIT 1;