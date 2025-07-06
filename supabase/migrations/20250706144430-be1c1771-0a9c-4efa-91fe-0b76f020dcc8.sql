-- Créer la table performance_metrics pour stocker les métriques de performance
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent insérer leurs propres métriques
CREATE POLICY "Users can insert their own performance metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent voir leurs propres métriques
CREATE POLICY "Users can view their own performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour que les admins puissent tout voir
CREATE POLICY "Admins can view all performance metrics" 
ON public.performance_metrics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Index pour les performances
CREATE INDEX idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_event_type ON public.performance_metrics(event_type);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);