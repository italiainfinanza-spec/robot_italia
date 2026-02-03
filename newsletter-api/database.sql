-- Database Setup for Newsletter API
-- Run this in Supabase SQL Editor

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{"dailyDigest": true, "weeklySummary": true, "marketingEmails": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  email_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Service role policy (full access for API)
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_tier ON subscribers(tier);
CREATE INDEX idx_subscribers_created_at ON subscribers(created_at);

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  metadata JSONB
);

-- Indexes for analytics
CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_email);
CREATE INDEX idx_email_logs_newsletter ON email_logs(newsletter_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to increment email count
CREATE OR REPLACE FUNCTION increment_email_count(row_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT email_count INTO current_count FROM subscribers WHERE email = row_email;
  RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Add a test subscriber (remove in production)
-- INSERT INTO subscribers (email, name, tier, status)
-- VALUES ('test@example.com', 'Test User', 'free', 'active');
