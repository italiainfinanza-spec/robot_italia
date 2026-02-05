-- Marketing Analytics Database Schema
-- Phase 1-2: Email Events Tracking + Analytics Views
-- Created: 2026-02-03
-- Tech Stack: PostgreSQL (Supabase)

-- ============================================
-- CORE TABLES
-- ============================================

-- Email events table for analytics
-- Stores SendGrid webhook events: delivered, open, click, unsubscribe, bounce
CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'open', 'click', 'unsubscribe', 'bounce', 'dropped', 'deferred', 'processed')),
  email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,        -- e.g., 'premium-003', 'free-012'
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  ip INET,
  url TEXT,                           -- clicked URL (for click events)
  sg_message_id TEXT,
  sg_event_id TEXT,
  category TEXT[],                    -- SendGrid categories
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter metadata table
CREATE TABLE IF NOT EXISTS newsletters (
  id TEXT PRIMARY KEY,                -- e.g., 'premium-003'
  issue_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('premium', 'free')),
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily analytics aggregations (materialized view source)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  newsletter_id TEXT REFERENCES newsletters(id),
  
  -- Delivery metrics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  
  -- Engagement metrics
  unique_opens INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  
  -- Calculated rates (stored for performance)
  open_rate DECIMAL(5,2),             -- Percentage
  click_rate DECIMAL(5,2),            -- Percentage
  click_to_open_rate DECIMAL(5,2),    -- Percentage
  bounce_rate DECIMAL(5,2),           -- Percentage
  unsubscribe_rate DECIMAL(5,2),      -- Percentage
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date, newsletter_id)
);

-- UTM click tracking (detailed)
CREATE TABLE IF NOT EXISTS utm_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,
  url TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip INET
);

-- ============================================
-- INDEXES (Performance)
-- ============================================

