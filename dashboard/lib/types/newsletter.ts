/**
 * Newsletter API Types
 * Central type definitions for the newsletter automation system
 */

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Newsletter types
export interface Newsletter {
  id: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  status: NewsletterStatus;
  tier: SubscriberTier;
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: NewsletterMetadata;
  stats?: NewsletterStats;
}

export type NewsletterStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type SubscriberTier = 'free' | 'premium' | 'all';

export interface NewsletterMetadata {
  newsletterId?: string;
  edition?: string;
  tags?: string[];
  author?: string;
}

export interface NewsletterStats {
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

// Subscriber types
export interface Subscriber {
  id: string;
  email: string;
  tier: 'free' | 'premium';
  status: SubscriberStatus;
  source?: string;
  tags?: string[];
  subscribedAt: string;
  unsubscribedAt?: string;
  lastEngagedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'complained';

// SendGrid types
export interface SendGridMessage {
  to: string | { email: string; name?: string }[];
  from: { email: string; name?: string };
  subject: string;
  html?: string;
  text?: string;
  categories?: string[];
  customArgs?: Record<string, string>;
  sendAt?: number;
}

export interface SendGridResponse {
  id?: string;
  message?: string;
}

export interface SendGridError {
  message: string;
  field?: string;
  help?: string;
}

// Webhook event types
export type WebhookEventType = 
  | 'processed'
  | 'delivered'
  | 'open'
  | 'click'
  | 'bounce'
  | 'dropped'
  | 'deferred'
  | 'spamreport'
  | 'unsubscribe'
  | 'group_unsubscribe'
  | 'group_resubscribe';

export interface WebhookEvent {
  event: WebhookEventType;
  email: string;
  timestamp: number;
  'smtp-id'?: string;
  category?: string[];
  sg_event_id: string;
  sg_message_id: string;
  reason?: string;
  response?: string;
  url?: string;
  asm_group_id?: number;
  useragent?: string;
  ip?: string;
}

// Batch operation types
export interface BatchOperation {
  id: string;
  type: 'send' | 'import' | 'export';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors: BatchError[];
  createdAt: string;
  completedAt?: string;
}

export interface BatchError {
  index: number;
  email?: string;
  error: string;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}

// Auth types
export interface AuthContext {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}
