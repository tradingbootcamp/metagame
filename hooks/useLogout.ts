'use client'

import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { logout } from '@/app/actions/auth/logout'
import { getQueryPersister } from '@/app/providers/queryPersister'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (redirectTo: string = '/') => {
    try {
      setIsLoggingOut(true)

      // Call server action to logout
      await logout(redirectTo)
    } catch (error) {
      console.error('Logout failed:', error)
      router.push(redirectTo)
    } finally {
      // Drop the cache whether or not the server call succeeded. `clear()` and
      // `removeClient()` both matter: invalidateQueries only marks queries
      // stale, and the persisted copy in localStorage outlives the tab.
      queryClient.clear()
      await getQueryPersister().removeClient()

      // Reset the logging out state after a small delay to ensure UI updates
      setTimeout(() => setIsLoggingOut(false), 100)
    }
  }

  return { handleLogout, isLoggingOut }
}
