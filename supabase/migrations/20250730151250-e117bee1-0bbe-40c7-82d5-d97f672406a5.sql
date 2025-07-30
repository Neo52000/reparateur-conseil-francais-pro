-- Améliorations pour le module QualiRépar

-- 1. Ajouter des champs pour l'intégration API réelle
ALTER TABLE qualirepar_dossiers 
ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
ADD COLUMN IF NOT EXISTS api_version TEXT DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS api_errors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retry_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS last_api_call TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS repairer_siret TEXT,
ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS processing_notifications JSONB DEFAULT '[]'::jsonb;

-- 2. Améliorer la table des documents
ALTER TABLE qualirepar_documents 
ADD COLUMN IF NOT EXISTS official_document_type TEXT,
ADD COLUMN IF NOT EXISTS upload_url TEXT,
ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS auto_validation_passed BOOLEAN DEFAULT false;

-- 3. Table pour les règles d'éligibilité locales (cache)
CREATE TABLE IF NOT EXISTS qualirepar_eligibility_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_category TEXT NOT NULL,
    product_brand TEXT,
    product_model TEXT,
    min_repair_cost NUMERIC,
    max_bonus_amount NUMERIC NOT NULL,
    eco_organism TEXT NOT NULL,
    eligibility_rules JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE NOT NULL,
    valid_until DATE,
    api_source_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Table pour l'audit des appels API
CREATE TABLE IF NOT EXISTS qualirepar_api_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dossier_id UUID REFERENCES qualirepar_dossiers(id),
    api_endpoint TEXT NOT NULL,
    request_method TEXT NOT NULL,
    request_payload JSONB,
    response_status INTEGER,
    response_data JSONB,
    response_time_ms INTEGER,
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Table pour les notifications de statut
CREATE TABLE IF NOT EXISTS qualirepar_status_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dossier_id UUID REFERENCES qualirepar_dossiers(id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    recipient_user_id UUID,
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_qualirepar_dossiers_status ON qualirepar_dossiers(status);
CREATE INDEX IF NOT EXISTS idx_qualirepar_dossiers_repairer_created ON qualirepar_dossiers(repairer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qualirepar_dossiers_temporary_claim ON qualirepar_dossiers(temporary_claim_id);
CREATE INDEX IF NOT EXISTS idx_qualirepar_documents_dossier_type ON qualirepar_documents(dossier_id, official_document_type);
CREATE INDEX IF NOT EXISTS idx_qualirepar_api_logs_dossier_created ON qualirepar_api_logs(dossier_id, created_at DESC);

-- 7. Fonctions triggers pour auto-update
CREATE OR REPLACE FUNCTION update_qualirepar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers
DROP TRIGGER IF EXISTS update_qualirepar_dossiers_updated_at ON qualirepar_dossiers;
CREATE TRIGGER update_qualirepar_dossiers_updated_at
    BEFORE UPDATE ON qualirepar_dossiers
    FOR EACH ROW
    EXECUTE FUNCTION update_qualirepar_updated_at();

DROP TRIGGER IF EXISTS update_qualirepar_documents_updated_at ON qualirepar_documents;
CREATE TRIGGER update_qualirepar_documents_updated_at
    BEFORE UPDATE ON qualirepar_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_qualirepar_updated_at();

DROP TRIGGER IF EXISTS update_qualirepar_eligibility_cache_updated_at ON qualirepar_eligibility_cache;
CREATE TRIGGER update_qualirepar_eligibility_cache_updated_at
    BEFORE UPDATE ON qualirepar_eligibility_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_qualirepar_updated_at();

-- 8. Politique RLS pour les nouvelles tables
ALTER TABLE qualirepar_eligibility_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualirepar_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualirepar_status_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour qualirepar_eligibility_cache
CREATE POLICY "Public can view active eligibility rules" ON qualirepar_eligibility_cache
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage eligibility cache" ON qualirepar_eligibility_cache
    FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques pour qualirepar_api_logs
CREATE POLICY "Repairers can view logs for their dossiers" ON qualirepar_api_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM qualirepar_dossiers qd 
            WHERE qd.id = qualirepar_api_logs.dossier_id 
            AND qd.repairer_id = auth.uid()
        )
    );

CREATE POLICY "System can insert API logs" ON qualirepar_api_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all API logs" ON qualirepar_api_logs
    FOR SELECT USING (get_current_user_role() = 'admin');

-- Politiques pour qualirepar_status_notifications
CREATE POLICY "Users can view their notifications" ON qualirepar_status_notifications
    FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "System can manage notifications" ON qualirepar_status_notifications
    FOR ALL WITH CHECK (true);