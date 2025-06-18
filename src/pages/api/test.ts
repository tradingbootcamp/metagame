import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    console.log('Test API endpoint called');
    
    // Check environment variables
    const envCheck = {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasAirtablePat: !!process.env.AIRTABLE_PAT,
      hasAirtableBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasAirtableTableName: !!process.env.AIRTABLE_TABLE_NAME,
      hasPublicStripeKey: !!process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      rollupSkipNative: process.env.ROLLUP_SKIP_NATIVE,
    };
    
    console.log('Environment check:', envCheck);
    
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Test endpoint working',
        envCheck,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Test endpoint error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 