import { createServiceClient } from '@/utils/supabase/service'

export const locationsService = {
  getAllLocations: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('locations').select('*')
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  getAllMegagameLocations: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('megagame_locations')
      .select('*')
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  getOrderedScheduleLocations: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('display_in_schedule', true)
      .order('schedule_display_order', { ascending: true })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
}
