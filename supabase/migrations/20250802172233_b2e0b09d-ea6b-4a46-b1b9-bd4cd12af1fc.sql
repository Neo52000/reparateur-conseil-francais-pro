-- Create client_favorites table
CREATE TABLE public.client_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL REFERENCES public.repairer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, repairer_id)
);

-- Enable Row Level Security
ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for client_favorites
CREATE POLICY "Clients can manage their own favorites" 
ON public.client_favorites 
FOR ALL 
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Create index for performance
CREATE INDEX idx_client_favorites_client_id ON public.client_favorites(client_id);
CREATE INDEX idx_client_favorites_repairer_id ON public.client_favorites(repairer_id);