import { TICKET_TYPES_ENUM } from "@/utils/dbUtils";
import z from "zod";

export const validateCouponBodySchema = z.object({
    couponCode: z.string("Invalid coupon code").transform((val) => val.trim().toUpperCase()),
    ticketTypeId: z.enum(TICKET_TYPES_ENUM, {
      message: `Invalid ticket type, must be one of ${TICKET_TYPES_ENUM.join(', ')}`
    }),
    userEmail: z.email("Invalid userEmail address").optional(),
  })