import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriberStatus, getSubscriberByEmail } from '@/lib/supabase';

/**
 * Unsubscribe API Route
 * GET /api/unsubscribe?email=user@example.com - Unsubscribe via link
 *
 * Used for unsubscribe links in emails
 * Redirects to confirmation page
 */

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      // Redirect to error page
      return NextResponse.redirect(
        `${process.env.APP_URL}/unsubscribe?error=missing_email`
      );
    }

    // Check if subscriber exists
    const { data: subscriber } = await getSubscriberByEmail(email);

    if (!subscriber) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/unsubscribe?error=not_found`
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(
        `${process.env.APP_URL}/unsubscribe?status=already_unsubscribed`
      );
    }

    // Update status to unsubscribed
    const { success, error } = await updateSubscriberStatus(email, 'unsubscribed');

    if (error || !success) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/unsubscribe?error=failed`
      );
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.APP_URL}/unsubscribe?status=success`
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(
      `${process.env.APP_URL}/unsubscribe?error=unknown`
    );
  }
}
