
-- Création de la table admin_audit_logs pour la traçabilité
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  before_data JSONB,
  after_data JSONB,
  severity_level TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_admin_audit_logs_timestamp ON public.admin_audit_logs(timestamp DESC);
CREATE INDEX idx_admin_audit_logs_admin_user ON public.admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_action_type ON public.admin_audit_logs(action_type);
CREATE INDEX idx_admin_audit_logs_resource ON public.admin_audit_logs(resource_type, resource_id);

-- Activer RLS pour sécuriser l'accès aux logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy pour que seuls les admins puissent voir les logs
CREATE POLICY "Only admins can view audit logs" 
  ON public.admin_audit_logs 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy pour que seuls les admins puissent insérer des logs
CREATE POLICY "Only admins can insert audit logs" 
  ON public.admin_audit_logs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Contrainte pour vérifier les niveaux de sévérité
ALTER TABLE public.admin_audit_logs 
ADD CONSTRAINT check_severity_level 
CHECK (severity_level IN ('info', 'warning', 'critical'));

-- Contrainte pour vérifier les types d'actions
ALTER TABLE public.admin_audit_logs 
ADD CONSTRAINT check_action_type 
CHECK (action_type IN (
  'login', 'logout', 'create', 'update', 'delete', 
  'approve', 'reject', 'activate', 'deactivate',
  'scraping_start', 'scraping_stop', 'export',
  'configuration_change', 'user_management'
));
