'use server'

import { ticketsService } from '@/lib/db/tickets'
import { sendTicketConfirmationEmail } from '@/lib/email'

import { TICKET_TYPES } from '@/utils/dbUtils'

import { adminExportWrapper } from '@/app/actions/db/auth'
import { adminGetUser } from '@/app/actions/db/users'

import { DbTicketInsert } from '@/types/database/dbTypeAliases'

// Simple TypeScript types for admin function
export type AdminIssueTicketInput = {
  ticketType: (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES]
  purchaserName: string
  purchaserEmail: string
  sendEmail: boolean
  isTest: boolean
  ownerId?: string
  couponCodes?: string[]
  usdPaid?: number
  btcPaid?: number
  opennodeOrderId?: string
  stripePaymentId?: string
}

export const adminIssueTicket = adminExportWrapper(
  async (input: AdminIssueTicketInput) => {
    const {
      purchaserEmail,
      purchaserName,
      ticketType,
      sendEmail = true,
      isTest = false,
      couponCodes = [],
      usdPaid,
      btcPaid,
      opennodeOrderId,
      ownerId,
      stripePaymentId,
    } = input

    //Check that our args make sense:
    if (btcPaid && usdPaid) {
      throw new Error('Cannot specify both btcPaid and usdPaid')
    }
    if (stripePaymentId && opennodeOrderId) {
      throw new Error('Cannot specify both stripePaymentId and opennodeOrderId')
    }

    if (ownerId) {
      try {
        const {
          data: { user: owner },
          error,
        } = await adminGetUser({ id: ownerId })
        if (!owner) {
          throw error
        }
      } catch (e) {
        throw new Error(
          `Owner ID is not a valid user: ${e instanceof Error ? e.message : 'Unknown error'}`,
        )
      }
    }

    // Create a new ticket entry in database
    const ticketDbEntry: Omit<DbTicketInsert, 'ticket_code'> = {
      purchaser_email: purchaserEmail,
      is_test: isTest,
      ticket_type: ticketType,
      admin_issued: true,
      coupons_used: couponCodes,
      price_paid: usdPaid || null,
      purchaser_name: purchaserName,
      satoshis_paid: btcPaid ? btcPaid * 100_000_000 : null,
      opennode_order: opennodeOrderId || null,
      owner_id: ownerId || null,
      stripe_payment_id: stripePaymentId || null,
    }
    const dbTicket = await ticketsService.createTicket({
      ticket: ticketDbEntry,
    })

    const emailResult = sendEmail
      ? await sendTicketConfirmationEmail({
          ticketCode: dbTicket.ticket_code,
          to: purchaserEmail ?? '',
          ticketType: ticketType,
          purchaserName: purchaserName ?? '',
          isBtc: (dbTicket.satoshis_paid ?? 0) > 0,
          usdPaid: dbTicket.price_paid ?? undefined,
          btcPaid: dbTicket.satoshis_paid ?? undefined,
          paymentIntentId: stripePaymentId || undefined,
          opennodeChargeId: opennodeOrderId || undefined,
          adminIssued: true,
          forExistingUser: !!ownerId,
        })
      : null

    return { dbTicket, emailResult }
  },
)
