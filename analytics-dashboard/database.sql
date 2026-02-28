-- ============================================================================
-- Marketing Analytics Database Schema
-- Robotica Weekly Newsletter Analytics System
-- Phase 1-2 Implementation
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Newsletter campaigns/issues tracking
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  content_hash TEXT, -- For detecting changes
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'archived')),
  total_recipients INTEGER DEFAULT 0,
  free_recipients INTEGER DEFAULT 0,
  premium_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email events table for SendGrid webhooks
CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('processed', 'delivered', 'open', 'click', 'bounce', 'dropped', 'deferred', 'unsubscribe', 'group_unsubscribe', 'group_resubscribe', 'spamreport')),
  email TEXT NOT NULL,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  sg_event_id TEXT,
  sg_message_id TEXT,
  user_agent TEXT,
  ip TEXT,
  url TEXT,
  category TEXT[],
  reason TEXT, -- For bounce/drop events
  status TEXT, -- For processed events
  response TEXT, -- SMTP response
  tls BOOLEAN DEFAULT FALSE,
  url_offset JSONB, -- For click events
  asm_group_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UTM tracking for click attribution
CREATE TABLE IF NOT EXISTS utm_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_event_id UUID REFERENCES email_events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  clicked_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregated metrics (for performance)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_subscribers INTEGER DEFAULT 0,
  new_subscribers INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,
  open_rate DECIMAL(5,4),
  click_rate DECIMAL(5,4),
  click_to_open_rate DECIMAL(5,4),
  bounce_rate DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter-specific metrics aggregation
