import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  console.log('=== ENVIRONMENT VARIABLE DEBUG ===');
  console.log('process.env keys:', Object.keys(process.env).filter(k => k.includes('STRIPE') || k.includes('AIRTABLE')));
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('PUBLIC_STRIPE_PUBLISHABLE_KEY exists:', !!process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
  
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'Environment variable debug',
    envCheck: {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublicStripeKey: !!process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripeKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      publicKeyLength: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('STRIPE') || k.includes('AIRTABLE') || k.includes('COUPON')),
      totalEnvKeys: Object.keys(process.env).length,
    },
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}; 