-- Tables pour améliorer le Dashboard Réparateur Phase 1

-- Table des services/prestations par réparateur
CREATE TABLE public.repairer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des statistiques réelles du réparateur
CREATE TABLE public.repairer_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  total_revenue DECIMAL(10,2) DEFAULT 0,
  completed_repairs INTEGER DEFAULT 0,
  pending_orders INTEGER DEFAULT 0,
  average_repair_time DECIMAL(5,2) DEFAULT 0,
  customer_satisfaction DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(repairer_id, month_year)
);

-- Table des équipes/collaborateurs
CREATE TABLE public.repairer_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee', -- 'admin', 'technician', 'salesperson', 'accountant'
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(repairer_id, user_id)
);

-- Table des invitations d'équipe
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  permissions JSONB DEFAULT '{}',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.repairer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairer_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairer_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour repairer_services
CREATE POLICY "Repairers can manage their own services" 
ON public.repairer_services 
FOR ALL 
USING (repairer_id = auth.uid());

-- Politiques RLS pour repairer_statistics
CREATE POLICY "Repairers can manage their own statistics" 
ON public.repairer_statistics 
FOR ALL 
USING (repairer_id = auth.uid());

-- Politiques RLS pour repairer_team_members
CREATE POLICY "Team members can view their team" 
ON public.repairer_team_members 
FOR SELECT 
USING (
  repairer_id = auth.uid() 
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.repairer_team_members rtm 
    WHERE rtm.repairer_id = repairer_team_members.repairer_id 
    AND rtm.user_id = auth.uid() 
    AND rtm.is_active = true
  )
);

CREATE POLICY "Repairer owners can manage their team" 
ON public.repairer_team_members 
FOR ALL 
USING (repairer_id = auth.uid());

-- Politiques RLS pour team_invitations
CREATE POLICY "Repairers can manage their team invitations" 
ON public.team_invitations 
FOR ALL 
USING (repairer_id = auth.uid());

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_repairer_services_updated_at
    BEFORE UPDATE ON public.repairer_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairer_statistics_updated_at
    BEFORE UPDATE ON public.repairer_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairer_team_members_updated_at
    BEFORE UPDATE ON public.repairer_team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at
    BEFORE UPDATE ON public.team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();