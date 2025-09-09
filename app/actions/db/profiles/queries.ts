'use server'

import { createServiceClient } from '@/utils/supabase/service'

export async function getSpeakersFromProfiles() {
  const supabase = createServiceClient()
  console.log('Getting speakers from profiles')
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('opted_in_to_homepage_display', true)
    .not('homepage_order', 'is', null)
    .order('homepage_order', { ascending: true })

  if (error) {
    console.error('Error fetching speakers from profiles:', error)
    throw new Error(`Failed to fetch speakers: ${error.message}`)
  }

  const dataToReturn = data.map((profile) => {
    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      profile_pictures_url: profile.profile_pictures_url,
      site_name: profile.site_name,
      site_url: profile.site_url,
      site_name_2: profile.site_name_2,
      site_url_2: profile.site_url_2,
      player_id: profile.player_id,
    }
  })

  return dataToReturn
}
