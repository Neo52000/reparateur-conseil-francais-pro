-- Phase 1: Payment System Tables

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes_with_timeline(id),
  appointment_id UUID REFERENCES appointments(id),
  client_id UUID REFERENCES auth.users(id),
  repairer_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2),
  repairer_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'captured', 'held', 'released', 'refunded', 'failed')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  amount DECIMAL(10,2) NOT NULL,
  hold_reason TEXT,
  status TEXT CHECK (status IN ('held', 'released', 'expired')),
  held_at TIMESTAMPTZ DEFAULT NOW(),
  release_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_refund_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_quote ON payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;