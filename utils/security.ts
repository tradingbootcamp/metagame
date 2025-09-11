import { createClient } from './supabase/server'
import { createServiceClient } from './supabase/service'
import { redirect } from 'next/navigation'

export const redirectHomeIfNotAdmin = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.is_admin) {
    redirect('/')
  }
}
