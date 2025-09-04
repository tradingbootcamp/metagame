import { validateCouponForPurchase } from '../../../lib/coupons'
import { paymentIntentSchema } from '../../../lib/schemas/ticket'
import { createPaymentIntent } from '../../../lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { couponsService } from '@/lib/db/coupons'

import { ticketTypeDetails, usdSlidingScaleMinimum } from '@/config/tickets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using Zod schema
    const validatedData = paymentIntentSchema.parse(body)
    const {
      ticketTypeId,
      name,
      email,
      couponCode,
      preCouponPriceUSD,
      expectedFinalPriceUSD,
    } = validatedData
    console.log('validatedData', validatedData)
    // Get ticket type and validate
    const ticketType = ticketTypeDetails[ticketTypeId]
    if (!ticketType) {
      return NextResponse.json(
        { error: 'Invalid ticket type' },
        { status: 400 },
      )
    }

    let originalPriceInCents: number
    if (preCouponPriceUSD && ticketTypeId ==="player") {
      if (preCouponPriceUSD < usdSlidingScaleMinimum) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
      }
      originalPriceInCents = preCouponPriceUSD * 100
    } else {
      originalPriceInCents = ticketType.priceUSD * 100
    }

    // Validate coupon if provided
    let coupon = null
    let finalPriceInCents = originalPriceInCents
    if (couponCode && couponCode.trim()) {
      const validationResult = await validateCouponForPurchase(
        couponCode.trim(),
        email,
        ticketTypeId,
        preCouponPriceUSD,
      )

      if (!validationResult.valid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 },
        )
      }

      coupon = validationResult.coupon
      finalPriceInCents = validationResult.newPriceCents
    }
    if (finalPriceInCents !== expectedFinalPriceUSD * 100) {
      console.log('finalPriceInCents', finalPriceInCents)
      console.log('expectedFinalPriceUSD', expectedFinalPriceUSD)
      return NextResponse.json(
        { error: 'Price calculation mismatch; contact us if this persists' },
        { status: 400 },
      )
    }
    // Create payment intent
    const metadata = {
      ticketType: ticketType.title,
      customerName: name,
      customerEmail: email,
      originalPrice: originalPriceInCents.toString(),
      couponCode: coupon?.code || '',
      discountAmount: coupon ? coupon.discountAmountCents.toString() : '0',
    }
    let clientSecret: string
    let paymentIntentId: string
    try {
      const { clientSecret: secret, paymentIntentId: intentId } =
        await createPaymentIntent(finalPriceInCents, metadata)
      clientSecret = secret
      paymentIntentId = intentId
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return NextResponse.json(
        { error: `Failed to create payment intent: ${error}` },
        { status: 500 },
      )
    }
    if (coupon) {
      couponsService.update({
        id: coupon.id,
        data: {
          used_count: coupon.usedCount + 1,
        },
      })
    }
    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amount: finalPriceInCents,
      originalAmount: originalPriceInCents,
      coupon: coupon
        ? {
            code: coupon.code,
            discountAmount: coupon.discountAmountCents,
            description: coupon.description,
          }
        : null,
    })
  } catch (error) {
    console.error('Error in create-payment-intent:', error)

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues?.[0]?.message || 'Invalid input data',
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
