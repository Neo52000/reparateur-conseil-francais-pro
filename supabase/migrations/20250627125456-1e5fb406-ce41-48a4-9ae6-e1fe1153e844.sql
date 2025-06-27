
-- Create RPC functions for incrementing impressions and clicks
CREATE OR REPLACE FUNCTION increment_impressions(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ad_banners 
  SET current_impressions = current_impressions + 1,
      updated_at = now()
  WHERE id = banner_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_clicks(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ad_banners 
  SET current_clicks = current_clicks + 1,
      updated_at = now()
  WHERE id = banner_id;
END;
$$;
