import { createServiceClient } from '@/utils/supabase/service'

import {
  DbCouponEmail,
  DbCouponInsert,
  DbCouponUpdate,
} from '@/types/database/dbTypeAliases'

export const couponsService = {
  getByCode: async ({ couponCode }: { couponCode: string }) => {
    const supabase = createServiceClient()
    console.log()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getById: async ({ id }: { id: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getAll: async (
    { enabledOnly }: { enabledOnly: boolean } = { enabledOnly: true },
  ) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('enabled', enabledOnly)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  create: async ({ coupon }: { coupon: DbCouponInsert }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
      })
      .select('*')
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  update: async ({ id, data }: { id: string; data: DbCouponUpdate }) => {
    const supabase = createServiceClient()
    const { data: updated, error } = await supabase
      .from('coupons')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return updated
  },
  upsertByCode: async ({ coupon }: { coupon: DbCouponInsert }) => {
    const existing = await couponsService.getByCode({
      couponCode: coupon.coupon_code,
    })
    if (existing) {
      return await couponsService.update({ id: existing.id, data: coupon })
    }
    return await couponsService.create({ coupon })
  },
  /** Check all coupon email authoriation for a given email address */
  checkEmailAuthorization: async ({
    couponId,
    email,
  }: {
    couponId: string
    email: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('coupon_emails')
      .select()
      .eq('coupon_id', couponId)
      .eq('email', email)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  listEmailAuthorizations: async ({
    couponId,
  }: {
    couponId: string
  }): Promise<DbCouponEmail[]> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('coupon_emails')
      .select('*')
      .eq('coupon_id', couponId)
      .order('email', { ascending: true })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  addOrUpdateEmailAuthorization: async ({
    couponId,
    email,
    maxUses,
  }: {
    couponId: string
    email: string
    maxUses: number
  }): Promise<DbCouponEmail> => {
    const supabase = createServiceClient()
    // Try to find existing authorization
    const existing = await couponsService.checkEmailAuthorization({
      couponId,
      email,
    })
    if (existing) {
      const { data, error } = await supabase
        .from('coupon_emails')
        .update({ max_uses: maxUses })
        .eq('coupon_id', couponId)
        .eq('email', email)
        .select('*')
        .single()
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
    const { data, error } = await supabase
      .from('coupon_emails')
      .insert({ coupon_id: couponId, email, max_uses: maxUses, uses: 0 })
      .select('*')
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  removeEmailAuthorization: async ({
    couponId,
    email,
  }: {
    couponId: string
    email: string
  }) => {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('coupon_emails')
      .delete()
      .eq('coupon_id', couponId)
      .eq('email', email)
    if (error) {
      throw new Error(error.message)
    }
  },
}
