import sgMail from '@sendgrid/mail';

/**
 * SendGrid client configuration
 * Requires SENDGRID_API_KEY environment variable
 */

if (!process.env.SENDGRID_API_KEY) {
  console.warn('⚠️ SENDGRID_API_KEY not set. Email sending will fail.');
}

/**
 * Initialize SendGrid with API key
 */
export const sendgridClient = sgMail;

if (process.env.SENDGRID_API_KEY) {
  sendgridClient.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Email sender configuration
 */
export const EMAIL_CONFIG = {
  from: {
    email: process.env.FROM_EMAIL || 'noreply@roboticaweekly.com',
    name: process.env.FROM_NAME || 'Robotica Weekly',
  },
  replyTo: process.env.REPLY_TO_EMAIL || 'hello@roboticaweekly.com',
} as const;

/**
 * Send a single email via SendGrid
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: { email: string; name: string };
  replyTo?: string;
  trackingSettings?: {
    clickTracking?: boolean;
    openTracking?: boolean;
  };
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const msg = {
      to: options.to,
      from: options.from || EMAIL_CONFIG.from,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
      subject: options.subject,
      text: options.text || stripHtml(options.html),
      html: options.html,
      trackingSettings: {
        clickTracking: { enable: options.trackingSettings?.clickTracking ?? true },
        openTracking: { enable: options.trackingSettings?.openTracking ?? true },
      },
    };

    const [response] = await sendgridClient.send(msg);

    return {
      success: response.statusCode === 202,
      messageId: response.headers['x-message-id'] as string | undefined,
    };
  } catch (error) {
    console.error('SendGrid send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send bulk emails via SendGrid (batch sending)
 * Note: SendGrid recommends max 1000 recipients per API call
 */
export async function sendBulkEmails(options: {
  to: Array<{ email: string; name?: string; substitutions?: Record<string, string> }>;
  subject: string;
  html: string;
  text?: string;
  from?: { email: string; name: string };
  replyTo?: string;
  batchSize?: number;
}): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const { to, batchSize = 500 } = options;
  const errors: Array<{ email: string; error: string }> = [];
  let sent = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < to.length; i += batchSize) {
    const batch = to.slice(i, i + batchSize);

    try {
      const personalizations = batch.map((recipient) => ({
        to: [{ email: recipient.email, name: recipient.name }],
        substitutions: recipient.substitutions || {},
      }));

      const msg = {
        personalizations,
        from: options.from || EMAIL_CONFIG.from,
        replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
        subject: options.subject,
        text: options.text || stripHtml(options.html),
        html: options.html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      };

      const [response] = await sendgridClient.send(msg as any);

      if (response.statusCode === 202) {
        sent += batch.length;
      } else {
        failed += batch.length;
        batch.forEach((r) => errors.push({ email: r.email, error: `HTTP ${response.statusCode}` }));
      }
    } catch (error) {
      failed += batch.length;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      batch.forEach((r) => errors.push({ email: r.email, error: errorMsg }));
    }

    // Rate limiting - pause between batches
    if (i + batchSize < to.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  };
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
