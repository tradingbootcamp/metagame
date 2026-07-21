import { randomInt } from 'crypto'

import { createServiceClient } from '@/utils/supabase/service'

import { DbFullTicket, DbTicketInsert } from '@/types/database/dbTypeAliases'

const ticketsSelectIncludes = `
  *,
  owner:profiles!tickets_owner_id_fkey(*, celestial_card:celestial_cards!profiles_celestial_card_id_fkey(*))
`

const TICKET_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const TICKET_CODE_LENGTH = 8

/** Ticket codes are bearer credentials for claiming a ticket, so they must not
 * be guessable from other codes — Math.random() is not a CSPRNG. */
const generateTicketCode = () =>
  Array.from({ length: TICKET_CODE_LENGTH }, () =>
    TICKET_CODE_ALPHABET.charAt(randomInt(TICKET_CODE_ALPHABET.length)),
  ).join('')
export const ticketsService = {
  getAllTickets: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getAllFullTickets: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select(ticketsSelectIncludes)
      .order('created_at', { ascending: true })
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies DbFullTicket[]
  },
  createTicket: async ({
    ticket,
  }: {
    ticket: Omit<DbTicketInsert, 'ticket_code'>
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...ticket,
        owner_id: ticket.owner_id || null,
        ticket_code: generateTicketCode(),
      })
      .select()
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getTicketByCode: async ({ code }: { code: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_code', code)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getTicketByStripePaymentId: async ({
    stripePaymentId,
  }: {
    stripePaymentId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('stripe_payment_id', stripePaymentId)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getTicketByOpennodeOrder: async ({ orderId }: { orderId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('opennode_order', orderId)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getTicketsByPurchaserEmail: async ({ email }: { email: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('purchaser_email', email)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getTicketsByOwnerId: async ({ ownerId }: { ownerId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('owner_id', ownerId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  updateTicketOwner: async ({
    ticketCode,
    ownerId,
  }: {
    ticketCode: string
    ownerId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tickets')
      .update({ owner_id: ownerId })
      .eq('ticket_code', ticketCode)
      .select()
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
}
