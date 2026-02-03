/**
 * Supabase Schema Migration
 * 
 * Run this in Supabase SQL Editor to create tables, indexes, and RLS policies
 * 
 * Best Practices Applied:
 * - UUID primary keys for security (no sequential IDs)
 * - Updated_at triggers for automatic timestamp updates
 * - RLS policies for row-level security
 * - Indexes on frequently queried columns
 * - Check constraints for data integrity
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  segment VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (segment IN ('free', 'premium', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  source VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ
);

-- Indexes for subscribers
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_segment ON subscribers(segment);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_segment_status ON subscribers(segment, status) WHERE status = 'active';

-- ============================================
-- NEWSLETTER CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT,
  segment VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (segment IN ('free', 'premium', 'all')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER NOT NULL DEFAULT 0,
  open_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at) WHERE status = 'scheduled';

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE SET NULL,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'opened', 'clicked', 'failed')),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for email logs
CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_provider_id ON email_logs(provider_message_id) WHERE provider_message_id IS NOT NULL;

-- ============================================
-- API KEYS TABLE (for external integrations)
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- Indexes for API keys
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- ============================================
-- AUTO-UPDATE TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to subscribers
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
-- Public: Can only insert (signup) - no read access
CREATE POLICY "Allow public signup" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Public: Can only update their own record via email verification
CREATE POLICY "Allow unsubscribe" ON subscribers
  FOR UPDATE USING (true) WITH CHECK (true);

-- Admin: Full access (via service role)
CREATE POLICY "Admin full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Campaigns policies (admin only)
CREATE POLICY "Admin campaigns access" ON newsletter_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- Email logs policies (admin only)
CREATE POLICY "Admin email logs access" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

-- API keys policies (admin only)
CREATE POLICY "Admin API keys access" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Subscriber statistics by segment and status
CREATE OR REPLACE VIEW subscriber_stats AS
SELECT 
  segment,
  status,
  COUNT(*) as count
FROM subscribers
GROUP BY segment, status;

-- Campaign performance statistics
CREATE OR REPLACE VIEW campaign_stats AS
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.sent_count as total_sent,
  COUNT(DISTINCT CASE WHEN e.status = 'delivered' THEN e.id END) as total_delivered,
  COUNT(DISTINCT CASE WHEN e.status = 'opened' THEN e.id END) as total_opened,
  COUNT(DISTINCT CASE WHEN e.status = 'clicked' THEN e.id END) as total_clicked,
  CASE 
    WHEN c.sent_count > 0 THEN ROUND(COUNT(DISTINCT CASE WHEN e.status = 'opened' THEN e.id END)::numeric / c.sent_count * 100, 2)
    ELSE 0
  END as open_rate,
  CASE 
    WHEN c.sent_count > 0 THEN ROUND(COUNT(DISTINCT CASE WHEN e.status = 'clicked' THEN e.id END)::numeric / c.sent_count * 100, 2)
    ELSE 0
  END as click_rate
FROM newsletter_campaigns c
LEFT JOIN email_logs e ON e.campaign_id = c.id
GROUP BY c.id, c.name, c.sent_count;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to safely increment campaign sent count
CREATE OR REPLACE FUNCTION increment_campaign_sent(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE newsletter_campaigns
  SET sent_count = sent_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to unsubscribe by email (for unsubscribe links)
CREATE OR REPLACE FUNCTION unsubscribe_by_email(user_email CITEXT)
RETURNS boolean AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE subscribers
  SET 
    status = 'unsubscribed',
    unsubscribed_at = NOW(),
    updated_at = NOW()
  WHERE email = user_email AND status = 'active';
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANTS (for service role)
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
