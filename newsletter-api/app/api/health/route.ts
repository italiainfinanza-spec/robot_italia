import { NextResponse } from 'next/server';

/**
 * Health Check API Route
 * GET /api/health
 *
 * Returns service status and version information.
 * Used by monitoring tools and load balancers.
 */

export async function GET(): Promise<NextResponse> {
  const health = {
    status: 'healthy',
    service: 'newsletter-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      sendgrid: !!process.env.SENDGRID_API_KEY,
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      apiKey: !!process.env.API_KEY,
    },
  };

  // Determine HTTP status based on critical dependencies
  const hasCriticalDeps = health.checks.sendgrid && health.checks.supabase && health.checks.apiKey;
  const statusCode = hasCriticalDeps ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}