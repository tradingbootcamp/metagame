'use client'

import { useEffect, useState } from 'react'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
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

  //Some bullshit to avoid hydration errors because the server doesn't have localstorage acces
  const [persister, setPersister] = useState<ReturnType<
    typeof createAsyncStoragePersister
  > | null>(null)
  useEffect(
    () =>
      setPersister(
        createAsyncStoragePersister({ storage: window.localStorage }),
      ),
    [],
  )
  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={state}>{children}</HydrationBoundary>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    )
  }
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: persister }}
    >
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  )
}
