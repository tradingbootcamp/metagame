import { createServiceClient } from "@/utils/supabase/service"

export const couponsService = {
  getByCode: async ({ couponCode }: { couponCode: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('coupons').select('*').eq('coupon_code', couponCode).maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getByEmailForUser: async ({ email }: { email: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('coupons').select('*').eq('email_for', email)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getAll: async ({ enabledOnly }: { enabledOnly: boolean} = {enabledOnly: true}) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('coupons').select('*').eq('enabled', enabledOnly)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
}