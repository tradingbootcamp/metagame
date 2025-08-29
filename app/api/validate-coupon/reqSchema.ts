import z from 'zod'

import { TICKET_TYPES_ENUM } from '@/utils/dbUtils'

export const validateCouponBodySchema = z.object({
  couponCode: z
    .string('Invalid coupon code')
    .transform((val) => val.trim().toUpperCase()),
  ticketTypeId: z.enum(TICKET_TYPES_ENUM, {
    message: `Invalid ticket type, must be one of ${TICKET_TYPES_ENUM.join(', ')}`,
  }),
  preCouponPriceUSD: z.number('Invalid price').optional(),
  preCouponPriceBTC: z.number('Invalid price').optional(),
  userEmail: z.string().optional(),
})
