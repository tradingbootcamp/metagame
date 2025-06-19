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
    const envKey = `COUPON_${couponCode.trim().toUpperCase()}`;
    const couponData = process.env[envKey];
    
    console.log('Debug coupon validation:');
    console.log('Coupon code:', couponCode.trim());
    console.log('Environment key:', envKey);
    console.log('Coupon data found:', !!couponData);
    console.log('Available COUPON_ env vars:', Object.keys(process.env).filter(k => k.startsWith('COUPON_')));
    console.log('All env vars:', Object.keys(process.env));

    // Add this debug section
    console.log('=== COUPON DEBUG ===');
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
            envKey,
            couponDataFound: !!couponData,
            availableCouponVars: Object.keys(process.env).filter(k => k.startsWith('COUPON_'))
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
    console.log('Error in validate-coupon:', error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 