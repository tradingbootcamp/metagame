import { COUPONS } from './env';

export interface Coupon {
  code: string;
  discountAmount: number; // in cents
  description: string;
  valid: boolean;
}

// Get all coupons from environment
const getAllCoupons = (): Record<string, Coupon> => {

  try {
    console.log('COUPONS:', COUPONS);
    console.log('COUPONS length:', COUPONS.length);
    console.log('COUPONS toJSON:', JSON.parse(COUPONS));
    return JSON.parse(COUPONS);
  } catch (error) {
    console.error('Invalid coupons data:', error);
    return {};
  }
};

// Server-side only coupon validation
export const validateCoupon = (code: string): Coupon | null => {
  // Only run on server-side
  if (typeof process === 'undefined') {
    return null;
  }

  const coupons = getAllCoupons();
  
  // Search through all coupons to find one with matching code
  for (const [name, coupon] of Object.entries(coupons)) {
    if (coupon.code === code.toUpperCase() && coupon.valid !== false) {
      return {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        description: coupon.description,
        valid: true,
      };
    }
  }

  return null;
};

// Get coupon by name (for puzzle rewards)
export const getCouponByName = (name: string): Coupon | null => {
  if (typeof process === 'undefined') {
    return null;
  }

  const coupons = getAllCoupons();
  const coupon = coupons[name.toUpperCase()];
  
  if (coupon && coupon.valid !== false) {
    return {
      code: coupon.code,
      discountAmount: coupon.discountAmount,
      description: coupon.description,
      valid: true,
    };
  }

  return null;
};

export const applyCouponDiscount = (originalPrice: number, coupon: Coupon): number => {
  const discountedPrice = originalPrice - coupon.discountAmount;
  return Math.max(discountedPrice, 0);
}; 