-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id UUID NOT NULL REFERENCES payment_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read their subscriptions"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create their subscriptions"
ON user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their subscriptions"
ON user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);
