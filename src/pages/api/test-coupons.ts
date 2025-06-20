import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  console.log('=== COUPON ENVIRONMENT TEST ===');
  
  const debug = {
    nodeEnv: process.env.NODE_ENV,
    hasCouponsEnvVar: !!process.env.COUPONS,
    couponsEnvVarLength: process.env.COUPONS?.length || 0,
    couponsEnvVarPreview: process.env.COUPONS?.substring(0, 100) || 'N/A',
    individualCouponVars: Object.keys(process.env).filter(k => k.startsWith('COUPON_')),
    allEnvVars: Object.keys(process.env).filter(k => k.includes('COUPON')),
    totalEnvVars: Object.keys(process.env).length,
  };
  
  console.log('Debug info:', debug);
  
  return new Response(
    JSON.stringify(debug),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}; 