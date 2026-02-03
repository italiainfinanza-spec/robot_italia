import { z } from 'zod';

/**
 * Newsletter API Validation Schemas
 * Using Zod for runtime type safety and validation
 */

// Email validation with stricter rules
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(254, 'Email too long');

// Subscriber tier enum
export const subscriberTierSchema = z.enum(['free', 'premium', 'all']);

// Send newsletter request schema
export const sendNewsletterSchema = z.object({
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters')
    .regex(/^[^<>]*$/, 'HTML tags not allowed in subject'),
  
  htmlContent: z.string()
    .min(100, 'HTML content too short')
    .refine(
      (val) => val.includes('<html') || val.includes('<body') || val.includes('<!DOCTYPE'),
      'Content must be valid HTML'
    ),
  
  textContent: z.string()
    .min(50, 'Text content too short')
    .optional(),
  
  fromEmail: emailSchema
    .optional()
    .default('newsletter@roboticaweekly.com'),
  
  fromName: z.string()
    .min(1, 'From name required')
    .max(100, 'From name too long')
    .optional()
    .default('Robotica Weekly'),
  
  tier: subscriberTierSchema
    .default('all'),
  
  testMode: z.boolean()
    .default(false),
  
  testEmails: z.array(emailSchema)
    .max(10, 'Maximum 10 test emails allowed')
    .optional(),
  
  scheduledAt: z.string()
    .datetime('Invalid ISO datetime format')
    .optional()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      'Scheduled time must be in the future'
    ),
  
  metadata: z.object({
    newsletterId: z.string().optional(),
    edition: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

// Single email send schema (for testing)
export const sendSingleEmailSchema = z.object({
  to: emailSchema,
  subject: z.string().min(1).max(100),
  html: z.string().min(1),
  text: z.string().optional(),
  from: emailSchema.optional(),
});

// Batch send status schema
export const batchStatusSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID format'),
});

// Subscriber management schemas
export const addSubscriberSchema = z.object({
  email: emailSchema,
  tier: z.enum(['free', 'premium']).default('free'),
  source: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updateSubscriberSchema = z.object({
  email: emailSchema,
  tier: z.enum(['free', 'premium']).optional(),
  status: z.enum(['active', 'unsubscribed', 'bounced']).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

// Webhook payload schema for SendGrid events
export const sendgridWebhookSchema = z.array(z.object({
  event: z.enum(['delivered', 'open', 'click', 'bounce', 'dropped', 'spamreport', 'unsubscribe']),
  email: emailSchema,
  timestamp: z.number(),
  'smtp-id': z.string().optional(),
  category: z.array(z.string()).optional(),
  sg_event_id: z.string(),
  sg_message_id: z.string(),
  reason: z.string().optional(),
  response: z.string().optional(),
  url: z.string().url().optional(),
}));

// Export types
export type SendNewsletterRequest = z.infer<typeof sendNewsletterSchema>;
export type SendSingleEmailRequest = z.infer<typeof sendSingleEmailSchema>;
export type AddSubscriberRequest = z.infer<typeof addSubscriberSchema>;
export type UpdateSubscriberRequest = z.infer<typeof updateSubscriberSchema>;
export type SendgridWebhookPayload = z.infer<typeof sendgridWebhookSchema>;
