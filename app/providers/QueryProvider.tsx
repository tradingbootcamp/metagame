'use client'

import { useState } from 'react'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

export default function QueryProvider({
  children,
  state,
}: {
  children: React.ReactNode
  state: DehydratedState
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes default
            gcTime: 1000 * 60 * 60 * 24, // 1 day
            refetchOnWindowFocus: false,
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  )

  // The provider's element type must never change: swapping QueryClientProvider
  // for PersistQueryClientProvider after mount made React discard and remount
  // the entire app subtree right after hydration. createAsyncStoragePersister
  // documents `storage: undefined` for SSR (it returns a no-op persister), and
  // restore only runs in a client mount effect, so this is hydration-safe.
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: typeof window === 'undefined' ? undefined : window.localStorage,
    }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  )
}
