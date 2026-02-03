/**
 * Supabase Database Types for Robotica Weekly
 * 
 * Tables:
 * - subscribers: Newsletter subscribers with segmentation
 * - newsletter_campaigns: Campaign tracking
 * - email_logs: Delivery tracking
 * - api_keys: For external integrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      subscribers: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          segment: 'free' | 'premium' | 'admin';
          status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
          source: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          unsubscribed_at: string | null;
          last_sent_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          segment?: 'free' | 'premium' | 'admin';
          status?: 'active' | 'unsubscribed' | 'bounced' | 'complained';
          source?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          unsubscribed_at?: string | null;
          last_sent_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          segment?: 'free' | 'premium' | 'admin';
          status?: 'active' | 'unsubscribed' | 'bounced' | 'complained';
          source?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          unsubscribed_at?: string | null;
          last_sent_at?: string | null;
        };
      };
      newsletter_campaigns: {
        Row: {
          id: string;
          name: string;
          subject: string;
          content_html: string;
          content_text: string | null;
          segment: 'free' | 'premium' | 'all';
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
          scheduled_at: string | null;
          sent_at: string | null;
          sent_count: number;
          open_count: number;
          click_count: number;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          content_html: string;
          content_text?: string | null;
          segment?: 'free' | 'premium' | 'all';
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number;
          open_count?: number;
          click_count?: number;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          content_html?: string;
          content_text?: string | null;
          segment?: 'free' | 'premium' | 'all';
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number;
          open_count?: number;
          click_count?: number;
          created_at?: string;
          created_by?: string | null;
        };
      };
      email_logs: {
        Row: {
          id: string;
          campaign_id: string | null;
          subscriber_id: string;
          email: string;
          status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'failed';
          provider_message_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id?: string | null;
          subscriber_id: string;
          email: string;
          status?: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'failed';
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string | null;
          subscriber_id?: string;
          email?: string;
          status?: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'failed';
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          name: string;
          key_hash: string;
          permissions: string[];
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          key_hash: string;
          permissions?: string[];
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          key_hash?: string;
          permissions?: string[];
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          created_by?: string | null;
        };
      };
    };
    Views: {
      subscriber_stats: {
        Row: {
          segment: string;
          status: string;
          count: number;
        };
      };
      campaign_stats: {
        Row: {
          campaign_id: string;
          campaign_name: string;
          total_sent: number;
          total_delivered: number;
          total_opened: number;
          total_clicked: number;
          open_rate: number;
          click_rate: number;
        };
      };
    };
    Functions: {
      increment_campaign_sent: {
        Args: { campaign_id: string };
        Returns: void;
      };
    };
  };
}

// Helper types
export type Subscriber = Database['public']['Tables']['subscribers']['Row'];
export type SubscriberInsert = Database['public']['Tables']['subscribers']['Insert'];
export type NewsletterCampaign = Database['public']['Tables']['newsletter_campaigns']['Row'];
export type EmailLog = Database['public']['Tables']['email_logs']['Row'];
export type ApiKey = Database['public']['Tables']['api_keys']['Row'];

export type SubscriberSegment = 'free' | 'premium' | 'admin';
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'complained';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
export type EmailStatus = 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'failed';
