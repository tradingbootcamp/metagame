import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

/** Query keys with nothing personal in them. Everything else — `sessions` (RSVP
 * rosters), `users`/`profiles` (names, emails), `bookmarks` — is kept out of
 * localStorage entirely: SSR re-dehydrates it on every load, so persisting it
 * buys nothing and leaves the previous user's data readable at rest. */
export const PERSISTABLE_QUERY_KEYS = ['locations', 'megagame_locations']

let persister: ReturnType<typeof createAsyncStoragePersister> | undefined

/** One shared persister: the provider writes the cache through it and logout has
 * to remove the same stored client. `storage: undefined` is the documented SSR
 * no-op. */
export const getQueryPersister = () => {
  persister ??= createAsyncStoragePersister({
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
  })
  return persister
}
