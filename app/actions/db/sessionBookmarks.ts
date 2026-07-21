'use server'

import { currentUserWrapper } from './auth'

import { sessionBookmarkService } from '@/lib/db/sessionBookmarks'

export const currentUserBookmarkSession = currentUserWrapper(
  sessionBookmarkService.bookmarkSessionForUser,
)
export const currentUserUnbookmarkSession = currentUserWrapper(
  sessionBookmarkService.unbookmarkSessionForUser,
)
export const currentUserToggleSessionBookmark = currentUserWrapper(
  sessionBookmarkService.toggleBookmarkSessionForUser,
)

export const currentUserGetSessionBookmarks = async () =>
  currentUserWrapper(sessionBookmarkService.getUserSessionBookmarks)({})
