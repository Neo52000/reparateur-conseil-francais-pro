-- Ajouter les colonnes pour la gestion des commissions et rétention de fonds
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS commission_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS funds_released BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE;