import {
  DbLocation,
  DbProfile,
  DbSessionBookmark,
  DbSessionRsvp,
  DbSessionView,
} from '@/types/database/dbTypeAliases'

// Utility function to handle API errors with detailed information
const handleApiError = async (
  response: Response,
  defaultMessage: string,
): Promise<never> => {
  let errorDetails = defaultMessage
  try {
    const errorData = await response.json()
    errorDetails = errorData.message || errorData.error || errorDetails
    if (errorData.details) {
      console.error('API Error Details:', errorData.details)
    }
  } catch {
    // If we can't parse the error response, use the status text
    errorDetails = `${errorDetails}: ${response.status} ${response.statusText}`
  }
  throw new Error(errorDetails)
}

export const fetchSessions = async (): Promise<DbSessionView[]> => {
  const response = await fetch('/api/queries/sessions')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch sessions')
  }

  return (await response.json()) as DbSessionView[]
}

export const fetchLocations = async (): Promise<DbLocation[]> => {
  const response = await fetch('/api/queries/locations')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch locations')
  }

  return (await response.json()) as DbLocation[]
}

export const fetchProfiles = async (): Promise<DbProfile[]> => {
  const response = await fetch('/api/queries/profiles')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch profiles')
  }

  return (await response.json()) as DbProfile[]
}

export const fetchSessionById = async (
  sessionId: string,
): Promise<DbSessionView> => {
  const response = await fetch(`/api/queries/sessions/${sessionId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch session')
  }

  return (await response.json()) as DbSessionView
}

export const fetchCurrentUserSessionBookmarks = async (): Promise<
  DbSessionBookmark[]
> => {
  const response = await fetch('/api/queries/session-bookmarks/current')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch session bookmarks')
  }

  return (await response.json()) as DbSessionBookmark[]
}

export const fetchUserSessionBookmarks = async (
  userId: string,
): Promise<DbSessionBookmark[]> => {
  const response = await fetch(`/api/queries/session-bookmarks/${userId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch user session bookmarks')
  }

  return (await response.json()) as DbSessionBookmark[]
}

export const fetchAllSessionBookmarks = async (): Promise<
  DbSessionBookmark[]
> => {
  const response = await fetch('/api/queries/session-bookmarks')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch all session bookmarks')
  }

  return (await response.json()) as DbSessionBookmark[]
}

export const fetchCurrentUserProfile = async (): Promise<DbProfile> => {
  const response = await fetch('/api/queries/profiles/current')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch current user profile')
  }

  return (await response.json()) as DbProfile
}

export const fetchUserProfile = async (userId: string): Promise<DbProfile> => {
  const response = await fetch(`/api/queries/profiles/${userId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch user profile')
  }

  return (await response.json()) as DbProfile
}

export const fetchAllRsvps = async (): Promise<DbSessionRsvp[]> => {
  const response = await fetch('/api/queries/rsvps')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch all RSVPs')
  }

  return (await response.json()) as DbSessionRsvp[]
}

export const fetchUserRsvps = async (
  userId: string,
): Promise<DbSessionRsvp[]> => {
  const response = await fetch(`/api/queries/rsvps/${userId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch user RSVPs')
  }

  return (await response.json()) as DbSessionRsvp[]
}

// Update existing fetchCurrentUserRsvps to use the new current endpoint
export const fetchCurrentUserRsvps = async (): Promise<DbSessionRsvp[]> => {
  const response = await fetch('/api/queries/rsvps/current')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch current user RSVPs')
  }

  return (await response.json()) as DbSessionRsvp[]
}
