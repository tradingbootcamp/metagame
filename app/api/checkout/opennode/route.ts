import { NextRequest, NextResponse } from 'next/server'
import { OpenNodeCharge } from 'opennode/dist/types/v1'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

import { opennodeDbService } from '@/lib/db/opennode'
import { createChargeRaw } from '@/lib/opennode'
import {
  TicketPurchaseDetails,
  opennodeChargeSchema,
} from '@/lib/schemas/opennode'

import { getHostedCheckoutUrl } from '@/utils/opennode'

import { getCurrentUserAdminStatus } from '@/app/actions/db/users'

import { getTicketType } from '@/config/tickets'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { amountBtc, ticketDetails } = opennodeChargeSchema.parse(
    await req.json(),
  )
  const metagameOrderId = uuidv4()
  const callback = `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/opennode/webhook`
  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/status/${metagameOrderId}`

  const amountSatoshis = Math.round(amountBtc * 100000000)

  const ticketType = getTicketType(ticketDetails.ticketType)
  const ticketTitle = ticketType?.title || 'Unknown'
  const ticketPriceBtc = ticketType?.priceBTC

  // If the provided bitcoin price doesn't match the ticket price, only admins can proceed otherwise throw error
  if (!ticketPriceBtc || ticketPriceBtc !== amountBtc) {
    const userIsAdmin = await getCurrentUserAdminStatus()
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Invalid ticket price' },
        { status: 400 },
      )
    }
  }

  const charge = await createChargeRaw({
    amount: amountSatoshis,
    description: `Metagame ${ticketTitle} ticket for ${ticketDetails.purchaserEmail}`,
    customer_email: ticketDetails.purchaserEmail,
    auto_settle: true,
    order_id: metagameOrderId,
    callback_url: callback,
    success_url: successUrl,
  })

  await opennodeDbService.createCharge({ charge, ticketDetails })

  // Send email to purchaser with payment link
  try {
    await sendChargeCreationEmail(charge, ticketDetails)
  } catch (error) {
    console.error('Failed to send charge creation email:', error)
    // Don't fail the request if email fails
  }

  return NextResponse.json({ charge })
}

function sendChargeCreationEmail(
  charge: OpenNodeCharge,
  ticketDetails: TicketPurchaseDetails,
) {
  const ticketTitle = getTicketType(ticketDetails.ticketType)?.title
  const amountBtc = (charge.amount / 100000000).toFixed(6)
  const hostedUrl = getHostedCheckoutUrl(charge.id)

  return resend.emails.send({
    from: 'Metagame 2025 <tickets@mail.metagame.games>',
    to: ticketDetails.purchaserEmail,
    bcc: ['team@metagame.games'],
    replyTo: ['team@metagame.games'],
    subject: 'Complete your Metagame 2025 ticket payment',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Complete your Metagame 2025 ticket payment</h1>
        
        <p>Hi ${ticketDetails.purchaserName || 'there'},</p>
        
        <p>Your Metagame 2025 ticket order has been created as an open Bitcoin transaction on OpenNode. Please complete your payment to get your ticket!</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <p><strong>Ticket Type:</strong> ${ticketTitle}</p>
          <p><strong>Amount:</strong> ₿${amountBtc}</p>
          <p><strong>Order ID:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL}/checkout/status/${charge.order_id}">${charge.order_id}</a></p>
        </div>
        
        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Complete Payment</h3>
          <p>Click the button below to complete your Bitcoin payment:</p>
          <a href="${hostedUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Payment</a>
          <p style="margin-top: 10px; font-size: 14px;">Or copy this link: <a href="${hostedUrl}">${hostedUrl}</a></p>
        </div>
        
        <p>After payment is complete, you'll receive a confirmation email with your ticket code and next steps.</p>
        
        <p>See you at Metagame 2025!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
        
        <p style="font-size: 12px; color: #666;">This is not a puzzle.</p>
      </div>
    `,
    text: `
Complete your Metagame 2025 ticket payment

Hi there,

Your Metagame 2025 ticket order has been created. Please complete your payment to secure your spot!

Order Details:
- Ticket Type: ${ticketTitle}
- Amount: ₿${amountBtc}
- Order ID: ${charge.order_id}

Complete Payment:
Click this link to complete your Bitcoin payment: ${hostedUrl}

After payment is complete, you'll receive a confirmation email with your ticket code and next steps.

See you at Metagame 2025!

This is not a puzzle.
    `.trim(),
  })
}
