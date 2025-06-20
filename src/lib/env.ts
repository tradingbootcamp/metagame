// Environment variable loader for Astro
import { loadEnv } from 'vite';

// Load environment variables for local development
const env = process.env.NODE_ENV === 'development' 
  ? loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')
  : {};

export const getEnvVar = (key: string): string => {
  // Try local env first (from loadEnv), then process.env
  const value = env[key] || process.env[key];
  if (!value) {
    console.error(`Environment variable ${key} is not set`);
    console.error('Available process.env vars:', Object.keys(process.env).filter(k => k.includes('AIRTABLE') || k.includes('STRIPE')));
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

// Export specific environment variables
export const AIRTABLE_PAT = getEnvVar('AIRTABLE_PAT');
export const AIRTABLE_BASE_ID = getEnvVar('AIRTABLE_BASE_ID');
export const AIRTABLE_TABLE_NAME = getEnvVar('AIRTABLE_TABLE_NAME');
export const STRIPE_SECRET_KEY = getEnvVar('STRIPE_SECRET_KEY');
export const PUBLIC_STRIPE_PUBLISHABLE_KEY = getEnvVar('PUBLIC_STRIPE_PUBLISHABLE_KEY');
export const COUPONS = getEnvVar('COUPONS');

// Helper function to get any environment variable
export const getEnvVarSafe = (key: string): string | undefined => {
  return env[key] || process.env[key];
}; 