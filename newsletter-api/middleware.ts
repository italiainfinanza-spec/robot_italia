import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS Configuration
 * Modify allowed origins based on your deployment
 */
const ALLOWED_ORIGINS = [
  'https://roboticaweekly.com',
  'https://www.roboticaweekly.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * Security Headers
 * Best practices from OWASP and Vercel
 */
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

/**
 * Simple in-memory rate limiting
 * In production, use Redis or similar
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 100; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Check if request is rate limited
 */
function isRateLimited(clientId: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { limited: true, remaining: 0 };
  }

  entry.count++;
  return { limited: false, remaining: RATE_LIMIT_MAX - entry.count };
}

/**
 * Get client ID for rate limiting (IP + path)
 */
function getClientId(request: NextRequest): string {
  const ip = request.ip || 'unknown';
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

/**
 * Generate request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware - Runs on all API routes
 * Handles CORS, rate limiting, security headers, and request logging
 */
export function middleware(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Get origin
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  // Rate limiting (skip for health checks)
  if (!request.nextUrl.pathname.includes('/health')) {
    const clientId = getClientId(request);
    const { limited, remaining } = isRateLimited(clientId);

    if (limited) {
      console.warn(`[${requestId}] Rate limit exceeded for ${clientId}`);
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + RATE_LIMIT_WINDOW),
          }
        }
      );
    }

    // Store rate limit info for response headers
    request.headers.set('x-rate-limit-remaining', String(remaining));
  }

  // Add request ID for tracing
  request.headers.set('x-request-id', requestId);

  // Log request
  console.log(`[${requestId}] ${request.method} ${request.nextUrl.pathname} - ${origin || 'no-origin'}`);

  // Create response
  const response = NextResponse.next();

  // Add CORS headers
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add rate limit headers
  const remaining = request.headers.get('x-rate-limit-remaining');
  if (remaining) {
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    response.headers.set('X-RateLimit-Remaining', remaining);
  }

  // Add request ID header
  response.headers.set('X-Request-ID', requestId);

  // Log response time
  const duration = Date.now() - startTime;
  console.log(`[${requestId}] Response time: ${duration}ms`);

  return response;
}

/**
 * Middleware configuration
 * Only run on API routes
 */
export const config = {
  matcher: ['/api/:path*'],
};
