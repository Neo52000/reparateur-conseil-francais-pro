
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('admin', 'partner', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    COALESCE(new.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN new;
END;
$$;

-- Create trigger for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Update repairer_subscriptions to link with profiles
ALTER TABLE public.repairer_subscriptions 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create admin dashboard view for subscriptions
CREATE OR REPLACE VIEW public.admin_subscription_overview AS
SELECT 
  rs.id,
  rs.repairer_id,
  p.email,
  p.first_name,
  p.last_name,
  rs.subscribed,
  rs.subscription_tier,
  rs.billing_cycle,
  rs.subscription_end,
  sp.name as plan_name,
  sp.price_monthly,
  sp.price_yearly,
  rs.created_at,
  rs.updated_at
FROM public.repairer_subscriptions rs
LEFT JOIN public.profiles p ON rs.profile_id = p.id
LEFT JOIN public.subscription_plans sp ON rs.subscription_plan_id = sp.id;

-- Grant access to admin view
GRANT SELECT ON public.admin_subscription_overview TO authenticated;

-- Insert test partner data (will be created when user signs up)
-- The profile will be automatically created via trigger when auth user is created

-- Insert test subscription for the partner
INSERT INTO public.repairer_subscriptions (
  repairer_id,
  email,
  subscribed,
  subscription_tier,
  billing_cycle,
  subscription_end
) VALUES (
  'test-partner-001',
  'reine.elie@gmail.com',
  true,
  'enterprise',
  'monthly',
  now() + interval '1 month'
) ON CONFLICT (repairer_id) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  billing_cycle = EXCLUDED.billing_cycle,
  subscription_end = EXCLUDED.subscription_end;
