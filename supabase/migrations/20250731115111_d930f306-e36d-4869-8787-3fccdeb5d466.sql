-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.repairer_custom_prices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    repairer_id UUID NOT NULL,
    repair_price_id TEXT NOT NULL, -- format: deviceModelId-repairTypeId
    device_model_id UUID,
    repair_type_id UUID,
    custom_price_eur NUMERIC(10,2) NOT NULL,
    margin_percentage NUMERIC(5,2),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(repairer_id, repair_price_id)
);

-- Activer RLS
ALTER TABLE public.repairer_custom_prices ENABLE ROW LEVEL SECURITY;

-- Politique pour que les réparateurs voient leurs propres prix
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'repairer_custom_prices' 
        AND policyname = 'Repairers can view their own custom prices'
    ) THEN
        CREATE POLICY "Repairers can view their own custom prices" 
        ON public.repairer_custom_prices 
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.repairer_profiles 
                WHERE repairer_profiles.id = repairer_custom_prices.repairer_id 
                AND repairer_profiles.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Politique pour que les réparateurs gèrent leurs propres prix
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'repairer_custom_prices' 
        AND policyname = 'Repairers can manage their own custom prices'
    ) THEN
        CREATE POLICY "Repairers can manage their own custom prices" 
        ON public.repairer_custom_prices 
        FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.repairer_profiles 
                WHERE repairer_profiles.id = repairer_custom_prices.repairer_id 
                AND repairer_profiles.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Politique pour les recherches publiques de prix actifs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'repairer_custom_prices' 
        AND policyname = 'Public can view active custom prices for search'
    ) THEN
        CREATE POLICY "Public can view active custom prices for search" 
        ON public.repairer_custom_prices 
        FOR SELECT 
        USING (is_active = true);
    END IF;
END
$$;