-- Email events indexes
CREATE INDEX IF NOT EXISTS idx_email_events_newsletter ON email_events(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_created ON email_events(created_at);

-- Composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_email_events_newsletter_type ON email_events(newsletter_id, event_type);

-- Analytics daily indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_newsletter ON analytics_daily(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date_newsletter ON analytics_daily(date, newsletter_id);

-- UTM tracking indexes
CREATE INDEX IF NOT EXISTS idx_utm_clicks_newsletter ON utm_clicks(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_utm_clicks_content ON utm_clicks(utm_content);
CREATE INDEX IF NOT EXISTS idx_utm_clicks_campaign ON utm_clicks(utm_campaign);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_clicks ENABLE ROW LEVEL SECURITY;

-- Service role only policy (API access only)
CREATE POLICY "Service role full access" ON email_events
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON newsletters
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON analytics_daily
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role full access" ON utm_clicks
  FOR ALL USING (current_user = 'service_role');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_daily_updated_at
  BEFORE UPDATE ON analytics_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate open rate for a newsletter
CREATE OR REPLACE FUNCTION calculate_open_rate(p_newsletter_id TEXT)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_delivered INTEGER;
  v_unique_opens INTEGER;
BEGIN
  SELECT COUNT(DISTINCT email) INTO v_delivered
  FROM email_events
  WHERE newsletter_id = p_newsletter_id AND event_type = 'delivered';
  
  SELECT COUNT(DISTINCT email) INTO v_unique_opens
  FROM email_events
  WHERE newsletter_id = p_newsletter_id AND event_type = 'open';
  
  IF v_delivered = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_unique_opens::DECIMAL / v_delivered) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate click rate for a newsletter
CREATE OR REPLACE FUNCTION calculate_click_rate(p_newsletter_id TEXT)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_delivered INTEGER;
  v_unique_clicks INTEGER;
BEGIN
  SELECT COUNT(DISTINCT email) INTO v_delivered
  FROM email_events
  WHERE newsletter_id = p_newsletter_id AND event_type = 'delivered';
  
  SELECT COUNT(DISTINCT email) INTO v_unique_clicks
  FROM email_events
  WHERE newsletter_id = p_newsletter_id AND event_type = 'click';
  
  IF v_delivered = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_unique_clicks::DECIMAL / v_delivered) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to refresh daily analytics (call via cron or trigger)
CREATE OR REPLACE FUNCTION refresh_daily_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  -- Insert or update daily aggregations
  INSERT INTO analytics_daily (
    date, newsletter_id,
    emails_sent, emails_delivered, emails_bounced,
    unique_opens, total_opens, unique_clicks, total_clicks, unsubscribes,
    open_rate, click_rate, click_to_open_rate, bounce_rate, unsubscribe_rate
  )
  SELECT 
    DATE(e.timestamp) as date,
    e.newsletter_id,
    COUNT(DISTINCT CASE WHEN e.event_type = 'processed' THEN e.email END) as emails_sent,
    COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' THEN e.email END) as emails_delivered,
    COUNT(DISTINCT CASE WHEN e.event_type = 'bounce' THEN e.email END) as emails_bounced,
    COUNT(DISTINCT CASE WHEN e.event_type = 'open' THEN e.email END) as unique_opens,
    COUNT(CASE WHEN e.event_type = 'open' THEN 1 END) as total_opens,
    COUNT(DISTINCT CASE WHEN e.event_type = 'click' THEN e.email END) as unique_clicks,
    COUNT(CASE WHEN e.event_type = 'click' THEN 1 END) as total_clicks,
    COUNT(DISTINCT CASE WHEN e.event_type = 'unsubscribe' THEN e.email END) as unsubscribes,
    0::DECIMAL(5,2) as open_rate,  -- Calculated below
    0::DECIMAL(5,2) as click_rate,
    0::DECIMAL(5,2) as click_to_open_rate,
    0::DECIMAL(5,2) as bounce_rate,
    0::DECIMAL(5,2) as unsubscribe_rate
  FROM email_events e
  WHERE DATE(e.timestamp) = p_date
  GROUP BY DATE(e.timestamp), e.newsletter_id
  ON CONFLICT (date, newsletter_id) DO UPDATE SET
    emails_sent = EXCLUDED.emails_sent,
    emails_delivered = EXCLUDED.emails_delivered,
    emails_bounced = EXCLUDED.emails_bounced,
    unique_opens = EXCLUDED.unique_opens,
    total_opens = EXCLUDED.total_opens,
    unique_clicks = EXCLUDED.unique_clicks,
    total_clicks = EXCLUDED.total_clicks,
    unsubscribes = EXCLUDED.unsubscribes,
    updated_at = NOW();
  
  -- Update calculated rates
  UPDATE analytics_daily
  SET 
    open_rate = CASE 
      WHEN emails_delivered > 0 THEN ROUND((unique_opens::DECIMAL / emails_delivered) * 100, 2)
      ELSE 0 
    END,
    click_rate = CASE 
      WHEN emails_delivered > 0 THEN ROUND((unique_clicks::DECIMAL / emails_delivered) * 100, 2)
      ELSE 0 
    END,
    click_to_open_rate = CASE 
      WHEN unique_opens > 0 THEN ROUND((unique_clicks::DECIMAL / unique_opens) * 100, 2)
      ELSE 0 
    END,
    bounce_rate = CASE 
      WHEN emails_sent > 0 THEN ROUND((emails_bounced::DECIMAL / emails_sent) * 100, 2)
      ELSE 0 
    END,
    unsubscribe_rate = CASE 
      WHEN emails_delivered > 0 THEN ROUND((unsubscribes::DECIMAL / emails_delivered) * 100, 2)
      ELSE 0 
    END
  WHERE date = p_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS (Convenience)
-- ============================================

-- Latest newsletter performance summary
CREATE OR REPLACE VIEW newsletter_performance AS
SELECT 
  n.id,
  n.issue_number,
  n.type,
  n.subject,
  n.sent_at,
  COALESCE(a.emails_delivered, 0) as delivered,
  COALESCE(a.unique_opens, 0) as unique_opens,
  COALESCE(a.unique_clicks, 0) as unique_clicks,
  COALESCE(a.open_rate, 0) as open_rate,
  COALESCE(a.click_rate, 0) as click_rate,
  COALESCE(a.click_to_open_rate, 0) as click_to_open_rate,
  COALESCE(a.unsubscribes, 0) as unsubscribes,
  COALESCE(a.unsubscribe_rate, 0) as unsubscribe_rate
FROM newsletters n
LEFT JOIN analytics_daily a ON n.id = a.newsletter_id
ORDER BY n.sent_at DESC;

-- Last 30 days summary (for executive dashboard)
CREATE OR REPLACE VIEW dashboard_summary_30d AS
SELECT 
  COUNT(DISTINCT newsletter_id) as newsletters_sent,
  SUM(emails_delivered) as total_delivered,
  SUM(unique_opens) as total_opens,
  SUM(unique_clicks) as total_clicks,
  ROUND(AVG(open_rate), 2) as avg_open_rate,
  ROUND(AVG(click_rate), 2) as avg_click_rate,
  SUM(unsubscribes) as total_unsubscribes
FROM analytics_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE email_events IS 'Raw SendGrid webhook events for email analytics';
COMMENT ON TABLE newsletters IS 'Newsletter metadata and send records';
COMMENT ON TABLE analytics_daily IS 'Pre-aggregated daily email metrics for performance';
COMMENT ON TABLE utm_clicks IS 'Detailed UTM click tracking for conversion analysis';
COMMENT ON FUNCTION calculate_open_rate IS 'Calculate unique open rate for a newsletter';
COMMENT ON FUNCTION calculate_click_rate IS 'Calculate unique click rate for a newsletter';
COMMENT ON FUNCTION refresh_daily_analytics IS 'Aggregate email events into daily metrics (run after batch send)';
