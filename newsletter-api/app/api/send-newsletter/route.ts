import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendBulkEmails, isValidEmail } from '@/lib/sendgrid';
import {
  getSubscribersByTier,
  recordEmailSent,
  Subscriber,
} from '@/lib/supabase';

/**
 * Newsletter Send API Route
 * POST /api/send-newsletter
 *
 * Best Practices Applied:
 * - Input validation with Zod
 * - Tier-based segmentation (free/premium)
 * - Batch processing with rate limiting
 * - Comprehensive error handling
 * - Detailed logging for monitoring
 */

// Request validation schema
const sendNewsletterSchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
  tier: z.enum(['free', 'premium', 'all']).default('all'),
  testMode: z.boolean().default(false),
  testEmail: z.string().email().optional(),
  newsletterId: z.string().min(1),
  fromName: z.string().optional(),
});

type SendNewsletterRequest = z.infer<typeof sendNewsletterSchema>;

// Response types
interface SendNewsletterSuccessResponse {
  success: boolean;
  message: string;
  stats?: {
    totalRecipients: number;
    sent: number;
    failed: number;
    testMode: boolean;
  };
  errors?: Array<{ email: string; error: string }>;
}

interface SendNewsletterErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ email: string; error: string }>;
}

/**
 * POST handler - Send newsletter to subscribers
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SendNewsletterSuccessResponse | SendNewsletterErrorResponse>> {
  try {
    // 1. Validate API key (simple bearer token auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Missing API key' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = sendNewsletterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors.map((e) => ({
            email: e.path.join('.'),
            error: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      subject,
      html,
      text,
      tier,
      testMode,
      testEmail,
      newsletterId,
      fromName,
    } = validationResult.data;

    // 3. Handle test mode (send to single email)
    if (testMode) {
      if (!testEmail || !isValidEmail(testEmail)) {
        return NextResponse.json(
          { success: false, message: 'Test mode requires valid testEmail' },
          { status: 400 }
        );
      }

      const { sendEmail } = await import('@/lib/sendgrid');
      const result = await sendEmail({
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html,
        text,
        from: fromName
          ? { email: process.env.FROM_EMAIL || 'noreply@roboticaweekly.com', name: fromName }
          : undefined,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: `Test send failed: ${result.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        stats: {
          totalRecipients: 1,
          sent: 1,
          failed: 0,
          testMode: true,
        },
      });
    }

    // 4. Get subscribers from database
    const { data: subscribers, error: dbError } = await getSubscribersByTier(tier);

    if (dbError) {
      console.error('Database error fetching subscribers:', dbError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active subscribers found' },
        { status: 404 }
      );
    }

    // 5. Prepare recipient list
    const recipients = subscribers.map((sub: Subscriber) => ({
      email: sub.email,
      name: sub.name || undefined,
      substitutions: {
        '{{name}}': sub.name || 'Subscriber',
        '{{email}}': sub.email,
        '{{unsubscribe_url}}': `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(sub.email)}`,
      },
    }));

    // 6. Send bulk emails
    const result = await sendBulkEmails({
      to: recipients,
      subject,
      html,
      text,
      batchSize: 500, // SendGrid recommended batch size
      from: fromName
        ? { email: process.env.FROM_EMAIL || 'noreply@roboticaweekly.com', name: fromName }
        : undefined,
    });

    // 7. Record successful sends in database
    if (result.sent > 0) {
      const recordPromises = subscribers
        .filter((_, index) => !result.errors.some((e) => e.email === recipients[index]?.email))
        .map((sub) => recordEmailSent(sub.email, newsletterId));

      await Promise.allSettled(recordPromises);
    }

    // 8. Return response
    return NextResponse.json({
      success: result.failed === 0,
      message: result.failed === 0
        ? `Newsletter sent successfully to ${result.sent} subscribers`
        : `Newsletter sent with ${result.failed} failures`,
      stats: {
        totalRecipients: recipients.length,
        sent: result.sent,
        failed: result.failed,
        testMode: false,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
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
 * GET handler - Get send status/info (health check)
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'newsletter-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
