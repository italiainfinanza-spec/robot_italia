# Newsletter API

API service for Robotica Weekly newsletter automation with SendGrid integration and Supabase subscriber management.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Email:** SendGrid
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod

## Features

- ✅ Send newsletters to segmented subscribers (free/premium/all)
- ✅ Bulk email sending with rate limiting (500/batch)
- ✅ Test mode for single-email testing
- ✅ Subscriber management (add, list, unsubscribe)
- ✅ GDPR-compliant unsubscribe flow
- ✅ Email logging and analytics
- ✅ Bearer token authentication

## Environment Variables

Create a `.env.local` file:

```env
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@roboticaweekly.com
FROM_NAME=Robotica Weekly
REPLY_TO_EMAIL=hello@roboticaweekly.com

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API Security
API_KEY=your-secure-api-key-min-32-chars

# App
APP_URL=https://roboticaweekly.com
```

## API Endpoints

### POST /api/send-newsletter

Send a newsletter to subscribers.

**Headers:**
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**Body:**
```json
{
  "subject": "Your Newsletter Subject",
  "html": "<html>...</html>",
  "text": "Plain text version (optional)",
  "tier": "all",           // "free" | "premium" | "all"
  "newsletterId": "news-001",
  "fromName": "Robotica Weekly",  // optional
  "testMode": false,       // Set true for test
  "testEmail": "test@example.com" // Required if testMode=true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Newsletter sent successfully to 150 subscribers",
  "stats": {
    "totalRecipients": 150,
    "sent": 150,
    "failed": 0,
    "testMode": false
  }
}
```

### POST /api/subscribers

Add a new subscriber.

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "free",          // "free" | "premium"
  "source": "landing-page", // UTM tracking
  "preferences": {
    "dailyDigest": true,
    "weeklySummary": true,
    "marketingEmails": true
  }
}
```

### GET /api/subscribers

List subscriber stats (requires API key).

**Headers:**
```
Authorization: Bearer {API_KEY}
```

**Query Params:**
- `tier` - free | premium | all (default: all)
- `status` - active | unsubscribed | bounced | all (default: active)
- `limit` - 1-1000 (default: 100)
- `offset` - >= 0 (default: 0)

### DELETE /api/subscribers

Unsubscribe an email.

**Body:**
```json
{
  "email": "user@example.com"
}
```

### GET /api/unsubscribe?email=user@example.com

Unsubscribe via link (for email templates). Redirects to confirmation page.

## Database Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{"dailyDigest": true, "weeklySummary": true, "marketingEmails": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  email_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_tier ON subscribers(tier);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_email TEXT NOT NULL,
  newsletter_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  metadata JSONB
);

CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_email);
CREATE INDEX idx_email_logs_newsletter ON email_logs(newsletter_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npm run type-check

# Build
npm run build
```

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

## Security Best Practices

1. **API Key:** Use a strong, random API key (min 32 chars)
2. **CORS:** Configure CORS in `next.config.js` if needed
3. **Rate Limiting:** Built-in batch processing with 1s delays
4. **RLS:** Row Level Security enabled on Supabase tables
5. **Service Role:** Only use service role key server-side
6. **Email Validation:** All emails validated with Zod

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [] // Validation errors (if applicable)
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created (new subscriber)
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found
- `409` - Conflict (already subscribed)
- `500` - Internal Server Error

## Code Quality

- ✅ TypeScript strict mode
- ✅ Zod schema validation
- ✅ Comprehensive error handling
- ✅ Detailed JSDoc comments
- ✅ Modular architecture
- ✅ Security-first design

---

Built with ❤️ by Marty - Coding Best Practices Enforcer
