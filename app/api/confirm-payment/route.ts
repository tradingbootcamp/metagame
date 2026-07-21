import { createTicketRecord, formatAirtableRecord } from '../../../lib/airtable'
import { paymentConfirmationSchema } from '../../../lib/schemas/ticket'
import { stripe } from '../../../lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { apiError } from '@/lib/apiError'
import { couponsService } from '@/lib/db/coupons'
import { ticketsService } from '@/lib/db/tickets'
import { sendTicketConfirmationEmail } from '@/lib/email'

import { TICKET_TYPES_ENUM } from '@/utils/dbUtils'

import { DbTicketType } from '@/types/database/dbTypeAliases'

const asTicketType = (value: string | undefined): DbTicketType | null =>
  TICKET_TYPES_ENUM.find((type) => type === value) ?? null

const emailsMatch = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using Zod schema
    const validatedData = paymentConfirmationSchema.parse(body)
    const { paymentIntentId } = validatedData

    // Retrieve payment intent from Stripe to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ['charges'],
      },
    )
    const price = paymentIntent.amount / 100
    const success = paymentIntent.status === 'succeeded'

    if (!success) {
      return NextResponse.json({
        success: false,
        error: `Payment not succeeded. Status: ${paymentIntent.status}`,
        paymentIntentId,
      })
    }

    // The intent's metadata was written server-side at intent creation, so it —
    // not the request body — decides what ticket is minted and who gets it. The
    // body is only allowed to agree.
    const ticketType = asTicketType(paymentIntent.metadata.ticketTypeId)
    const email = paymentIntent.metadata.customerEmail
    const name = paymentIntent.metadata.customerName
    const expectedAmount = Number(paymentIntent.metadata.finalPrice)

    if (!ticketType || !email || !name || !Number.isFinite(expectedAmount)) {
      console.error(
        'Payment intent is missing purchase metadata',
        paymentIntentId,
        paymentIntent.metadata,
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Payment intent is missing purchase details',
        },
        { status: 400 },
      )
    }

    if (
      ticketType !== validatedData.ticketType ||
      !emailsMatch(email, validatedData.email)
    ) {
      console.error(
        'Confirmation request does not match payment intent metadata',
        paymentIntentId,
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Purchase details do not match the payment',
        },
        { status: 400 },
      )
    }

    if (paymentIntent.amount !== expectedAmount) {
      console.error(
        'Payment intent amount does not match the quoted price',
        paymentIntentId,
        paymentIntent.amount,
        expectedAmount,
      )
      return NextResponse.json(
        { success: false, error: 'Payment amount mismatch' },
        { status: 400 },
      )
    }

    // Confirmation is replayable (retries, double submits, a hostile caller), so
    // one payment intent must only ever produce one ticket.
    const existingTicket = await ticketsService.getTicketByStripePaymentId({
      stripePaymentId: paymentIntentId,
    })
    if (existingTicket) {
      return NextResponse.json({
        success: true,
        paymentIntentId,
        alreadyProcessed: true,
        message:
          'This payment has already been confirmed. Check your email for your ticket.',
      })
    }

    // Get the Stripe processing fee from the payment intent
    let stripeFee: number | undefined
    const expandedPaymentIntent = paymentIntent as {
      charges?: {
        data: Array<{
          fee?: number
          [key: string]: unknown
        }>
      }
    } & typeof paymentIntent

    if (
      expandedPaymentIntent.charges &&
      expandedPaymentIntent.charges.data.length > 0
    ) {
      const charge = expandedPaymentIntent.charges.data[0]
      if (charge.fee) {
        // Convert from cents to dollars
        stripeFee = charge.fee / 100
      }
    }

    // Alternative approach: Try to get the charge directly if not found in payment intent
    if (stripeFee === undefined) {
      try {
        // Get the latest charge for this payment intent
        const charges = await stripe.charges.list({
          payment_intent: paymentIntentId,
          limit: 1,
        })

        if (charges.data.length > 0) {
          const charge = charges.data[0]
          // Access fee property using bracket notation to avoid type issues
          const fee = (charge as unknown as { fee?: number }).fee
          if (fee) {
            stripeFee = fee / 100
          }
        }
      } catch (error) {
        console.log('Error retrieving charge directly:', error)
      }
    }

    // Fallback: Calculate fee if not provided by Stripe
    // Stripe's standard fee is 2.9% + $0.30 for US cards
    if (stripeFee === undefined) {
      const amountInDollars = paymentIntent.amount / 100
      // Calculate 2.9% + $0.30
      stripeFee = amountInDollars * 0.029 + 0.3
    }

    // Create Airtable record
    const airtableRecord = formatAirtableRecord({
      name,
      email,
      ticketType,
      price,
      stripePaymentId: paymentIntentId,
      success,
      stripeFee,
    })

    const airtableResult = await createTicketRecord(airtableRecord)

    const couponCode = paymentIntent.metadata.couponCode
    const supabaseTicketRecord = {
      stripe_payment_id: paymentIntentId,
      purchaser_email: email,
      purchaser_name: name,
      ticket_type: ticketType,
      price_paid: price,
      coupons_used: couponCode ? [couponCode] : [],
      is_test: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ?? false,
    }

    let createdTicket: Awaited<ReturnType<typeof ticketsService.createTicket>>
    try {
      createdTicket = await ticketsService.createTicket({
        ticket: supabaseTicketRecord,
      })
    } catch (createError) {
      // A concurrent confirmation may have won the race against the unique index
      // on stripe_payment_id; that's the idempotent case, not a failure.
      const raced = await ticketsService.getTicketByStripePaymentId({
        stripePaymentId: paymentIntentId,
      })
      if (!raced) throw createError
      return NextResponse.json({
        success: true,
        paymentIntentId,
        alreadyProcessed: true,
        message:
          'This payment has already been confirmed. Check your email for your ticket.',
      })
    }

    // Redeem the coupon only now that the payment succeeded and the ticket exists —
    // an abandoned checkout must not burn a use.
    const couponId = paymentIntent.metadata.couponId
    if (couponId) {
      try {
        const redeemed = await couponsService.redeem({ id: couponId })
        if (!redeemed) {
          console.error(
            'Coupon could not be redeemed after successful payment',
            couponId,
            paymentIntentId,
          )
        }
      } catch (couponError) {
        // The customer has already paid and holds a ticket; a bookkeeping failure
        // must not fail the purchase.
        console.error('Failed to redeem coupon:', couponError)
      }
    }

    // Send confirmation email
    try {
      await sendTicketConfirmationEmail({
        to: email,
        purchaserName: name,
        ticketType: ticketType,
        ticketCode: createdTicket.ticket_code,
        usdPaid: price,
        paymentIntentId: paymentIntentId,
        isBtc: false,
      })
    } catch (emailError) {
      // Log email error but don't fail the purchase
      console.error('Failed to send confirmation email:', emailError)
      // You might want to track this in your error monitoring service
    }

    return NextResponse.json({
      success: true,
      paymentIntentId,
      airtableRecordId: airtableResult.recordId,
      message:
        'Payment successful! Your ticket has been purchased. Check your email for confirmation.',
    })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues?.[0]?.message || 'Invalid input data',
        },
        { status: 400 },
      )
    }

    return apiError(error, 'Payment confirmation failed')
  }
}
