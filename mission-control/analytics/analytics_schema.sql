-- Marketing Analytics Database Schema
-- For Robotica Weekly Newsletter Dashboard
-- Created: 2026-02-03
-- Phase 2: Dashboard Data Layer

-- ============================================
-- TABLE: newsletter_metrics
-- Stores per-newsletter performance data
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    newsletter_id VARCHAR(50) NOT NULL UNIQUE,
    issue_number INTEGER NOT NULL,
    subject_line VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_complained INTEGER DEFAULT 0,
    
    -- Calculated rates (stored for performance)
    open_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_delivered > 0 
             THEN (total_opened::DECIMAL / total_delivered * 100) 
             ELSE 0 END
    ) STORED,
    click_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_delivered > 0 
             THEN (total_clicked::DECIMAL / total_delivered * 100) 
             ELSE 0 END
    ) STORED,
    bounce_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_sent > 0 
             THEN (total_bounced::DECIMAL / total_sent * 100) 
             ELSE 0 END
    ) STORED,
    unsubscribe_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_delivered > 0 
             THEN (total_unsubscribed::DECIMAL / total_delivered * 100) 
             ELSE 0 END
    ) STORED,
    
    -- Engagement score (0-100)
    engagement_score DECIMAL(5,2) GENERATED ALWAYS AS (
        (total_opened * 1.0 + total_clicked * 3.0) / NULLIF(total_delivered, 0) * 20
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for newsletter_metrics
CREATE INDEX idx_newsletter_metrics_issue ON newsletter_metrics(issue_number DESC);
CREATE INDEX idx_newsletter_metrics_sent ON newsletter_metrics(sent_at DESC);

-- ============================================
-- TABLE: link_performance
-- Tracks CTR per link/section in newsletter
-- ============================================
CREATE TABLE IF NOT EXISTS link_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    newsletter_id VARCHAR(50) REFERENCES newsletter_metrics(newsletter_id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    utm_content VARCHAR(100),
    section_name VARCHAR(100),
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for link_performance
CREATE INDEX idx_link_performance_newsletter ON link_performance(newsletter_id);
CREATE INDEX idx_link_performance_section ON link_performance(section_name);

-- ============================================
-- TABLE: subscriber_growth
-- Daily snapshot of subscriber counts
-- ============================================
CREATE TABLE IF NOT EXISTS subscriber_growth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_subscribers INTEGER DEFAULT 0,
    free_tier INTEGER DEFAULT 0,
    premium_tier INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    net_growth INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for subscriber_growth
CREATE INDEX idx_subscriber_growth_date ON subscriber_growth(date DESC);

-- ============================================
-- TABLE: ab_tests
-- A/B test configurations and results
-- ============================================
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- 'subject_line', 'cta_color', 'send_time', etc.
    newsletter_id VARCHAR(50) REFERENCES newsletter_metrics(newsletter_id),
    
    -- Test configuration
    variant_a_name VARCHAR(100) NOT NULL,
    variant_a_value TEXT NOT NULL,
    variant_b_name VARCHAR(100) NOT NULL,
    variant_b_value TEXT NOT NULL,
    
    -- Traffic split (default 50/50)
    variant_a_percentage INTEGER DEFAULT 50,
    variant_b_percentage INTEGER DEFAULT 50,
    
    -- Results
    variant_a_opens INTEGER DEFAULT 0,
    variant_a_clicks INTEGER DEFAULT 0,
    variant_b_opens INTEGER DEFAULT 0,
    variant_b_clicks INTEGER DEFAULT 0,
    
    -- Statistical analysis
    winner VARCHAR(10), -- 'A', 'B', or 'inconclusive'
    confidence_level DECIMAL(5,2), -- percentage
    lift_percentage DECIMAL(5,2), -- improvement percentage
    
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'cancelled'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ab_tests
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_newsletter ON ab_tests(newsletter_id);

-- ============================================
-- TABLE: email_events (from SendGrid webhook)
-- Raw event data for detailed analysis
-- ============================================
CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'delivered', 'open', 'click', 'bounce', 'unsubscribe', etc.
    email VARCHAR(255) NOT NULL,
    newsletter_id VARCHAR(50),
    subscriber_tier VARCHAR(20), -- 'free', 'premium'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    url_clicked TEXT, -- for click events
    reason TEXT, -- for bounce/spam events
    sg_event_id VARCHAR(100),
    sg_message_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email_events
CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_email_events_newsletter ON email_events(newsletter_id);
CREATE INDEX idx_email_events_timestamp ON email_events(timestamp DESC);
CREATE INDEX idx_email_events_email ON email_events(email);

-- ============================================
-- VIEWS: Pre-aggregated metrics
-- ============================================

-- Daily performance summary
CREATE OR REPLACE VIEW daily_performance AS
SELECT 
    date_trunc('day', sent_at)::date as date,
    COUNT(*) as newsletters_sent,
    SUM(total_sent) as total_sent,
    SUM(total_delivered) as total_delivered,
    SUM(total_opened) as total_opened,
    SUM(total_clicked) as total_clicked,
    AVG(open_rate) as avg_open_rate,
    AVG(click_rate) as avg_click_rate
FROM newsletter_metrics
WHERE sent_at IS NOT NULL
GROUP BY date_trunc('day', sent_at)::date
ORDER BY date DESC;

-- Top performing content
CREATE OR REPLACE VIEW top_performing_content AS
SELECT 
    lp.newsletter_id,
    nm.subject_line,
    lp.section_name,
    lp.utm_content,
    lp.clicks,
    lp.unique_clicks,
    ROUND(lp.clicks::DECIMAL / NULLIF(nm.total_delivered, 0) * 100, 2) as ctr_percentage
FROM link_performance lp
JOIN newsletter_metrics nm ON lp.newsletter_id = nm.newsletter_id
ORDER BY lp.clicks DESC;

-- ============================================
-- FUNCTIONS: Analytics helpers
-- ============================================

-- Calculate growth rate between two periods
CREATE OR REPLACE FUNCTION calculate_growth_rate(
    start_date DATE,
    end_date DATE
) RETURNS TABLE (
    metric_name TEXT,
    start_value DECIMAL,
    end_value DECIMAL,
    growth_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH start_metrics AS (
        SELECT 
            COALESCE(SUM(new_subscribers), 0) as new_subs,
            COALESCE(AVG(total_subscribers), 0) as total_subs
        FROM subscriber_growth
        WHERE date = start_date
    ),
    end_metrics AS (
        SELECT 
            COALESCE(SUM(new_subscribers), 0) as new_subs,
            COALESCE(AVG(total_subscribers), 0) as total_subs
        FROM subscriber_growth
        WHERE date = end_date
    )
    SELECT 
        'new_subscribers'::TEXT,
        s.new_subs,
        e.new_subs,
        CASE WHEN s.new_subs > 0 
             THEN ((e.new_subs - s.new_subs) / s.new_subs * 100)
             ELSE 0 END
    FROM start_metrics s, end_metrics e
    
    UNION ALL
    
    SELECT 
        'total_subscribers'::TEXT,
        s.total_subs,
        e.total_subs,
        CASE WHEN s.total_subs > 0 
             THEN ((e.total_subs - s.total_subs) / s.total_subs * 100)
             ELSE 0 END
    FROM start_metrics s, end_metrics e;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_newsletter_metrics_updated_at
    BEFORE UPDATE ON newsletter_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_performance_updated_at
    BEFORE UPDATE ON link_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE newsletter_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for API)
CREATE POLICY service_role_all_newsletter_metrics ON newsletter_metrics
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_link_performance ON link_performance
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_subscriber_growth ON subscriber_growth
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_ab_tests ON ab_tests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_email_events ON email_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample newsletter data
INSERT INTO newsletter_metrics (
    newsletter_id, issue_number, subject_line, sent_at,
    total_sent, total_delivered, total_opened, total_clicked,
    total_bounced, total_unsubscribed
) VALUES 
('newsletter_001', 1, 'La Physical AI è arrivata 🚀', '2026-02-03 08:00:00+00',
 1247, 1221, 528, 112, 26, 3),
('newsletter_002', 2, 'NVIDIA s "ChatGPT Moment" per i Robot 🚀', '2026-02-05 08:00:00+00',
 1396, 1368, 590, 156, 28, 2)
ON CONFLICT (newsletter_id) DO NOTHING;

-- Insert sample subscriber growth data
INSERT INTO subscriber_growth (
    date, total_subscribers, free_tier, premium_tier,
    new_subscribers, unsubscribes, net_growth
) VALUES 
('2026-02-01', 1100, 1000, 100, 50, 5, 45),
('2026-02-02', 1180, 1070, 110, 80, 8, 72),
('2026-02-03', 1247, 1122, 125, 67, 6, 61),
('2026-02-04', 1320, 1180, 140, 73, 5, 68),
('2026-02-05', 1396, 1246, 150, 76, 4, 72)
ON CONFLICT (date) DO NOTHING;

-- Insert sample link performance data
INSERT INTO link_performance (
    newsletter_id, link_url, utm_content, section_name, clicks, unique_clicks
) VALUES 
('newsletter_001', 'https://roboticaweekly.com/article/figure-ai-1b', 'deal', 'Deal of the Week', 45, 38),
('newsletter_001', 'https://roboticaweekly.com/article/physical-ai-trend', 'trend', 'Trend of the Day', 52, 45),
('newsletter_001', 'https://roboticaweekly.com/subscribe-premium', 'cta_primary', 'CTA Button', 28, 25),
('newsletter_002', 'https://roboticaweekly.com/article/nvidia-physical-ai', 'trend', 'Trend of the Day', 68, 58),
('newsletter_002', 'https://roboticaweekly.com/article/figure-vs-tesla', 'deal', 'Deal of the Week', 55, 48)
ON CONFLICT DO NOTHING;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Get latest newsletter performance
-- SELECT * FROM newsletter_metrics ORDER BY sent_at DESC LIMIT 1;

-- Get top performing links
-- SELECT * FROM top_performing_content LIMIT 10;

-- Get daily growth stats
-- SELECT * FROM daily_performance LIMIT 30;

-- Calculate growth rate
-- SELECT * FROM calculate_growth_rate('2026-02-01', '2026-02-05');

-- ============================================
-- END OF SCHEMA
-- ============================================
