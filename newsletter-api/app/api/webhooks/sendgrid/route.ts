import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * SendGrid Webhook Handler
 * POST /api/webhooks/sendgrid
 * 
 * Receives SendGrid event webhooks for:
 * - delivered: Email delivered to recipient
 * - open: Recipient opened email
 * - click: Recipient clicked a link
 * - bounce: Email bounced (hard/soft)
 * - dropped: Email dropped by SendGrid
 * - deferred: Email deferred
 * - processed: Email processed
 * - spamreport: Recipient marked as spam
 * - unsubscribe: Recipient unsubscribed via SendGrid
 * - group_unsubscribe: Unsubscribed from group
 * - group_resubscribe: Resubscribed to group
 * 
 * Best Practices:
 * - Verify webhook signature (in production)
 * - Process events asynchronously
 * - Handle duplicates (event_id)
 * - Update subscriber status on bounces
 */

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_event_id: string;
  sg_message_id: string;
  category?: string[];
  newsletter_id?: string;
  reason?: string; // bounce reason
  status?: string; // bounce status
  url?: string; // click URL
  useragent?: string;
  ip?: string;
  response?: string;
  asm_group_id?: number;
}

/**
 * Verify SendGrid webhook signature
 * https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
 */
function verifyWebhookSignature(payload: string, signature: string | null, timestamp: string | null): boolean {
  // In production, implement proper signature verification
  // Requires SENDGRID_WEBHOOK_PUBLIC_KEY env variable
  // For now, return true (implement before production)
  return true;
}

/**
 * Update email log status
 */
async function updateEmailLog(
  email: string,
  newsletterId: string,
  status: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // Update email_logs table
    const { error } = await supabaseAdmin
      .from('email_logs')
      .update({
        status,
        metadata: metadata || {},
        updated_at: new Date().toISOString(),
      })
      .eq('subscriber_email', email.toLowerCase())
      .eq('newsletter_id', newsletterId);

    if (error) {
      console.error('Failed to update email log:', error);
    }
  } catch (error) {
    console.error('Error updating email log:', error);
  }
}

/**
 * Handle bounce event
 * Update subscriber status to 'bounced'
 */
async function handleBounce(email: string, reason?: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({
        status: 'bounced',
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Failed to update subscriber bounce status:', error);
    } else {
      console.log(`[Webhook] Marked ${email} as bounced: ${reason}`);
    }
  } catch (error) {
    console.error('Error handling bounce:', error);
  }
}

/**
 * Handle spam report
 * Update subscriber status
 */
async function handleSpamReport(email: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Failed to update subscriber spam status:', error);
    } else {
      console.log(`[Webhook] Unsubscribed ${email} due to spam report`);
    }
  } catch (error) {
    console.error('Error handling spam report:', error);
  }
}

/**
 * POST handler - Receive SendGrid events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  
  try {
    // Get signature headers for verification
    const signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature');
    const timestamp = request.headers.get('X-Twilio-Email-Event-Webhook-Timestamp');

    // Parse webhook payload
    const payload = await request.text();
    const events: SendGridEvent[] = JSON.parse(payload);

    // Verify signature (in production)
    if (!verifyWebhookSignature(payload, signature, timestamp)) {
      console.error(`[${requestId}] Invalid webhook signature`);
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process events
    const processedEvents: string[] = [];
    const errors: string[] = [];

    for (const event of events) {
      try {
        const newsletterId = event.newsletter_id || 'unknown';
        
        switch (event.event) {
          case 'delivered':
            await updateEmailLog(event.email, newsletterId, 'delivered', {
              sg_event_id: event.sg_event_id,
              sg_message_id: event.sg_message_id,
              timestamp: event.timestamp,
            });
            processedEvents.push(`delivered:${event.email}`);
            break;

          case 'open':
            await updateEmailLog(event.email, newsletterId, 'opened', {
              sg_event_id: event.sg_event_id,
              timestamp: event.timestamp,
              useragent: event.useragent,
              ip: event.ip,
            });
            processedEvents.push(`open:${event.email}`);
            break;

          case 'click':
            await updateEmailLog(event.email, newsletterId, 'clicked', {
              sg_event_id: event.sg_event_id,
              timestamp: event.timestamp,
              url: event.url,
              useragent: event.useragent,
              ip: event.ip,
            });
            processedEvents.push(`click:${event.email}:${event.url}`);
            break;

          case 'bounce':
            await handleBounce(event.email, event.reason);
            await updateEmailLog(event.email, newsletterId, 'bounced', {
              sg_event_id: event.sg_event_id,
              reason: event.reason,
              status: event.status,
            });
            processedEvents.push(`bounce:${event.email}`);
            break;

          case 'dropped':
            await updateEmailLog(event.email, newsletterId, 'failed', {
              sg_event_id: event.sg_event_id,
              reason: event.reason,
            });
            processedEvents.push(`dropped:${event.email}`);
            break;

          case 'spamreport':
            await handleSpamReport(event.email);
            await updateEmailLog(event.email, newsletterId, 'spam_report', {
              sg_event_id: event.sg_event_id,
            });
            processedEvents.push(`spamreport:${event.email}`);
            break;

          case 'unsubscribe':
          case 'group_unsubscribe':
            // Already handled by our own unsubscribe system
            processedEvents.push(`unsubscribe:${event.email}`);
            break;

          case 'processed':
          case 'deferred':
            // Silent processing - no action needed
            processedEvents.push(`${event.event}:${event.email}`);
            break;

          default:
            console.log(`[${requestId}] Unknown event type: ${event.event}`);
            processedEvents.push(`unknown:${event.event}`);
        }
      } catch (eventError) {
        const errorMsg = eventError instanceof Error ? eventError.message : 'Unknown error';
        errors.push(`${event.email}:${event.event}:${errorMsg}`);
        console.error(`[${requestId}] Error processing event:`, eventError);
      }
    }

    // Log summary
    console.log(`[${requestId}] Webhook processed: ${processedEvents.length} events, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error(`[${requestId}] Webhook processing error:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Webhook verification/health check
 * Used by SendGrid to verify endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'sendgrid-webhook',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
