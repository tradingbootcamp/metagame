'use client'

import { useEffect, useState } from 'react'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 60 * 24, // 1 day
            refetchOnWindowFocus: false,
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
        {children}
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
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  )
}
