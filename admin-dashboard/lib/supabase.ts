import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * Supabase Client Configuration
 * 
 * Best Practices:
 * - Use Service Role Key only in server-side API routes
 * - Never expose service key to client
 * - RLS policies protect data at database level
 * - Type-safe queries with generated types
 */

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase] Missing environment variables. Subscriber features disabled.');
}

// Create server-side client (service role for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create client-side config (anon key for browser)
export const supabaseConfig = {
  url: supabaseUrl || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

/**
 * Database Schema Types
 * Based on TASK-013: Subscriber Management System
 */

// Subscription tiers
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial';

// Subscriber entity
export interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  source: string | null; // Where they signed up from
  tags: string[]; // For segmentation
  metadata: Record<string, any>; // Flexible JSON
  confirmedAt: string | null; // Double opt-in
  subscribedAt: string;
  unsubscribedAt: string | null;
  updatedAt: string;
}

// Email campaign entity
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  segment: SubscriptionTier | 'all';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  createdBy: string | null;
}

// Email event tracking
export interface EmailEvent {
  id: string;
  subscriberId: string;
  campaignId: string;
  eventType: 'sent' | 'delivered' | 'open' | 'click' | 'bounce' | 'spam' | 'unsubscribe';
  metadata: Record<string, any>;
  createdAt: string;
}

/**
 * Validation Schemas
 * For input validation using Zod
 */

export const SubscriberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  tier: z.enum(['free', 'premium']).default('free'),
  source: z.string().max(100).optional(),
  tags: z.array(z.string()).default([])
});

export const CampaignSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  segment: z.enum(['all', 'free', 'premium']).default('all')
});

/**
 * SQL Schema for Supabase
 * Run this in Supabase SQL Editor to create tables
 */
export const SQL_SCHEMA = `
-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'trial')),
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  confirmed_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns table
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  segment TEXT DEFAULT 'all' CHECK (segment IN ('all', 'free', 'premium')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Email events table
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'open', 'click', 'bounce', 'spam', 'unsubscribe')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscribers
-- Only admins can read all subscribers
CREATE POLICY "Admins can manage subscribers" ON subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can only see their own subscriber record
CREATE POLICY "Users can view own subscriber record" ON subscribers
  FOR SELECT USING (email = auth.email());

-- RLS Policies for campaigns (admin only)
CREATE POLICY "Admins can manage campaigns" ON email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for events (admin only)
CREATE POLICY "Admins can view events" ON email_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_tier ON subscribers(tier);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_events_campaign ON email_events(campaign_id);
CREATE INDEX idx_events_subscriber ON email_events(subscriber_id);
CREATE INDEX idx_events_type ON email_events(event_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscribers_updated_at 
  BEFORE UPDATE ON subscribers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * Helper functions for subscriber operations
 */

export async function getSubscribers(
  tier?: SubscriptionTier,
  status: SubscriptionStatus = 'active',
  limit: number = 100,
  offset: number = 0
) {
  let query = supabaseAdmin
    .from('subscribers')
    .select('*')
    .eq('status', status)
    .order('subscribed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tier) {
    query = query.eq('tier', tier);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('[Supabase] Error fetching subscribers:', error);
    throw error;
  }

  return data as Subscriber[];
}

export async function getSubscriberCount(
  tier?: SubscriptionTier,
  status: SubscriptionStatus = 'active'
) {
  let query = supabaseAdmin
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);

  if (tier) {
    query = query.eq('tier', tier);
  }

  const { count, error } = await query;
  
  if (error) {
    console.error('[Supabase] Error counting subscribers:', error);
    throw error;
  }

  return count || 0;
}

export async function createSubscriber(data: z.infer<typeof SubscriberSchema>) {
  const validated = SubscriberSchema.parse(data);
  
  const { data: subscriber, error } = await supabaseAdmin
    .from('subscribers')
    .insert({
      email: validated.email,
      first_name: validated.firstName,
      last_name: validated.lastName,
      tier: validated.tier,
      source: validated.source,
      tags: validated.tags
    })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating subscriber:', error);
    throw error;
  }

  return subscriber as Subscriber;
}