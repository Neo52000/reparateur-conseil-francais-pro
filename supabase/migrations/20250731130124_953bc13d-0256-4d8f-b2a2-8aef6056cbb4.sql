-- Create table for storing scraping suggestions
CREATE TABLE public.scraping_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scraped_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  source TEXT NOT NULL DEFAULT 'intelligent_scraping',
  confidence_score NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.scraping_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage scraping suggestions"
  ON public.scraping_suggestions
  FOR ALL
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Users with scraping permissions can view suggestions"
  ON public.scraping_suggestions
  FOR SELECT
  USING (
    get_current_user_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'scraping_manager')
      AND is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX idx_scraping_suggestions_status ON public.scraping_suggestions(status);
CREATE INDEX idx_scraping_suggestions_created_at ON public.scraping_suggestions(created_at DESC);
CREATE INDEX idx_scraping_suggestions_confidence ON public.scraping_suggestions(confidence_score DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_scraping_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reviewed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraping_suggestions_updated_at
  BEFORE UPDATE ON public.scraping_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scraping_suggestions_updated_at();

-- Create scraping_logs table for monitoring
CREATE TABLE public.scraping_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_city TEXT NOT NULL,
  target_category TEXT NOT NULL,
  source TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  results_found INTEGER DEFAULT 0,
  suggestions_created INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS for scraping_logs
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scraping logs"
  ON public.scraping_logs
  FOR ALL
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own scraping logs"
  ON public.scraping_logs
  FOR SELECT
  USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

-- Create indexes
CREATE INDEX idx_scraping_logs_status ON public.scraping_logs(status);
CREATE INDEX idx_scraping_logs_started_at ON public.scraping_logs(started_at DESC);
CREATE INDEX idx_scraping_logs_user_id ON public.scraping_logs(user_id);