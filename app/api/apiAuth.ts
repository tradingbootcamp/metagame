import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

/** The signed-in user for an API request, or null when the caller is anonymous. */
export const getApiUser = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
