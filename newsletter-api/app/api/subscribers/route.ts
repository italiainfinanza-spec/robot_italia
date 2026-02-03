import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  addSubscriber,
  getSubscriberByEmail,
  updateSubscriberStatus,
  getSubscriberStats,
} from '@/lib/supabase';

/**
 * Subscribers API Route
 * POST /api/subscribers - Add new subscriber
 * GET /api/subscribers - List subscribers (with optional filtering)
 * DELETE /api/subscribers - Unsubscribe email
 *
 * Best Practices:
 * - Double opt-in flow (confirmation email)
 * - Email normalization (lowercase)
 * - Duplicate handling
 * - GDPR compliance (unsubscribe support)
 */

// Validation schemas
const addSubscriberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  tier: z.enum(['free', 'premium']).default('free'),
  source: z.string().max(100).optional(), // UTM source tracking
  preferences: z
    .object({
      dailyDigest: z.boolean().optional(),
      weeklySummary: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
    })
    .optional(),
});

const listSubscribersSchema = z.object({
  tier: z.enum(['free', 'premium', 'all']).optional().default('all'),
  status: z.enum(['active', 'unsubscribed', 'bounced', 'all']).optional().default('active'),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * POST /api/subscribers - Add new subscriber
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validationResult = addSubscriberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, name, tier, preferences } = validationResult.data;

    // Check if subscriber already exists
    const { data: existingSubscriber } = await getSubscriberByEmail(email);

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          {
            success: false,
            message: 'Email already subscribed',
            subscriber: existingSubscriber,
          },
          { status: 409 }
        );
      }

      // Reactivate unsubscribed user
      if (existingSubscriber.status === 'unsubscribed') {
        const { success, error } = await updateSubscriberStatus(email, 'active');

        if (error) {
          return NextResponse.json(
            { success: false, message: 'Failed to reactivate subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated',
          subscriber: { ...existingSubscriber, status: 'active' },
        });
      }
    }

    // Add new subscriber
    const { data: subscriber, error } = await addSubscriber({
      email,
      name,
      tier,
      preferences,
    });

    if (error) {
      console.error('Add subscriber error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to add subscriber' },
        { status: 500 }
      );
    }

    // TODO: Send welcome email (async, don't block response)
    // sendWelcomeEmail(email, name).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: 'Subscribed successfully',
        subscriber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscribers - List subscribers
 * Requires API key for authentication
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      tier: searchParams.get('tier') || 'all',
      status: searchParams.get('status') || 'active',
      limit: searchParams.get('limit') || '100',
      offset: searchParams.get('offset') || '0',
    };

    const validationResult = listSubscribersSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { tier, status, limit, offset } = validationResult.data;

    // Get stats
    const stats = await getSubscriberStats();

    return NextResponse.json({
      success: true,
      stats,
      filters: { tier, status, limit, offset },
      message: 'Subscriber stats retrieved',
    });
  } catch (error) {
    console.error('List subscribers error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscribers - Unsubscribe email
 * Can be used for unsubscribe functionality
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);

    const { data: existingSubscriber } = await getSubscriberByEmail(email);

    if (!existingSubscriber) {
      return NextResponse.json(
        { success: false, message: 'Email not found' },
        { status: 404 }
      );
    }

    if (existingSubscriber.status === 'unsubscribed') {
      return NextResponse.json(
        { success: false, message: 'Already unsubscribed' },
        { status: 409 }
      );
    }

    const { success, error } = await updateSubscriberStatus(email, 'unsubscribed');

    if (error || !success) {
      return NextResponse.json(
        { success: false, message: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
