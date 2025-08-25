import { createServiceClient } from '@/utils/supabase/service'

export const sessionBookmarkService = {
  getUserSessionBookmarks: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_bookmarks')
      .select('*')
      .eq('user_id', userId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getAllSessionBookmarks: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('session_bookmarks').select('*')
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  bookmarkSessionForUser: async ({
    userId,
    sessionId,
  }: {
    userId: string
    sessionId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_bookmarks')
      .insert({ user_id: userId, session_id: sessionId })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  unbookmarkSessionForUser: async ({
    userId,
    sessionId,
  }: {
    userId: string
    sessionId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  toggleBookmarkSessionForUser: async ({
    userId,
    sessionId,
  }: {
    userId: string
    sessionId: string
  }) => {
    const existingBookmarks =
      await sessionBookmarkService.getUserSessionBookmarks({ userId })
    if (
      existingBookmarks.some((bookmark) => bookmark.session_id === sessionId)
    ) {
      return sessionBookmarkService.unbookmarkSessionForUser({
        userId,
        sessionId,
      })
    } else {
      return sessionBookmarkService.bookmarkSessionForUser({
        userId,
        sessionId,
      })
    }
  },
}
