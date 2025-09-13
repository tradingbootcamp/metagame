import { createServiceClient } from '@/utils/supabase/service'

export const celestialCardsService = {
  getAllCelestialCards: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('celestial_cards').select('*')
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getCelestialCardById: async ({ id }: { id: number }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('celestial_cards')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getCelestialCardsByIds: async ({ ids }: { ids: number[] }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('celestial_cards')
      .select('*')
      .in('id', ids)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
}
