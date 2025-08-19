export const getEnvVar = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    console.error(`Environment variable ${key} is not set`);
    console.error('Available process.env vars:', Object.keys(process.env).length);
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

// Export specific environment variables
export const AIRTABLE_PAT = getEnvVar('AIRTABLE_PAT');
export const AIRTABLE_BASE_ID = getEnvVar('AIRTABLE_BASE_ID');
export const AIRTABLE_TABLE_NAME = getEnvVar('AIRTABLE_TABLE_NAME');
export const STRIPE_SECRET_KEY = getEnvVar('STRIPE_SECRET_KEY');
export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');

// Helper function to get any environment variable
export const getEnvVarSafe = (key: string): string | undefined => {
  return process.env[key]; //   return env[key] || process.env[key];
}; 