
-- Création des tables pour la gestion des appareils et réparations

-- Table des types d'appareils
CREATE TABLE public.device_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    icon text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des marques
CREATE TABLE public.brands (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    logo_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des modèles d'appareils
CREATE TABLE public.device_models (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_type_id uuid NOT NULL REFERENCES public.device_types(id) ON DELETE CASCADE,
    brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    model_name text NOT NULL,
    model_number text,
    release_date date,
    screen_size numeric(3,1),
    screen_resolution text,
    screen_type text CHECK (screen_type IN ('LCD', 'OLED', 'AMOLED', 'Super AMOLED', 'IPS', 'E-Ink', 'LED')),
    battery_capacity integer,
    storage_options jsonb DEFAULT '[]'::jsonb,
    colors jsonb DEFAULT '[]'::jsonb,
    operating_system text,
    processor text,
    ram_gb integer,
    weight_grams integer,
    dimensions jsonb,
    connectivity jsonb DEFAULT '[]'::jsonb,
    special_features jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des catégories de réparation
CREATE TABLE public.repair_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    icon text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des types de réparations
CREATE TABLE public.repair_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid NOT NULL REFERENCES public.repair_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    difficulty_level text CHECK (difficulty_level IN ('Facile', 'Moyen', 'Difficile', 'Expert')) DEFAULT 'Moyen',
    estimated_time_minutes integer,
    warranty_days integer DEFAULT 90,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des prix de réparation par modèle
CREATE TABLE public.repair_prices (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_model_id uuid NOT NULL REFERENCES public.device_models(id) ON DELETE CASCADE,
    repair_type_id uuid NOT NULL REFERENCES public.repair_types(id) ON DELETE CASCADE,
    price_eur numeric(8,2) NOT NULL,
    part_price_eur numeric(8,2),
    labor_price_eur numeric(8,2),
    is_available boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(device_model_id, repair_type_id)
);

-- Table des pièces détachées
CREATE TABLE public.spare_parts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    part_number text,
    category text,
    compatible_models jsonb DEFAULT '[]'::jsonb,
    supplier text,
    cost_price numeric(8,2),
    selling_price numeric(8,2),
    stock_quantity integer DEFAULT 0,
    min_stock_alert integer DEFAULT 5,
    quality_grade text CHECK (quality_grade IN ('Original', 'OEM', 'Compatible', 'Reconditionné')) DEFAULT 'Compatible',
    warranty_days integer DEFAULT 30,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insertion des données de base

-- Types d'appareils
INSERT INTO public.device_types (name, description, icon) VALUES
('Smartphone', 'Téléphones intelligents', 'smartphone'),
('Console de jeux', 'Consoles de jeux portables et de salon', 'gamepad'),
('Montre connectée', 'Montres intelligentes et fitness', 'watch');

-- Marques principales
INSERT INTO public.brands (name, logo_url) VALUES
('Apple', 'https://example.com/logos/apple.png'),
('Samsung', 'https://example.com/logos/samsung.png'),
('Huawei', 'https://example.com/logos/huawei.png'),
('Xiaomi', 'https://example.com/logos/xiaomi.png'),
('OnePlus', 'https://example.com/logos/oneplus.png'),
('Google', 'https://example.com/logos/google.png'),
('Oppo', 'https://example.com/logos/oppo.png'),
('Vivo', 'https://example.com/logos/vivo.png'),
('Realme', 'https://example.com/logos/realme.png'),
('Honor', 'https://example.com/logos/honor.png'),
('Motorola', 'https://example.com/logos/motorola.png'),
('Sony', 'https://example.com/logos/sony.png'),
('Nokia', 'https://example.com/logos/nokia.png'),
('Nothing', 'https://example.com/logos/nothing.png'),
('Fairphone', 'https://example.com/logos/fairphone.png'),
('Nintendo', 'https://example.com/logos/nintendo.png'),
('Microsoft', 'https://example.com/logos/microsoft.png'),
('Valve', 'https://example.com/logos/valve.png'),
('Asus', 'https://example.com/logos/asus.png'),
('Lenovo', 'https://example.com/logos/lenovo.png'),
('Ayn', 'https://example.com/logos/ayn.png'),
('Anbernic', 'https://example.com/logos/anbernic.png'),
('Garmin', 'https://example.com/logos/garmin.png'),
('Fitbit', 'https://example.com/logos/fitbit.png'),
('Polar', 'https://example.com/logos/polar.png'),
('Suunto', 'https://example.com/logos/suunto.png'),
('Fossil', 'https://example.com/logos/fossil.png'),
('Amazfit', 'https://example.com/logos/amazfit.png'),
('TicWatch', 'https://example.com/logos/ticwatch.png');

-- Catégories de réparation
INSERT INTO public.repair_categories (name, description, icon, display_order) VALUES
('Écran', 'Réparation et remplacement d''écrans', 'screen', 1),
('Batterie', 'Remplacement de batteries', 'battery', 2),
('Caméra', 'Réparation des appareils photo', 'camera', 3),
('Audio', 'Haut-parleurs et microphones', 'volume', 4),
('Connectique', 'Ports de charge et connecteurs', 'cable', 5),
('Boutons', 'Boutons physiques et tactiles', 'circle', 6),
('Carte mère', 'Réparations électroniques avancées', 'cpu', 7),
('Étanchéité', 'Dégâts des eaux et étanchéité', 'droplets', 8),
('Coque', 'Réparation de la coque arrière', 'smartphone', 9),
('Logiciel', 'Déblocage et réparations logicielles', 'code', 10),
('Manettes', 'Réparation des contrôleurs de jeu', 'gamepad2', 11),
('Ventilation', 'Système de refroidissement', 'fan', 12),
('Optique', 'Lecteurs de disques et lasers', 'disc', 13),
('Alimentation', 'Blocs d''alimentation et chargeurs', 'zap', 14),
('Bracelet', 'Bracelets et attaches', 'link', 15),
('Capteurs', 'Capteurs biométriques', 'heart', 16),
('Étanchéité montres', 'Joints et résistance à l''eau', 'shield', 17);

-- Index pour optimiser les performances
CREATE INDEX idx_device_models_brand ON public.device_models(brand_id);
CREATE INDEX idx_device_models_type ON public.device_models(device_type_id);
CREATE INDEX idx_repair_prices_model ON public.repair_prices(device_model_id);
CREATE INDEX idx_repair_prices_repair ON public.repair_prices(repair_type_id);
CREATE INDEX idx_repair_types_category ON public.repair_types(category_id);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour lecture publique (nécessaire pour les clients)
CREATE POLICY "Allow public read access" ON public.device_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.device_models FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.repair_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.repair_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.repair_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.spare_parts FOR SELECT USING (true);

-- Politiques RLS pour modification admin uniquement
CREATE POLICY "Allow admin full access" ON public.device_types FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Allow admin full access" ON public.brands FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Allow admin full access" ON public.device_models FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Allow admin full access" ON public.repair_categories FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Allow admin full access" ON public.repair_types FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Allow admin full access" ON public.repair_prices FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Allow admin full access" ON public.spare_parts FOR ALL USING (get_current_user_role() = 'admin');