CREATE TABLE IF NOT EXISTS newsletter_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE UNIQUE,
  recipients INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,
  open_rate DECIMAL(5,4),
  click_rate DECIMAL(5,4),
  click_to_open_rate DECIMAL(5,4),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Testing experiments
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('subject_line', 'content', 'cta_button', 'send_time', 'sender_name')),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  winner_variant TEXT,
  confidence_level DECIMAL(4,3) DEFAULT 0.95, -- 95% default
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test variants
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL CHECK (variant_name IN ('a', 'b', 'c')),
  value TEXT NOT NULL, -- The actual content being tested
  recipients INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  open_rate DECIMAL(5,4),
  click_rate DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Email events indexes
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_newsletter ON email_events(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_events_type_timestamp ON email_events(event_type, timestamp);

-- UTM clicks indexes
CREATE INDEX IF NOT EXISTS idx_utm_clicks_newsletter ON utm_clicks(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_utm_clicks_content ON utm_clicks(utm_content);
CREATE INDEX IF NOT EXISTS idx_utm_clicks_campaign ON utm_clicks(utm_campaign);

-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_newsletter_metrics_newsletter ON newsletter_metrics(newsletter_id);

-- A/B test indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_newsletter ON ab_tests(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test ON ab_test_variants(test_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables
CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at
  BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate newsletter metrics
CREATE OR REPLACE FUNCTION calculate_newsletter_metrics(p_newsletter_id UUID)
RETURNS TABLE (
  recipients INTEGER,
  delivered INTEGER,
  opens INTEGER,
  unique_opens INTEGER,
  clicks INTEGER,
  unique_clicks INTEGER,
  open_rate DECIMAL,
  click_rate DECIMAL,
  click_to_open_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT
      COUNT(DISTINCT ee.email) FILTER (WHERE ee.event_type = 'delivered') as delivered_count,
      COUNT(*) FILTER (WHERE ee.event_type = 'open') as open_count,
      COUNT(DISTINCT ee.email) FILTER (WHERE ee.event_type = 'open') as unique_open_count,
      COUNT(*) FILTER (WHERE ee.event_type = 'click') as click_count,
      COUNT(DISTINCT ee.email) FILTER (WHERE ee.event_type = 'click') as unique_click_count
    FROM email_events ee
    WHERE ee.newsletter_id = p_newsletter_id
  )
  SELECT
    n.total_recipients as recipients,
    COALESCE(m.delivered_count, 0)::INTEGER as delivered,
    COALESCE(m.open_count, 0)::INTEGER as opens,
    COALESCE(m.unique_open_count, 0)::INTEGER as unique_opens,
    COALESCE(m.click_count, 0)::INTEGER as clicks,
    COALESCE(m.unique_click_count, 0)::INTEGER as unique_clicks,
    CASE 
      WHEN COALESCE(m.delivered_count, 0) > 0 
      THEN ROUND((m.unique_open_count::DECIMAL / m.delivered_count) * 100, 2)
      ELSE 0
    END as open_rate,
    CASE 
      WHEN COALESCE(m.delivered_count, 0) > 0 
      THEN ROUND((m.unique_click_count::DECIMAL / m.delivered_count) * 100, 2)
      ELSE 0
    END as click_rate,
    CASE 
      WHEN COALESCE(m.unique_open_count, 0) > 0 
      THEN ROUND((m.unique_click_count::DECIMAL / m.unique_open_count) * 100, 2)
      ELSE 0
    END as click_to_open_rate
  FROM newsletters n
  CROSS JOIN metrics m
  WHERE n.id = p_newsletter_id;
END;
$$ LANGUAGE plpgsql;

-- Aggregate daily metrics
CREATE OR REPLACE FUNCTION aggregate_daily_metrics(p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_metrics (
    date,
    emails_delivered,
    emails_opened,
    unique_opens,
    clicks,
    unique_clicks,
    bounces,
    unsubscribes,
    spam_reports
  )
  SELECT
    p_date as date,
    COUNT(*) FILTER (WHERE event_type = 'delivered'),
    COUNT(*) FILTER (WHERE event_type = 'open'),
    COUNT(DISTINCT email) FILTER (WHERE event_type = 'open'),
    COUNT(*) FILTER (WHERE event_type = 'click'),
    COUNT(DISTINCT email) FILTER (WHERE event_type = 'click'),
    COUNT(*) FILTER (WHERE event_type IN ('bounce', 'dropped')),
    COUNT(*) FILTER (WHERE event_type = 'unsubscribe'),
    COUNT(*) FILTER (WHERE event_type = 'spamreport')
  FROM email_events
  WHERE DATE(timestamp) = p_date
  ON CONFLICT (date) DO UPDATE SET
    emails_delivered = EXCLUDED.emails_delivered,
    emails_opened = EXCLUDED.emails_opened,
    unique_opens = EXCLUDED.unique_opens,
    clicks = EXCLUDED.clicks,
    unique_clicks = EXCLUDED.unique_clicks,
    bounces = EXCLUDED.bounces,
    unsubscribes = EXCLUDED.unsubscribes,
    spam_reports = EXCLUDED.spam_reports,
    updated_at = NOW();

  -- Calculate rates
  UPDATE daily_metrics
  SET
    open_rate = CASE WHEN emails_delivered > 0 THEN ROUND((unique_opens::DECIMAL / emails_delivered) * 100, 4) ELSE 0 END,
    click_rate = CASE WHEN emails_delivered > 0 THEN ROUND((unique_clicks::DECIMAL / emails_delivered) * 100, 4) ELSE 0 END,
    click_to_open_rate = CASE WHEN unique_opens > 0 THEN ROUND((unique_clicks::DECIMAL / unique_opens) * 100, 4) ELSE 0 END,
    bounce_rate = CASE WHEN emails_delivered > 0 THEN ROUND((bounces::DECIMAL / emails_delivered) * 100, 4) ELSE 0 END
  WHERE date = p_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

-- Service role only access (for API security)
CREATE POLICY "Service role full access" ON newsletters
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON email_events
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON utm_clicks
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON daily_metrics
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON newsletter_metrics
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON ab_tests
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON ab_test_variants
  FOR ALL USING (current_user = 'service_role');

-- ============================================================================
-- VIEWS FOR DASHBOARD QUERIES
-- ============================================================================

-- Executive summary view
CREATE OR REPLACE VIEW v_executive_summary AS
WITH last_30_days AS (
  SELECT * FROM daily_metrics
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
),
last_newsletter AS (
  SELECT * FROM newsletters
  WHERE status = 'sent'
  ORDER BY sent_at DESC
  LIMIT 1
),
metrics AS (
  SELECT
    COALESCE(SUM(new_subscribers), 0) as total_new_subscribers,
    COALESCE(SUM(unsubscribes), 0) as total_unsubscribes,
    COALESCE(AVG(open_rate), 0) as avg_open_rate,
    COALESCE(AVG(click_rate), 0) as avg_click_rate
  FROM last_30_days
)
SELECT
  (SELECT issue_number FROM last_newsletter) as last_issue_number,
  (SELECT sent_at FROM last_newsletter) as last_sent_at,
  m.total_new_subscribers,
  m.total_unsubscribes,
  ROUND(m.avg_open_rate * 100, 2) as avg_open_rate_pct,
  ROUND(m.avg_click_rate * 100, 2) as avg_click_rate_pct,
  (SELECT total_subscribers FROM daily_metrics WHERE date = CURRENT_DATE - 1) as current_subscriber_count
FROM metrics m;

-- Top performing content (by click rate)
CREATE OR REPLACE VIEW v_top_performing_content AS
SELECT
  n.issue_number,
  n.title,
  nm.unique_opens,
  nm.unique_clicks,
  nm.click_to_open_rate * 100 as click_to_open_rate_pct,
  n.sent_at
FROM newsletters n
JOIN newsletter_metrics nm ON n.id = nm.newsletter_id
WHERE n.status = 'sent'
ORDER BY nm.click_to_open_rate DESC
LIMIT 10;

-- Newsletter performance history
CREATE OR REPLACE VIEW v_newsletter_performance AS
SELECT
  n.issue_number,
  n.subject_line,
  n.sent_at,
  n.total_recipients,
  nm.delivered,
  nm.unique_opens,
  nm.unique_clicks,
  ROUND(nm.open_rate * 100, 2) as open_rate_pct,
  ROUND(nm.click_rate * 100, 2) as click_rate_pct,
  nm.unsubscribes,
  nm.bounces
FROM newsletters n
LEFT JOIN newsletter_metrics nm ON n.id = nm.newsletter_id
WHERE n.status = 'sent'
ORDER BY n.sent_at DESC;

-- UTM performance breakdown
CREATE OR REPLACE VIEW v_utm_performance AS
SELECT
  uc.utm_campaign,
  uc.utm_content,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT uc.email) as unique_clicks,
  n.issue_number
FROM utm_clicks uc
JOIN newsletters n ON uc.newsletter_id = n.id
GROUP BY uc.utm_campaign, uc.utm_content, n.issue_number
ORDER BY total_clicks DESC;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert placeholder newsletter records for existing editions
INSERT INTO newsletters (issue_number, title, subject_line, status, sent_at)
VALUES
  (1, 'Figure AI $1B+ Funding Round', 'Figure AI: Unicorno da $39B | Robotica Premium #001', 'sent', '2026-02-03 08:00:00+00'),
  (2, 'NVIDIA Physical AI Platform', 'Il ChatGPT Moment della Robotica | Robotica Premium #002', 'sent', '2026-02-04 08:00:00+00')
ON CONFLICT (issue_number) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
