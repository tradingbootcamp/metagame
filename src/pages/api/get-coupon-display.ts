import type { APIRoute } from 'astro';
import { getCouponByName } from '../../lib/coupons';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { puzzleSolved, couponName } = body;

    // Only return coupon info if puzzle is solved
    if (!puzzleSolved) {
      return new Response(
        JSON.stringify({ error: 'Puzzle not solved' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get coupon info by name
    const coupon = getCouponByName(couponName);
    
    if (!coupon) {
      return new Response(
        JSON.stringify({ error: 'Coupon not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        name: couponName.toUpperCase(),
        code: coupon.code,
        discount: `$${(coupon.discountAmount / 100).toFixed(0)}`,
        description: coupon.description
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 