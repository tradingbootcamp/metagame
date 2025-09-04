'use server'

import { couponsService } from '@/lib/db/coupons'

import { adminExportWrapper } from '@/app/actions/db/auth'

import { DbCoupon, DbCouponEmail } from '@/types/database/dbTypeAliases'

export type AdminUpsertCouponInput = {
  couponCode: string
  description?: string | null
  discountAmountCents: number
  emailFor: boolean
  enabled: boolean
  maxUses?: number | null
}

export const adminGetCouponByCode = adminExportWrapper(
  async ({ couponCode }: { couponCode: string }) => {
    return await couponsService.getByCode({ couponCode })
  },
)

export const adminUpsertCoupon = adminExportWrapper(
  async (input: AdminUpsertCouponInput): Promise<DbCoupon> => {
    const {
      couponCode,
      description = null,
      discountAmountCents,
      emailFor,
      enabled,
      maxUses = null,
    } = input

    const result = await couponsService.upsertByCode({
      coupon: {
        coupon_code: couponCode.trim(),
        description,
        discount_amount_cents: discountAmountCents,
        email_for: emailFor,
        enabled,
        max_uses: maxUses,
      },
    })
    return result
  },
)

export const adminListCouponEmails = adminExportWrapper(
  async ({ couponId }: { couponId: string }): Promise<DbCouponEmail[]> => {
    return await couponsService.listEmailAuthorizations({ couponId })
  },
)

export const adminAddOrUpdateCouponEmail = adminExportWrapper(
  async ({
    couponId,
    email,
    maxUses,
  }: {
    couponId: string
    email: string
    maxUses: number
  }): Promise<DbCouponEmail> => {
    return await couponsService.addOrUpdateEmailAuthorization({
      couponId,
      email: email.trim().toLowerCase(),
      maxUses,
    })
  },
)

export const adminRemoveCouponEmail = adminExportWrapper(
  async ({ couponId, email }: { couponId: string; email: string }) => {
    await couponsService.removeEmailAuthorization({
      couponId,
      email: email.trim().toLowerCase(),
    })
  },
)
