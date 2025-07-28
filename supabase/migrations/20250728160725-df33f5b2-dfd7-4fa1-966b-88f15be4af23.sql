-- Create table for tracking profile analytics
CREATE TABLE public.profile_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  referrer TEXT DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  session_id TEXT DEFAULT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics access
CREATE POLICY "Admins can view all analytics" 
ON public.profile_analytics 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Anyone can insert analytics" 
ON public.profile_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_profile_analytics_repairer_id ON public.profile_analytics(repairer_id);
CREATE INDEX idx_profile_analytics_created_at ON public.profile_analytics(created_at);
CREATE INDEX idx_profile_analytics_event_type ON public.profile_analytics(event_type);