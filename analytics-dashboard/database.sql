-- Marketing Analytics Database Schema
-- Robotica Weekly - Email Event Tracking
-- Created: 2026-02-03 by Marty

-- =====================================================
-- EMAIL EVENTS TABLE
-- Tracks all SendGrid events: delivered, open, click, unsubscribe, bounce
-- =====================================================

CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'open', 'click', 'unsubscribe', 'bounce', 'dropped', 'processed', 'deferred')),
  email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  ip TEXT,
  url TEXT,
  sg_message_id TEXT,
  sg_event_id TEXT,
  category TEXT[],
  reason TEXT, -- for bounce/drop events
  status TEXT, -- for processed events
  response TEXT, -- SMTP response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR QUERY PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_email_events_newsletter ON email_events(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_created ON email_events(created_at);

-- Composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_email_events_newsletter_type ON email_events(newsletter_id, event_type);

-- =====================================================
-- NEWSLETTER METRICS SUMMARY TABLE
-- Pre-aggregated metrics for fast dashboard queries
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id TEXT NOT NULL UNIQUE,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0, -- click-to-open rate
  sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_metrics_id ON newsletter_metrics(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_metrics_sent ON newsletter_metrics(sent_at);

-- =====================================================
-- SUBSCRIBER ENGAGEMENT SCORES
-- Track individual subscriber engagement over time
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriber_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  emails_received INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  engagement_score DECIMAL(5,2) DEFAULT 0, -- 0-100 score
  cohort_date DATE, -- when they subscribed
  churn_risk TEXT CHECK (churn_risk IN ('low', 'medium', 'high')) DEFAULT 'low',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriber_engagement_email ON subscriber_engagement(email);
CREATE INDEX IF NOT EXISTS idx_subscriber_engagement_score ON subscriber_engagement(engagement_score);

-- =====================================================
-- A/B TEST RESULTS TABLE
-- Store test configurations and results
-- =====================================================

CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('subject', 'content', 'cta', 'send_time')),
  variant_a_label TEXT DEFAULT 'A',
  variant_b_label TEXT DEFAULT 'B',
  variant_a_value TEXT NOT NULL,
  variant_b_value TEXT NOT NULL,
  split_percent INTEGER DEFAULT 50 CHECK (split_percent BETWEEN 10 AND 90),
  winner_criteria TEXT DEFAULT 'open_rate' CHECK (winner_criteria IN ('open_rate', 'click_rate', 'ctr')),
  status TEXT DEFAULT 'running' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  winner_variant TEXT CHECK (winner_variant IN ('A', 'B', 'tie')),
  confidence_level DECIMAL(5,2),
  lift_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_newsletter ON ab_tests(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);

-- =====================================================
-- DAILY AGGREGATES TABLE
-- For time-series charts and trend analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  new_subscribers INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  avg_open_rate DECIMAL(5,2) DEFAULT 0,
  avg_click_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);

-- =====================================================
-- RLS POLICIES
-- Service role only for API security
-- =====================================================

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Deny all access by default (service role bypasses RLS)
CREATE POLICY "Deny all access" ON email_events FOR ALL USING (false);
CREATE POLICY "Deny all access" ON newsletter_metrics FOR ALL USING (false);
CREATE POLICY "Deny all access" ON subscriber_engagement FOR ALL USING (false);
CREATE POLICY "Deny all access" ON ab_tests FOR ALL USING (false);
CREATE POLICY "Deny all access" ON daily_metrics FOR ALL USING (false);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update newsletter metrics when events are inserted
CREATE OR REPLACE FUNCTION update_newsletter_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert metrics for this newsletter
  INSERT INTO newsletter_metrics (newsletter_id, sent_count, delivered_count, opened_count, clicked_count, unsubscribed_count, bounced_count)
  VALUES (
    NEW.newsletter_id,
    CASE WHEN NEW.event_type = 'processed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'delivered' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'open' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'unsubscribe' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'bounce' THEN 1 ELSE 0 END
  )
  ON CONFLICT (newsletter_id) DO UPDATE SET
    sent_count = newsletter_metrics.sent_count + CASE WHEN NEW.event_type = 'processed' THEN 1 ELSE 0 END,
    delivered_count = newsletter_metrics.delivered_count + CASE WHEN NEW.event_type = 'delivered' THEN 1 ELSE 0 END,
    opened_count = newsletter_metrics.opened_count + CASE WHEN NEW.event_type = 'open' THEN 1 ELSE 0 END,
    clicked_count = newsletter_metrics.clicked_count + CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    unsubscribed_count = newsletter_metrics.unsubscribed_count + CASE WHEN NEW.event_type = 'unsubscribe' THEN 1 ELSE 0 END,
    bounced_count = newsletter_metrics.bounced_count + CASE WHEN NEW.event_type = 'bounce' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update metrics
CREATE TRIGGER trigger_update_newsletter_metrics
AFTER INSERT ON email_events
FOR EACH ROW
EXECUTE FUNCTION update_newsletter_metrics();

-- Update rates after metrics change
CREATE OR REPLACE FUNCTION calculate_rates()
RETURNS TRIGGER AS $$
BEGIN
  NEW.open_rate := CASE 
    WHEN NEW.delivered_count > 0 THEN ROUND((NEW.opened_count::DECIMAL / NEW.delivered_count) * 100, 2)
    ELSE 0 
  END;
  
  NEW.click_rate := CASE 
    WHEN NEW.delivered_count > 0 THEN ROUND((NEW.clicked_count::DECIMAL / NEW.delivered_count) * 100, 2)
    ELSE 0 
  END;
  
  NEW.ctr := CASE 
    WHEN NEW.opened_count > 0 THEN ROUND((NEW.clicked_count::DECIMAL / NEW.opened_count) * 100, 2)
    ELSE 0 
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_rates
BEFORE UPDATE ON newsletter_metrics
FOR EACH ROW
EXECUTE FUNCTION calculate_rates();

-- Update daily aggregates
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS TRIGGER AS $$
DECLARE
  event_date DATE;
BEGIN
  event_date := DATE(NEW.timestamp);
  
  INSERT INTO daily_metrics (date, emails_sent, emails_delivered, emails_opened, emails_clicked, unsubscribes)
  VALUES (
    event_date,
    CASE WHEN NEW.event_type = 'processed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'delivered' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'open' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'unsubscribe' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date) DO UPDATE SET
    emails_sent = daily_metrics.emails_sent + CASE WHEN NEW.event_type = 'processed' THEN 1 ELSE 0 END,
    emails_delivered = daily_metrics.emails_delivered + CASE WHEN NEW.event_type = 'delivered' THEN 1 ELSE 0 END,
    emails_opened = daily_metrics.emails_opened + CASE WHEN NEW.event_type = 'open' THEN 1 ELSE 0 END,
    emails_clicked = daily_metrics.emails_clicked + CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    unsubscribes = daily_metrics.unsubscribes + CASE WHEN NEW.event_type = 'unsubscribe' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_metrics
AFTER INSERT ON email_events
FOR EACH ROW
EXECUTE FUNCTION update_daily_metrics();

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON email_events TO service_role;
GRANT ALL ON newsletter_metrics TO service_role;
GRANT ALL ON subscriber_engagement TO service_role;
GRANT ALL ON ab_tests TO service_role;
GRANT ALL ON daily_metrics TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
