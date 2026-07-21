import { z } from 'zod'

import { TICKET_TYPES_ENUM } from '@/utils/dbUtils'

export const ticketPurchaseDetailsSchema = z.object({
  ticketType: z.enum(TICKET_TYPES_ENUM),
  /** Only honored for admins (the admin charge tool). For everyone else the
   * server decides, so a real order can't disguise itself as test data. */
  isTest: z.boolean().optional(),
  purchaserEmail: z.email(),
  purchaserName: z.string().optional(),
})

export type TicketPurchaseDetails = z.infer<typeof ticketPurchaseDetailsSchema>

export const opennodeChargeSchema = z.object({
  /** Only honored for the sliding-scale ticket type (or admins). Every other
   * ticket type is charged its configured price, derived server-side. */
  amountBtc: z.number().positive().optional(),
  ticketDetails: ticketPurchaseDetailsSchema,
})

export type OpennodeChargeInput = z.infer<typeof opennodeChargeSchema>

export const opennodeWebhookSchema = z.object({
  id: z.string(), //charge uuid
  callback_url: z.string(),
  success_url: z.string(),
  status: z.string(),
  order_id: z.string(),
  description: z.string(),
  price: z.number(),
  fee: z.number(),
  auto_settle: z.boolean(),
  hashed_order: z.string(),
})

export type OpennodeWebhookInput = z.infer<typeof opennodeWebhookSchema>
