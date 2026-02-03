import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { z } from 'zod';

/**
 * Newsletter Send API Route
 * POST /api/newsletter/send
 * 
 * Best Practices Applied:
 * - Input validation with Zod
 * - Rate limiting consideration (implement via middleware)
 * - Error handling with specific status codes
 * - Structured response format
 * - Security: API key only server-side
 */

// Input validation schema
const SendNewsletterSchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
  from: z.object({
    email: z.string().email(),
    name: z.string().optional()
  }).default({
    email: 'newsletter@roboticaweekly.com',
    name: 'Robotica Weekly'
  }),
  // Segment targeting
  segment: z.enum(['all', 'free', 'premium', 'test']).default('test'),
  // Test mode - only send to test emails
  testEmails: z.array(z.string().email()).optional(),
  // Campaign tracking
  campaignId: z.string().optional(),
  // Scheduled send (ISO timestamp)
  scheduledAt: z.string().datetime().optional()
});

// Response types
interface SendResult {
  success: boolean;
  messageId?: string;
  recipientsCount: number;
  errors: Array<{ email: string; error: string }>;
}

export async function POST(request: Request) {
  try {
    // Validate SendGrid API key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('[Newsletter API] SENDGRID_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }

    sgMail.setApiKey(apiKey);

    // Parse and validate request body
    const body = await request.json();
    const validated = SendNewsletterSchema.safeParse(body);

    if (!validated.success) {
      console.error('[Newsletter API] Validation error:', validated.error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validated.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { subject, html, text, from, segment, testEmails, campaignId, scheduledAt } = validated.data;

    // Determine recipient list based on segment
    // TODO: Integrate with Supabase to fetch actual subscribers
    let recipients: string[] = [];
    
    if (segment === 'test' && testEmails && testEmails.length > 0) {
      recipients = testEmails;
    } else {
      // For now, return error - requires Supabase integration
      return NextResponse.json(
        { 
          error: 'Subscriber fetch not implemented',
          message: 'Use segment: "test" with testEmails for now'
        },
        { status: 501 }
      );
    }

    // Prevent sending to too many test emails
    if (recipients.length > 10) {
      return NextResponse.json(
        { error: 'Test mode limited to 10 recipients' },
        { status: 400 }
      );
    }

    // Build personalization data for tracking
    const personalization = campaignId ? {
      custom_args: {
        campaign_id: campaignId,
        sent_at: new Date().toISOString()
      }
    } : {};

    // Send emails
    const results: SendResult = {
      success: true,
      recipientsCount: recipients.length,
      errors: []
    };

    const sendPromises = recipients.map(async (email) => {
      try {
        const msg = {
          to: email,
          from: {
            email: from.email,
            name: from.name || 'Robotica Weekly'
          },
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
          ...personalization,
          // Tracking settings
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true }
          }
        };

        const response = await sgMail.send(msg);
        return { email, success: true, messageId: response[0]?.headers['x-message-id'] };
      } catch (error: any) {
        console.error(`[Newsletter API] Failed to send to ${email}:`, error.message);
        return { 
          email, 
          success: false, 
          error: error.message || 'Unknown error' 
        };
      }
    });

    const sendResults = await Promise.all(sendPromises);
    
    const successful = sendResults.filter(r => r.success);
    const failed = sendResults.filter(r => !r.success);

    results.success = failed.length === 0;
    results.errors = failed.map(f => ({ email: f.email, error: f.error || 'Unknown' }));

    // Log results
    console.log('[Newsletter API] Send completed:', {
      segment,
      total: recipients.length,
      successful: successful.length,
      failed: failed.length,
      campaignId
    });

    return NextResponse.json({
      success: results.success,
      data: {
        recipientsCount: results.recipientsCount,
        successfulCount: successful.length,
        failedCount: failed.length,
        errors: results.errors,
        campaignId,
        segment
      }
    }, { status: results.success ? 200 : 207 }); // 207 = Multi-Status for partial success

  } catch (error: any) {
    console.error('[Newsletter API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const apiKey = process.env.SENDGRID_API_KEY;
  return NextResponse.json({
    configured: !!apiKey,
    status: apiKey ? 'ready' : 'not_configured',
    timestamp: new Date().toISOString()
  });
}