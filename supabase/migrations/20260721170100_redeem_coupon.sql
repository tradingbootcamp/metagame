-- Atomically consume one use of a coupon.
-- Checking used_count in application code and writing back count + 1 lets
-- concurrent redemptions overwrite each other; doing the check and the increment
-- in one statement can't. Returns no rows when the coupon is disabled or spent,
-- which the caller treats as "not redeemable".
create or replace function public.redeem_coupon(coupon_id uuid)
returns setof public.coupons
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.coupons
  set used_count = used_count + 1
  where id = coupon_id
    and enabled
    and (max_uses is null or used_count < max_uses)
  returning *;
$$;
