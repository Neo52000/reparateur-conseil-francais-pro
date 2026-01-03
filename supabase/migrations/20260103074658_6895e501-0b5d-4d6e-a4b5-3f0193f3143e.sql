-- Corriger les fonctions avec search_path
CREATE OR REPLACE FUNCTION calculate_seo_score(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM repairer_profiles WHERE id = profile_id;
  
  IF profile IS NULL THEN RETURN 0; END IF;
  
  score := COALESCE(profile.repairer_level, 0) * 20;
  
  IF profile.description IS NOT NULL AND length(profile.description) > 100 THEN score := score + 10; END IF;
  IF profile.phone IS NOT NULL THEN score := score + 5; END IF;
  IF profile.email IS NOT NULL THEN score := score + 5; END IF;
  IF profile.website IS NOT NULL THEN score := score + 5; END IF;
  IF profile.logo_url IS NOT NULL THEN score := score + 10; END IF;
  IF profile.siret IS NOT NULL THEN score := score + 10; END IF;
  
  IF array_length(profile.services, 1) > 3 THEN score := score + 10; END IF;
  IF array_length(profile.specialties, 1) > 2 THEN score := score + 5; END IF;
  
  IF profile.opening_hours IS NOT NULL THEN score := score + 10; END IF;
  
  IF profile.is_verified THEN score := score + 15; END IF;
  IF profile.has_qualirepar_label THEN score := score + 10; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 15;
  filled_fields INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM repairer_profiles WHERE id = profile_id;
  
  IF profile IS NULL THEN RETURN 0; END IF;
  
  IF profile.business_name IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.description IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.phone IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.email IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.website IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.address IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.city IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.postal_code IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.logo_url IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.siret IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.opening_hours IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF array_length(profile.services, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF array_length(profile.specialties, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF profile.lat IS NOT NULL AND profile.lng IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.is_verified THEN filled_fields := filled_fields + 1; END IF;
  
  RETURN (filled_fields * 100) / total_fields;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;