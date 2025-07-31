-- Vérifier l'existence de la table repairer_custom_prices
-- Si elle n'existe pas, la créer

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
CREATE POLICY IF NOT EXISTS "Repairers can view their own custom prices" 
ON public.repairer_custom_prices 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.repairer_profiles 
        WHERE repairer_profiles.id = repairer_custom_prices.repairer_id 
        AND repairer_profiles.user_id = auth.uid()
    )
);

-- Politique pour que les réparateurs gèrent leurs propres prix
CREATE POLICY IF NOT EXISTS "Repairers can manage their own custom prices" 
ON public.repairer_custom_prices 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.repairer_profiles 
        WHERE repairer_profiles.id = repairer_custom_prices.repairer_id 
        AND repairer_profiles.user_id = auth.uid()
    )
);

-- Politique pour les recherches publiques de prix actifs
CREATE POLICY IF NOT EXISTS "Public can view active custom prices for search" 
ON public.repairer_custom_prices 
FOR SELECT 
USING (is_active = true);

-- Ajouter un trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_repairer_custom_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS update_repairer_custom_prices_updated_at_trigger ON public.repairer_custom_prices;
CREATE TRIGGER update_repairer_custom_prices_updated_at_trigger
    BEFORE UPDATE ON public.repairer_custom_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_repairer_custom_prices_updated_at();