import type { APIRoute } from 'astro';
import { validateCoupon, applyCouponDiscount } from '../../lib/coupons';
import { getTicketType } from '../../config/tickets';

export const POST: APIRoute = async ({ request }) => {
  console.log('=== VALIDATE COUPON API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { couponCode, ticketTypeId } = body;

    if (!couponCode || !ticketTypeId) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Coupon code:', couponCode);
    console.log('Ticket type ID:', ticketTypeId);

    // Get ticket type
    const ticketType = getTicketType(ticketTypeId);
    if (!ticketType) {
      console.log('Invalid ticket type');
      return new Response(
        JSON.stringify({ error: 'Invalid ticket type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert ticket price from dollars to cents for Stripe
    const originalPriceInCents = ticketType.price * 100;

    // Debug: Check what environment variables are available
    console.log('=== ENVIRONMENT DEBUG ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('COUPON') || k.includes('STRIPE') || k.includes('AIRTABLE')));
    console.log('COUPONS env var exists:', !!process.env.COUPONS);
    console.log('COUPONS env var length:', process.env.COUPONS?.length || 0);
    console.log('Individual COUPON_ vars:', Object.keys(process.env).filter(k => k.startsWith('COUPON_')));

    // Validate coupon
    const coupon = validateCoupon(couponCode.trim());
    console.log('Coupon validation result:', coupon);
    
    if (!coupon) {
      console.log('Invalid coupon - returning error');
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Invalid coupon code',
          debug: {
            couponCode: couponCode.trim(),
            availableCouponVars: Object.keys(process.env).filter(k => k.startsWith('COUPON_')),
            hasCouponsEnvVar: !!process.env.COUPONS,
            couponsEnvVarLength: process.env.COUPONS?.length || 0,
            nodeEnv: process.env.NODE_ENV
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate discounted price (in cents)
    const discountedPriceInCents = applyCouponDiscount(originalPriceInCents, coupon);

    console.log('Coupon valid - returning success');
    return new Response(
      JSON.stringify({
        valid: true,
        coupon: {
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          description: coupon.description,
        },
        originalPrice: originalPriceInCents,
        discountedPrice: discountedPriceInCents,
        savings: originalPriceInCents - discountedPriceInCents,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-coupon:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Always return a proper JSON response, even on error
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          nodeEnv: process.env.NODE_ENV,
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('COUPON')),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 