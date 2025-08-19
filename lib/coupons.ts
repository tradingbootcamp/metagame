import { DbCoupon, DbTicketType } from '@/types/database/dbTypeAliases';
import { getTicketType } from '@/config/tickets';
import { couponsService } from './db/coupons';
import z from 'zod';

export const applyCouponDiscount = (originalPrice: number, coupon: DbCoupon): number => {
  const discountedPrice = originalPrice - coupon.discount_amount_cents;
  return Math.max(discountedPrice, 50);
}; 

export const isTicketTypeEligibleForCoupons = (ticketTypeId: DbTicketType): boolean => {
  // Only player tickets are eligible for coupons currently
  return ticketTypeId === 'player';
}; 

export const validateCouponResultSchema = z.discriminatedUnion('valid', [
    z.object({
      valid: z.literal(true),
      coupon: z.object({
        code: z.string(),
        discountAmountCents: z.number(),
        description: z.string(),
      }),
      originalPriceCents: z.number(),
      newPriceCents: z.number(),
      savingsCents: z.number(),
    }),
    z.object({
      valid: z.literal(false),
      error: z.string(),
    })
  ]
)

export type ValidateCouponResult = z.infer<typeof validateCouponResultSchema>;
export type ValidatedCoupon = Extract<ValidateCouponResult, { valid: true }>['coupon'];
/**
 * Validates a coupon for purchase and returns pricing details
 * @param couponCode - The coupon code to validate
 * @param purchaserEmail - The email of the purchaser (optional)
 * @param ticketTypeId - The ticket type ID
 * @returns CouponValidationResult with either success details or failure error
 */
export const validateCouponForPurchase = async (
  couponCode: string,
  purchaserEmail: string | undefined,
  ticketTypeId: string
): Promise<ValidateCouponResult> => {
  try {
    // Validate coupon exists
    const coupon = await couponsService.getByCode({ couponCode });
    
    if (!coupon) {
      return validateCouponResultSchema.parse({
        valid: false,
        error: 'Invalid coupon code'
      });
    }

    // Check if the coupon is for a specific email that isn't the requesting one
    if (coupon.email_for) {
      if (!purchaserEmail) {
        return validateCouponResultSchema.parse({
          valid: false,
          error: 'Coupon is marked as for a specific email address, but no email was provided'
        });
      }
      if (coupon.email_for !== purchaserEmail) {
        return validateCouponResultSchema.parse({
          valid: false,
          error: 'Coupon is marked as for a different email address'
        });
      }
    }

    // Get ticket type
    const ticketType = getTicketType(ticketTypeId);
    if (!ticketType) {
      return validateCouponResultSchema.parse({
        valid: false,
        error: 'Invalid ticket type'
      });
    }

    // Check if this ticket type is eligible for coupons
    if (!isTicketTypeEligibleForCoupons(ticketTypeId as DbTicketType)) {
      return validateCouponResultSchema.parse({
        valid: false,
        error: 'Coupons are not available for this ticket type'
      });
    }

    const originalPriceInCents = ticketType.price * 100;
    const discountedPriceInCents = applyCouponDiscount(originalPriceInCents, coupon);

    return validateCouponResultSchema.parse({
      valid: true,
        originalPriceCents: originalPriceInCents,
        newPriceCents: discountedPriceInCents,
        savingsCents: originalPriceInCents - discountedPriceInCents,
        coupon: {
          code: coupon.coupon_code,
          discountAmountCents: coupon.discount_amount_cents,
        description: coupon.description || '',
      },
    });
  } catch (error) {
    console.error('Error validating coupon for purchase:', error);
    return validateCouponResultSchema.parse({
      valid: false,
      error: 'Unknown error'
    });
  }
}; 