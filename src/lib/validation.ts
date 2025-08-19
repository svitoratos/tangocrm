import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email format').max(254);

// Phone validation
export const phoneSchema = z.string().optional().refine(
  (val) => !val || /^[\+]?[\d\s\-\(\)]{7,20}$/.test(val),
  'Invalid phone number format'
);

// URL validation
export const urlSchema = z.string().optional().refine(
  (val) => !val || /^https?:\/\/.+/.test(val),
  'Invalid URL format'
);

// Sanitize text input to prevent XSS
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

// Validate opportunity status
export const opportunityStatusSchema = z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost']);

// Validate opportunity type
export const opportunityTypeSchema = z.enum(['brand_deal', 'sponsorship', 'consulting', 'coaching', 'content_creation', 'other']);

// Validate niche
export const nicheSchema = z.enum(['creator', 'coach', 'podcaster', 'freelancer']);

// Validate client status
export const clientStatusSchema = z.enum(['lead', 'prospect', 'client', 'inactive']);

// Opportunity validation schema
export const opportunityCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).transform(sanitizeText),
  description: z.string().optional().transform((val) => val ? sanitizeText(val) : undefined),
  value: z.number().min(0).max(10000000),
  status: opportunityStatusSchema.optional().default('prospecting'),
  type: opportunityTypeSchema.optional().default('other'),
  niche: nicheSchema.optional().default('creator'),
  probability: z.number().min(0).max(100).optional().default(0),
  client_id: z.string().uuid().optional(),
  expected_close_date: z.string().optional(),
  actual_close_date: z.string().optional(),
  follow_up_date: z.string().optional(),
  discovery_call_date: z.string().optional(),
  scheduled_date: z.string().optional(),
  notes: z.string().optional().transform((val) => val ? sanitizeText(val) : undefined),
  tags: z.array(z.string().max(50)).optional().default([]),
  customFields: z.record(z.any()).optional().default({})
});

export const opportunityUpdateSchema = opportunityCreateSchema.extend({
  id: z.string().uuid('Invalid opportunity ID')
});

// Client validation schema
export const clientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).transform(sanitizeText),
  email: emailSchema.optional(),
  company: z.string().optional().max(200).transform((val) => val ? sanitizeText(val) : undefined),
  phone: phoneSchema,
  website: urlSchema,
  social_media: z.record(z.string()).optional(),
  notes: z.string().optional().transform((val) => val ? sanitizeText(val) : undefined),
  tags: z.array(z.string().max(50)).optional().default([]),
  status: clientStatusSchema.optional().default('lead'),
  niche: nicheSchema.optional().default('creator')
});

export const clientUpdateSchema = clientCreateSchema.extend({
  id: z.string().uuid('Invalid client ID')
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).transform(sanitizeText),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200).transform(sanitizeText),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000).transform(sanitizeText)
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}