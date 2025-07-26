-- Create table for ecommerce integrations
CREATE TABLE IF NOT EXISTS public.ecommerce_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecommerce_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage all ecommerce integrations" 
ON public.ecommerce_integrations 
FOR ALL 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Add trigger for updated_at
CREATE TRIGGER update_ecommerce_integrations_updated_at
BEFORE UPDATE ON public.ecommerce_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();