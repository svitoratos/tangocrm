/**
 * Environment variable validation utility
 * Ensures all required environment variables are present at runtime
 */

interface EnvConfig {
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Optional environment variables
  NEXT_PUBLIC_GA_ID?: string;
  ADMIN_EMAILS?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

const requiredEnvVars: Array<keyof EnvConfig> = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 */
export function validateEnvironmentVariables(): void {
  // Skip validation during build phase
  if (process.env.NEXT_PHASE || process.env.npm_lifecycle_event === 'build') {
    return;
  }
  
  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}\n\nPlease check your .env.local file and ensure all required variables are set.`;
    throw new Error(errorMessage);
  }
  
  // Validate admin emails format if provided
  if (process.env.ADMIN_EMAILS) {
    const emails = process.env.ADMIN_EMAILS.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid admin email format: ${email}`);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ All required environment variables are present');
  }
}

/**
 * Gets a required environment variable with runtime validation
 * @param key - The environment variable key
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function getRequiredEnvVar(key: keyof EnvConfig): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param key - The environment variable key
 * @param defaultValue - The default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getOptionalEnvVar(key: keyof EnvConfig, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Note: Environment validation is available but not automatically run
// Call validateEnvironmentVariables() manually in your application startup code
// This prevents build-time issues while still providing runtime validation