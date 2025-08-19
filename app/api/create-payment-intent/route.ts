import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '../../../lib/stripe';
import { getTicketType } from '../../../config/tickets';
import { validateCouponForPurchase } from '../../../lib/coupons';
import { paymentIntentSchema } from '../../../lib/schemas/ticket';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = paymentIntentSchema.parse(body);
    const { ticketTypeId, name, email, discordHandle, couponCode } = validatedData;

    // Get ticket type and validate
    const ticketType = getTicketType(ticketTypeId);
    if (!ticketType) {
      return NextResponse.json(
        { error: 'Invalid ticket type' },
        { status: 400 }
      );
    }

    // Convert ticket price from dollars to cents for Stripe
    const originalPriceInCents = ticketType.price * 100;

    // Validate coupon if provided
    let coupon = null;
    let finalPriceInCents = originalPriceInCents;
    if (couponCode && couponCode.trim()) {
      const validationResult = await validateCouponForPurchase(couponCode.trim(), email, ticketTypeId);
      
      if (!validationResult.valid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        );
      }
      
      coupon = validationResult.coupon;
      finalPriceInCents = validationResult.newPriceCents;
    }

    // Create payment intent
    const metadata = {
      ticketType: ticketType.title,
      customerName: name,
      customerEmail: email,
      customerDiscordHandle: discordHandle || '',
      originalPrice: originalPriceInCents.toString(),
      couponCode: coupon?.code || '',
      discountAmount: coupon ? coupon.discountAmountCents.toString() : '0',
    };
    let clientSecret: string;
    let paymentIntentId: string;
    try {
      const { clientSecret: secret, paymentIntentId: intentId } = await createPaymentIntent(
      finalPriceInCents,
      metadata
    );
    clientSecret = secret;
    paymentIntentId = intentId;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return NextResponse.json(
        { error: `Failed to create payment intent: ${error}` },
        { status: 500 }
      );
    }
    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amount: finalPriceInCents,
      originalAmount: originalPriceInCents,
      coupon: coupon ? {
        code: coupon.code,
        discountAmount: coupon.discountAmountCents,
        description: coupon.description,
      } : null,
    });
  } catch (error) {
    console.error('Error in create-payment-intent:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: error.issues?.[0]?.message || 'Invalid input data'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 