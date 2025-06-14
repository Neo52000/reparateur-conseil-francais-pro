
-- Create a comprehensive view for admin subscription overview
CREATE OR REPLACE VIEW admin_subscription_overview AS
SELECT 
    rs.id,
    rs.repairer_id,
    rs.email,
    rs.subscription_tier,
    rs.billing_cycle,
    rs.subscribed,
    rs.subscription_end,
    rs.created_at,
    rs.updated_at,
    p.first_name,
    p.last_name,
    sp.name as plan_name,
    sp.price_monthly,
    sp.price_yearly
FROM repairer_subscriptions rs
LEFT JOIN profiles p ON rs.user_id = p.id
LEFT JOIN subscription_plans sp ON rs.subscription_plan_id = sp.id
ORDER BY rs.created_at DESC;
