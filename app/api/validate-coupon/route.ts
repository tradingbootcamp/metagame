import { NextRequest, NextResponse } from 'next/server';
import { validateCouponForPurchase, ValidateCouponResult, validateCouponResultSchema } from '@/lib/coupons';
import { validateCouponBodySchema } from './reqSchema';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 5; // 5 attempts per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<ValidateCouponResult>> {
  try {
    // Basic rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        validateCouponResultSchema.parse({
          valid: false,
          error: 'Too many requests. Please try again later.'
        }),
        { status: 429 }
      );
    }

    const {success, data: bodyData, error: bodyError} = validateCouponBodySchema.safeParse(await request.json());
    if (!success) {
      return NextResponse.json(
        validateCouponResultSchema.parse({
          valid: false,
          error: `Coupon validation failed: ${bodyError?.issues[0].message}`,
          details: bodyError?.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }))
        }),
        { status: 400 }
      );
    }
    const { couponCode, ticketTypeId, userEmail } = bodyData;

    // Validate coupon using the abstracted function
    const validationResult = await validateCouponForPurchase(couponCode, userEmail, ticketTypeId);

    if (!validationResult.valid) {
      return NextResponse.json(
        validationResult,
        { status: 400 }
      );
    } 

    return NextResponse.json(
      validationResult, 
      { status: 200 });
  } catch (error) {
    console.error('Error in validate-coupon:', error);
    
    return NextResponse.json(
      validateCouponResultSchema.parse({ 
        valid: false,
        error: 'Internal server error'
      }), 
      { status: 500 }
    );
  }
} 