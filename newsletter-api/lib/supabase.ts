import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Supabase environment variables not set. Database operations will fail.');
}

/**
 * Initialize Supabase admin client
 * Uses service role key for admin operations (bypasses RLS)
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Subscriber type definition
 */
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  tier: 'free' | 'premium';
  status: 'active' | 'unsubscribed' | 'bounced';
  preferences?: {
    dailyDigest?: boolean;
    weeklySummary?: boolean;
    marketingEmails?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastEmailSentAt?: string;
  emailCount: number;
}

/**
 * Get all active subscribers by tier
 */
export async function getSubscribersByTier(
  tier: 'free' | 'premium' | 'all' = 'all'
): Promise<{ data: Subscriber[] | null; error: Error | null }> {
  try {
    let query = supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('status', 'active');

    if (tier !== 'all') {
      query = query.eq('tier', tier);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return { data: data as Subscriber[], error: null };
  } catch (error) {
    console.error('Supabase getSubscribers error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get subscriber by email
 */
export async function getSubscriberByEmail(
  email: string
): Promise<{ data: Subscriber | null; error: Error | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return { data: data as Subscriber | null, error: null };
  } catch (error) {
    console.error('Supabase getSubscriberByEmail error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Add a new subscriber
 */
export async function addSubscriber(subscriber: {
  email: string;
  name?: string;
  tier?: 'free' | 'premium';
  preferences?: Subscriber['preferences'];
}): Promise<{ data: Subscriber | null; error: Error | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email: subscriber.email.toLowerCase(),
        name: subscriber.name,
        tier: subscriber.tier || 'free',
        status: 'active',
        preferences: subscriber.preferences || {
          dailyDigest: true,
          weeklySummary: true,
          marketingEmails: true,
        },
        emailCount: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Subscriber, error: null };
  } catch (error) {
    console.error('Supabase addSubscriber error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update subscriber status (unsubscribe, bounce, etc.)
 */
export async function updateSubscriberStatus(
  email: string,
  status: Subscriber['status']
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('email', email.toLowerCase());

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Supabase updateSubscriberStatus error:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Record email sent to subscriber
 */
export async function recordEmailSent(
  email: string,
  newsletterId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({
        lastEmailSentAt: new Date().toISOString(),
        emailCount: supabaseAdmin.rpc('increment_email_count', { row_email: email }),
      })
      .eq('email', email.toLowerCase());

    if (error) {
      // Fallback if RPC doesn't exist
      const { error: updateError } = await supabaseAdmin
        .from('subscribers')
        .update({
          lastEmailSentAt: new Date().toISOString(),
        })
        .eq('email', email.toLowerCase());

      if (updateError) throw updateError;
    }

    // Also record in email_logs table
    await supabaseAdmin.from('email_logs').insert({
      subscriberEmail: email.toLowerCase(),
      newsletterId,
      sentAt: new Date().toISOString(),
      status: 'sent',
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Supabase recordEmailSent error:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Get subscriber statistics
 */
export async function getSubscriberStats(): Promise<{
  total: number;
  active: number;
  free: number;
  premium: number;
  unsubscribed: number;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .select('status, tier');

    if (error) throw error;

    const stats = (data || []).reduce(
      (acc, sub) => {
        acc.total++;
        if (sub.status === 'active') acc.active++;
        if (sub.status === 'unsubscribed') acc.unsubscribed++;
        if (sub.tier === 'free') acc.free++;
        if (sub.tier === 'premium') acc.premium++;
        return acc;
      },
      { total: 0, active: 0, free: 0, premium: 0, unsubscribed: 0 }
    );

    return { ...stats, error: null };
  } catch (error) {
    console.error('Supabase getSubscriberStats error:', error);
    return { total: 0, active: 0, free: 0, premium: 0, unsubscribed: 0, error: error as Error };
  }
}

/**
 * SQL to create subscribers table (run this in Supabase SQL editor)
 */
export const CREATE_SUBSCRIBERS_TABLE_SQL = `
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

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Create index on email for fast lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_tier ON subscribers(tier);
`;

/**
 * SQL to create email_logs table
 */
export const CREATE_EMAIL_LOGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  metadata JSONB
);

-- Create indexes
CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_email);
CREATE INDEX idx_email_logs_newsletter ON email_logs(newsletter_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
`;
