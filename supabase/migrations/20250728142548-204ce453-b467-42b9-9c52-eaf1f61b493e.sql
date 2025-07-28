-- Enable RLS on the edge_function_configs table
ALTER TABLE public.edge_function_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for edge_function_configs - only admins can manage
CREATE POLICY "Only admins can manage edge function configs" 
ON public.edge_function_configs 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');