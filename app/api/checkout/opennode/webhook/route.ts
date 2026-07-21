import { NextRequest, NextResponse } from 'next/server'
import { OpenNodeChargeWebhook } from 'opennode/dist/types/v1'

import { opennodeDbService } from '@/lib/db/opennode'
import { ticketsService } from '@/lib/db/tickets'
import { sendAdminErrorEmail, sendTicketConfirmationEmail } from '@/lib/email'
import { opennode } from '@/lib/opennode'

export async function POST(req: NextRequest) {
  let body: OpenNodeChargeWebhook

  try {
    const rawBody = await req.text()
    console.log('opennode webhook received body: ', rawBody)
    // Check if it looks like form data (contains = and &)
    if (rawBody.includes('=') && !rawBody.trim().startsWith('{')) {
      // Parse as URL-encoded form data
      const params = new URLSearchParams(rawBody)

      body = {
        id: params.get('id') ?? '',
        description: params.get('description') ?? '',
        amount: params.get('amount') ? parseInt(params.get('amount')!, 10) : 0,
        missing_amt: params.get('missing_amt')
          ? parseInt(params.get('missing_amt')!, 10)
          : 0,
        status: params.get('status') ?? '',
        fiat_value: params.get('fiat_value')
          ? parseFloat(params.get('fiat_value')!)
          : 0,
        source_fiat_value: params.get('source_fiat_value')
          ? parseFloat(params.get('source_fiat_value')!)
          : 0,
        currency: params.get('currency') ?? '',
        created_at: params.get('created_at')
          ? parseInt(params.get('created_at')!, 10)
          : Date.now(),
        order_id: params.get('order_id') ?? '',
        address: params.get('address') ?? '',
        expires_at: params.get('expires_at') || undefined,
        auto_settle: params.get('auto_settle') === 'true',
        hashed_order: params.get('hashed_order') ?? '',
        // Optional fields - only include if present
        ...(params.get('metadata') && {
          metadata: JSON.parse(params.get('metadata')!),
        }),
        ...(params.get('chain_invoice') && {
          chain_invoice: JSON.parse(params.get('chain_invoice')!),
        }),
        ...(params.get('transactions') && {
          transactions: JSON.parse(params.get('transactions')!),
        }),
      }
    } else {
      // Parse as JSON
      body = JSON.parse(rawBody)
    }
  } catch (error) {
    console.error('Failed to parse OpenNode webhook body:', error)
    return new NextResponse('Invalid request body', { status: 400 })
  }

  console.log('opennode webhook', body)
  // The HMAC check is what stops anyone from POSTing a forged `status: 'paid'`
  // and minting a real ticket, so the local-testing bypass must never be
  // reachable from a production deploy, whatever OPENNODE_ENV is set to.
  const skipSignatureCheck =
    process.env.NODE_ENV !== 'production' && process.env.OPENNODE_ENV === 'dev'
  const ok = skipSignatureCheck || opennode.signatureIsValid(body)
  if (!ok) {
    console.error('invalid sig on opennode webhook', body)
    return new NextResponse('invalid sig', { status: 400 })
  }

  const dbCharge = await opennodeDbService.updateChargeStatus({
    metagameOrderId: body.order_id,
    status: body.status,
    charge: body,
  })

  if (body.status === 'paid') {
    // OpenNode retries callbacks, so a ticket must only be minted once per order.
    const existingTicket = await ticketsService.getTicketByOpennodeOrder({
      orderId: dbCharge.id,
    })
    if (existingTicket) {
      console.log('opennode order already has a ticket', dbCharge.id)
      return NextResponse.json({ received: true })
    }

    // Never issue a ticket for less than the charge was created for.
    const satoshisPaid = body.amount - (body.missing_amt ?? 0)
    if (satoshisPaid < dbCharge.satoshis) {
      console.error(
        'opennode charge marked paid for less than the charge amount',
        dbCharge.id,
        satoshisPaid,
        dbCharge.satoshis,
      )
      await sendAdminErrorEmail(
        `Underpaid opennode charge marked paid; no ticket issued: ${JSON.stringify(dbCharge)}`,
      )
      return NextResponse.json({ received: true })
    }

    const newTicket = {
      opennode_order: dbCharge.id,
      ticket_type: dbCharge.ticket_type!,
      purchaser_email: dbCharge.purchaser_email,
      purchaser_name: dbCharge.purchaser_name || '',
      is_test: dbCharge.is_test,
      satoshis_paid: satoshisPaid,
    }
    await ticketsService.createTicket({ ticket: newTicket })

    if (!dbCharge.purchaser_email) {
      console.error('no purchaser email on opennode charge', dbCharge)
      await sendAdminErrorEmail(
        'no purchaser email on opennode charge: \n' + JSON.stringify(dbCharge),
      )
      return NextResponse.json({ received: true })
    }

    await sendTicketConfirmationEmail({
      to: dbCharge.purchaser_email,
      purchaserName: dbCharge.purchaser_name || '',
      ticketType: dbCharge.ticket_type!,
      ticketCode: dbCharge.id,
      isBtc: true,
      btcPaid: body.amount / 100_000_000,
      opennodeChargeId: dbCharge.id,
      adminIssued: false,
      forExistingUser: false,
      test: dbCharge.is_test,
    })
  }

  return NextResponse.json({ received: true })
}
