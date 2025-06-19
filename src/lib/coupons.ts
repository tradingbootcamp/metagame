import { getEnvVarSafe } from './env';

export interface Coupon {
  code: string;
  discountAmount: number; // in cents
  description: string;
  valid: boolean;
}

// Server-side only coupon validation
export const validateCoupon = (code: string): Coupon | null => {
  // Only run on server-side
  if (typeof process === 'undefined') {
    return null;
  }

  const envKey = `COUPON_${code.toUpperCase()}`;
  const couponData = getEnvVarSafe(envKey);
  
  if (!couponData) {
    return null;
  }

  try {
    const parsed = JSON.parse(couponData);
    return {
      code: parsed.code,
      discountAmount: parsed.discountAmount,
      description: parsed.description,
      valid: parsed.valid !== false,
    };
  } catch (error) {
    console.error(`Invalid coupon data for ${code}:`, error);
    return null;
  }
};

export const applyCouponDiscount = (originalPrice: number, coupon: Coupon): number => {
  const discountedPrice = originalPrice - coupon.discountAmount;
  return Math.max(discountedPrice, 0);
}; 