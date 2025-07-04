-- Create module_subscriptions table for POS and E-commerce pricing
CREATE TABLE public.module_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (module_type IN ('pos', 'ecommerce')),
  subscription_tier TEXT NOT NULL DEFAULT 'enterprise',
  module_active BOOLEAN NOT NULL DEFAULT false,
  module_price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renewal BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active', 'past_due', 'cancelled')),
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique module per repairer
  UNIQUE(repairer_id, module_type)
);

-- Enable RLS
ALTER TABLE public.module_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for module subscriptions
CREATE POLICY "Users can view their own module subscriptions"
ON public.module_subscriptions
FOR SELECT
USING (auth.uid() = repairer_id);

CREATE POLICY "Users can insert their own module subscriptions"
ON public.module_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Users can update their own module subscriptions"
ON public.module_subscriptions
FOR UPDATE
USING (auth.uid() = repairer_id);

CREATE POLICY "Admins can manage all module subscriptions"
ON public.module_subscriptions
FOR ALL
USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_module_subscriptions_updated_at
  BEFORE UPDATE ON public.module_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add module pricing constraints based on type
CREATE OR REPLACE FUNCTION validate_module_pricing()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate POS pricing (€49.90/month or €499/year)
  IF NEW.module_type = 'pos' THEN
    IF NEW.billing_cycle = 'monthly' AND NEW.module_price != 49.90 THEN
      RAISE EXCEPTION 'POS monthly price must be €49.90';
    ELSIF NEW.billing_cycle = 'yearly' AND NEW.module_price != 499.00 THEN
      RAISE EXCEPTION 'POS yearly price must be €499.00';
    END IF;
  END IF;
  
  -- Validate E-commerce pricing (€89/month or €890/year)
  IF NEW.module_type = 'ecommerce' THEN
    IF NEW.billing_cycle = 'monthly' AND NEW.module_price != 89.00 THEN
      RAISE EXCEPTION 'E-commerce monthly price must be €89.00';
    ELSIF NEW.billing_cycle = 'yearly' AND NEW.module_price != 890.00 THEN
      RAISE EXCEPTION 'E-commerce yearly price must be €890.00';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_module_pricing_trigger
  BEFORE INSERT OR UPDATE ON public.module_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION validate_module_pricing();

-- Create function to check if user has specific module access
CREATE OR REPLACE FUNCTION public.has_module_access(user_id UUID, module_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.module_subscriptions ms
    JOIN public.repairer_subscriptions rs ON rs.user_id = ms.repairer_id
    WHERE ms.repairer_id = user_id
      AND ms.module_type = module_name
      AND ms.module_active = true
      AND ms.payment_status = 'active'
      AND rs.subscription_tier = 'enterprise'
      AND rs.subscribed = true
  );
$$;

-- Create data migration table to track automatic migrations
CREATE TABLE public.module_data_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (module_type IN ('pos', 'ecommerce')),
  migration_type TEXT NOT NULL CHECK (migration_type IN ('appointments', 'repairs', 'inventory', 'customers', 'products')),
  migration_status TEXT NOT NULL DEFAULT 'pending' CHECK (migration_status IN ('pending', 'in_progress', 'completed', 'failed')),
  records_migrated INTEGER DEFAULT 0,
  total_records INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on migration table
ALTER TABLE public.module_data_migrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own migrations"
ON public.module_data_migrations
FOR SELECT
USING (auth.uid() = repairer_id);

CREATE POLICY "Admins can view all migrations"
ON public.module_data_migrations
FOR ALL
USING (get_current_user_role() = 'admin');