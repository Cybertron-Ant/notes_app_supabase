-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_payments CASCADE;
DROP TABLE IF EXISTS payment_plans CASCADE;

-- Create payment_plans table
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  max_notes INTEGER,
  price_usd DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_payments table
CREATE TABLE user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id UUID NOT NULL REFERENCES payment_plans(id),
  transaction_id TEXT NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO payment_plans (name, max_notes, price_usd) VALUES
  ('Free', 3, 0),
  ('Pro', NULL, 9.99);

-- Enable RLS
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to payment_plans"
ON payment_plans FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to read their payments"
ON user_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create their payments"
ON user_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);
