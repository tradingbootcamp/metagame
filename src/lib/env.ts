// Environment variable loader for Astro
import { loadEnv } from 'vite';

// Load environment variables
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

export const getEnvVar = (key: string): string => {
  const value = env[key] || process.env[key];
  console.log(`Loading env var ${key}:`, value ? 'SET' : 'NOT SET');
  if (!value) {
    console.error(`Environment variable ${key} is not set`);
    console.error('Available env vars:', Object.keys(env));
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