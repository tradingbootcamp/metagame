import { z } from 'zod'

import { TICKET_TYPES_ENUM } from '@/utils/dbUtils'

// Base ticket purchase schema with required fields
export const ticketPurchaseSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.email('Please enter a valid email address').trim(),
  couponCode: z
    .string()
    .optional()
    .transform((val) => val?.trim().toUpperCase() || null),
  ticketTypeId: z.string(),
})

// Schema for payment confirmation
export const paymentConfirmationSchema = z.object({
  paymentIntentId: z.string(),
  name: z.string().min(1),
  email: z.email(),
  ticketType: z.enum(TICKET_TYPES_ENUM),
})

// Schema for payment intent creation
export const paymentIntentSchema = z.object({
  ticketTypeId: z.enum(TICKET_TYPES_ENUM),
  name: z.string().min(1),
  email: z.email(),
  couponCode: z.string().optional(),
})

// Type exports
export type TicketPurchaseFormData = Omit<
  z.infer<typeof ticketPurchaseSchema>,
  'ticketTypeId'
>
export type TicketPurchaseData = z.infer<typeof ticketPurchaseSchema>
export type PaymentConfirmationData = z.infer<typeof paymentConfirmationSchema>
export type PaymentIntentData = z.infer<typeof paymentIntentSchema>
