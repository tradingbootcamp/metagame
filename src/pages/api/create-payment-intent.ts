// Force ROLLUP_SKIP_NATIVE to prevent native module errors
if (!process.env.ROLLUP_SKIP_NATIVE) {
  process.env.ROLLUP_SKIP_NATIVE = 'true';
}

import type { APIRoute } from 'astro';
import { createPaymentIntent } from '../../lib/stripe';
import { getTicketType } from '../../config/tickets';
import { validateCoupon, applyCouponDiscount } from '../../lib/coupons';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { ticketTypeId, name, email, couponCode } = body;

    // Validate required fields
    if (!ticketTypeId || !name || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get ticket type and validate
    const ticketType = getTicketType(ticketTypeId);
    if (!ticketType) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticket type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert ticket price from dollars to cents for Stripe
    const originalPriceInCents = ticketType.price * 100;

    // Validate coupon if provided
    let coupon = null;
    let finalPriceInCents = originalPriceInCents;
    if (couponCode && couponCode.trim()) {
      coupon = validateCoupon(couponCode.trim());
      if (!coupon) {
        return new Response(
          JSON.stringify({ error: 'Invalid coupon code' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      finalPriceInCents = applyCouponDiscount(originalPriceInCents, coupon);
    }

    // Create payment intent
    const metadata = {
      ticketType: ticketType.title,
      customerName: name,
      customerEmail: email,
      originalPrice: originalPriceInCents.toString(),
      couponCode: coupon?.code || '',
      discountAmount: coupon ? coupon.discountAmount.toString() : '0',
    };

    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      finalPriceInCents,
      metadata
    );

    return new Response(
      JSON.stringify({
        clientSecret,
        paymentIntentId,
        amount: finalPriceInCents,
        originalAmount: originalPriceInCents,
        coupon: coupon ? {
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          description: coupon.description,
        } : null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 