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

-- Create indexes for performance
CREATE INDEX idx_scraping_suggestions_status ON public.scraping_suggestions(status);
CREATE INDEX idx_scraping_suggestions_created_at ON public.scraping_suggestions(created_at DESC);
CREATE INDEX idx_scraping_suggestions_confidence ON public.scraping_suggestions(confidence_score DESC);