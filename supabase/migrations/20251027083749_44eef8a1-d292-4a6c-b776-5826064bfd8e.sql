-- Phase 1: Create conversation memory table for contextual chatbot
CREATE TABLE IF NOT EXISTS public.conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_session ON public.conversation_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user ON public.conversation_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_expires ON public.conversation_memory(expires_at);

-- Auto-delete expired conversations
CREATE OR REPLACE FUNCTION public.cleanup_expired_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.conversation_memory WHERE expires_at < NOW();
END;
$$;

-- Create AI analytics table
CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  function_name TEXT NOT NULL,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  cost_estimate NUMERIC(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analytics_provider ON public.ai_analytics(provider);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_function ON public.ai_analytics(function_name);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_created ON public.ai_analytics(created_at);

-- Enable RLS
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_memory
CREATE POLICY "Users can view their own conversations"
  ON public.conversation_memory FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own conversations"
  ON public.conversation_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own conversations"
  ON public.conversation_memory FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for ai_analytics (admin only)
CREATE POLICY "Admins can view AI analytics"
  ON public.ai_analytics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert AI analytics"
  ON public.ai_analytics FOR INSERT
  WITH CHECK (true);

-- Add AI quality scores to repairers table
ALTER TABLE public.repairers 
ADD COLUMN IF NOT EXISTS ai_quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_reliability_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_price_competitiveness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_specialties TEXT[],
ADD COLUMN IF NOT EXISTS ai_red_flags TEXT[],
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_repairers_ai_quality ON public.repairers(ai_quality_score);
CREATE INDEX IF NOT EXISTS idx_repairers_ai_analyzed ON public.repairers(ai_analyzed_at);