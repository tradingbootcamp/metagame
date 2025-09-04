'use client'

import { useEffect, useState } from 'react'

import { CONFERENCE_DAYS } from './Schedule'
import { userEditSession } from './actions'
import {
  adminFetchFullProfiles,
  fetchLocations,
  fetchSessionById,
} from './queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { dateUtils } from '@/utils/dateUtils'
import {
  SESSION_AGES,
  SESSION_CATEGORIES_ENUM,
  getAgesDisplayText,
} from '@/utils/dbUtils'

import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  adminAddSession,
  adminDeleteSession,
  adminUpdateSession,
} from '@/app/actions/db/sessions'

import { useUser } from '@/hooks/dbQueries'
import {
  DbFullSession,
  DbSessionAges,
  DbSessionCategory,
} from '@/types/database/dbTypeAliases'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  defaultDay?: string
  prefillData?: {
    startTime: string
    locationId: string
  } | null
  existingSessionId?: string | null
  canEdit?: boolean
}

type FormData = {
  title: string
  description: string
  day: string
  startTime: string
  endTime: string
  minCapacity: number | null
  maxCapacity: number | null
  locationId: string | null
  ages: DbSessionAges
  host_1_id: string | null
  host_2_id: string | null
  host_3_id: string | null
  megagame: boolean
  category: DbSessionCategory | null
}
export function AddEventModal({
  isOpen,
  onClose,
  defaultDay,
  prefillData,
  existingSessionId,
  canEdit = false,
}: AddEventModalProps) {
  const queryClient = useQueryClient()
  const { currentUserProfile } = useUser()
  const isEditMode = !!existingSessionId
  const defaultFormData = {
    title: '',
    description: '',
    day: defaultDay || CONFERENCE_DAYS[0].date.getDate().toString(),
    startTime: '09:00',
    endTime: '09:30',
    minCapacity: null,
    maxCapacity: null,
    locationId: null,
    ages: SESSION_AGES.ALL,
    host_1_id: null,
    host_2_id: null,
    host_3_id: null,
    megagame: false,
    category: null,
  }
  const {
    data: profiles,
    isLoading: profilesLoading,
    error: profilesError,
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: adminFetchFullProfiles,
    enabled: !!currentUserProfile?.is_admin && !!isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    enabled: !!isOpen,
    staleTime: 1000 * 60 * 5,
  })

  // Fetch the existing session data if in edit mode
  const { data: existingSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['sessions', existingSessionId],
    queryFn: () => fetchSessionById(existingSessionId!),
    enabled: !!isEditMode && !!existingSessionId && !!isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const [formData, setFormData] = useState<FormData>(defaultFormData)
  // Initialize form data when existingSession changes
  useEffect(() => {
    if (existingSession && !sessionLoading) {
      const startDatePSTParts = dateUtils.getPacificParts(
        new Date(existingSession.start_time!),
      )
      const endDatePSTParts = existingSession.end_time
        ? dateUtils.getPacificParts(new Date(existingSession.end_time))
        : null

      // Check if the host IDs exist in the profiles before setting them
      const validateHostId = (hostId: string | null) => {
        if (!hostId) return null
        // If profiles aren't loaded (e.g., non-admin view), keep the existing host id as-is
        if (!profiles) return hostId
        const profileExists = profiles.some((p) => p.id === hostId)
        return profileExists ? hostId : null
      }

      const newFormData = {
        title: existingSession.title || '',
        description: existingSession.description || '',
        day: startDatePSTParts.day,
        startTime: startDatePSTParts.hour + ':' + startDatePSTParts.minute,
        endTime: endDatePSTParts
          ? endDatePSTParts.hour + ':' + endDatePSTParts.minute
          : '10:00',
        minCapacity: existingSession.min_capacity,
        maxCapacity: existingSession.max_capacity,
        locationId: existingSession.location_id || null,
        ages: existingSession.ages || SESSION_AGES.ALL,
        host_1_id: validateHostId(existingSession.host_1_id),
        host_2_id: validateHostId(existingSession.host_2_id),
        host_3_id: validateHostId(existingSession.host_3_id),
        megagame: existingSession.megagame || false,
        category: existingSession.category || null,
      }
      setFormData(newFormData)
    } else if (prefillData) {
      // The prefillData.startTime is already the exact time of the slot (e.g., "14:30")
      // End time should be 30 minutes later (next half-hour slot)
      const [startHour, startMinute] = prefillData.startTime
        .split(':')
        .map(Number)
      let endHour = startHour
      let endMinute = startMinute + 30

      // Handle hour rollover
      if (endMinute >= 60) {
        endHour += 1
        endMinute = 0
      }

      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

      setFormData({
        ...defaultFormData,
        startTime: prefillData.startTime,
        endTime: endTime,
        locationId: prefillData.locationId || '',
      })
    } else {
      // Reset to defaults
      setFormData({
        ...defaultFormData,
      })
    }
  }, [
    existingSession,
    sessionLoading,
    isEditMode,
    defaultDay,
    prefillData,
    profiles,
  ])
  // Bump up hosts when an earlier host is cleared
  useEffect(() => {
    if (!formData.host_1_id && !formData.host_2_id && !formData.host_3_id)
      return
    if (!formData.host_1_id) {
      setFormData((prev) => ({
        ...prev,
        host_1_id: prev.host_2_id,
        host_2_id: prev.host_3_id,
        host_3_id: null,
      }))
    }
  }, [formData.host_1_id])

  useEffect(() => {
    if (!formData.host_2_id) {
      setFormData((prev) => ({
        ...prev,
        host_2_id: prev.host_3_id,
        host_3_id: null,
      }))
    }
  }, [formData.host_2_id])

  const addEventMutation = useMutation({
    mutationFn: adminAddSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Event created successfully!')
      onClose()
      // Reset form
      setFormData({
        ...defaultFormData,
      })
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`)
    },
  })

  const userEditSessionMutation = useMutation({
    mutationFn: userEditSession,
    onMutate: (data) => {
      const oldData = queryClient.getQueryData<DbFullSession[]>(['sessions'])
      if (!oldData) return { oldData: oldData }
      queryClient.setQueryData<DbFullSession[]>(['sessions'], (old) => {
        if (!old) return old
        return old.map((session: DbFullSession) =>
          session.id === data.sessionId
            ? { ...session, ...data.sessionUpdate }
            : session,
        )
      })
      return { oldData }
    },
    onError: (error, variables, context) => {
      if (context?.oldData) {
        queryClient.setQueryData(['sessions'], context.oldData)
      }
      toast.error(`Failed to update event: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Event updated successfully!')
      onClose()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const adminUpdateEventMutation = useMutation({
    mutationFn: adminUpdateSession,
    onSuccess: () => {
      toast.success('Event updated successfully!')
      onClose()
    },
    onMutate: (data) => {
      // Optimistically update the session in the cache
      const oldData = queryClient.getQueryData<DbFullSession[]>(['sessions'])
      if (!oldData) return { oldData: oldData }
      queryClient.setQueryData<DbFullSession[]>(['sessions'], (old) => {
        if (!old) return old
        return old.map((session) =>
          session.id === data.sessionId
            ? { ...session, ...data.payload }
            : session,
        )
      })

      // Return context for rollback
      return { oldData }
    },
    onError: (error, variables, context) => {
      // Rollback to previous state on error
      if (context?.oldData) {
        queryClient.setQueryData<DbFullSession[]>(['sessions'], context.oldData)
      }
      toast.error(`Failed to update event: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: adminDeleteSession,
    onMutate: (data) => {
      const oldData = queryClient.getQueryData<DbFullSession[]>(['sessions'])
      if (!oldData) return { oldData: oldData }
      queryClient.setQueryData<DbFullSession[]>(['sessions'], (old) => {
        if (!old) return old
        return old.filter((session) => session.id !== data.sessionId)
      })
      return { oldData }
    },
    onError: (error, variables, context) => {
      if (context?.oldData) {
        queryClient.setQueryData<DbFullSession[]>(['sessions'], context.oldData)
      }
      toast.error(`Failed to delete event: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Event deleted successfully!')
      onClose()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate times
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time')
      return
    }

    if (
      formData.minCapacity &&
      formData.maxCapacity &&
      formData.minCapacity > formData.maxCapacity
    ) {
      toast.error('Minimum capacity cannot be greater than maximum capacity')
      return
    }

    // Validate host selection
    if (!formData.host_1_id) {
      toast.error('Please select a host for the event')
      return
    }

    const startDateTime = dateUtils.dateFromParts({
      year: 2025,
      month: 9,
      day: formData.day,
      time: formData.startTime,
    })
    const endDateTime = dateUtils.dateFromParts({
      year: 2025,
      month: 9,
      day: formData.day,
      time: formData.endTime,
    })
    const payload = {
      title: formData.title,
      description: formData.description || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      min_capacity: formData.minCapacity,
      max_capacity: formData.maxCapacity,
      location_id: formData.locationId,
      host_1_id: formData.host_1_id,
      host_2_id: formData.host_2_id,
      host_3_id: formData.host_3_id,
      ages: formData.ages,
      megagame: formData.megagame,
      category: formData.category,
    }

    if (isEditMode && existingSessionId) {
      if (currentUserProfile?.is_admin) {
        adminUpdateEventMutation.mutate({
          sessionId: existingSessionId,
          payload,
        })
      } else if (canEdit) {
        userEditSessionMutation.mutate({
          sessionId: existingSessionId,
          sessionUpdate: payload,
        })
      } else {
        toast.error("You don't have permission to edit this event")
        return
      }
    } else {
      addEventMutation.mutate(payload)
    }
  }

  const handleDelete = () => {
    if (!existingSessionId) return

    if (
      confirm(
        'Are you sure you want to delete this event? This action cannot be undone.',
      )
    ) {
      deleteSessionMutation.mutate({ sessionId: existingSessionId })
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target

    // Handle number fields
    if (name === 'minCapacity' || name === 'maxCapacity') {
      const numValue = value === '' ? null : parseInt(value)
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const hostSelectOptions = () => {
    if (!currentUserProfile?.is_admin) {
      console.log('non-admin')
      return (
        <SelectItem value="read-only" disabled>
          Hosts are read-only for non-admins
        </SelectItem>
      )
    }
    if (profilesLoading) {
      return (
        <SelectItem value="loading" disabled>
          Loading profiles...
        </SelectItem>
      )
    }
    if (profilesError && currentUserProfile?.is_admin) {
      return (
        <SelectItem value="error" disabled>
          Error loading profiles: {profilesError.message}
        </SelectItem>
      )
    }
    if (profiles && profiles.length === 0) {
      return (
        <SelectItem value="empty" disabled>
          No profiles found
        </SelectItem>
      )
    }
    return profiles?.map((profile) => {
      return (
        <SelectItem key={profile.id} value={profile.id}>
          {profile.first_name
            ? `${profile.first_name} ${profile.last_name ?? ''} - ${profile.email || profile.id}`
            : profile.email || profile.id}
        </SelectItem>
      )
    })
  }
  if (!isOpen) return null

  // Show loading state while fetching session data in edit mode
  if (isEditMode && sessionLoading) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="rounded-none border-none bg-transparent p-0 shadow-none"
        >
          <DialogTitle className="sr-only">Loading event data...</DialogTitle>
          <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 shadow-lg">
            <div className="text-center">
              <div className="mb-2 text-lg font-semibold">
                Loading event data...
              </div>
              <div className="text-sm text-gray-400">
                Please wait while we fetch the event details.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="rounded-none border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">
          {isEditMode ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-dark-400 p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold">
            {isEditMode ? 'Edit Event' : 'Add New Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="flex w-full justify-between">
              <div>
                <label htmlFor="day" className="mb-1 block text-sm font-medium">
                  Day <span className="text-red-500">*</span>
                </label>
                <Select
                  name="day"
                  required
                  value={formData.day}
                  disabled={!currentUserProfile?.is_admin}
                  onValueChange={(value) => {
                    if (!value) {
                      return
                    }
                    setFormData((prev) => ({ ...prev, day: value }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {CONFERENCE_DAYS.map((day) => (
                      <SelectItem
                        key={day.date.getDate().toString()}
                        value={day.date.getDate().toString()}
                      >
                        {day.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="locationId"
                  className="mb-1 block text-sm font-medium"
                >
                  Location
                </label>
                <Select
                  name="locationId"
                  value={formData.locationId || ''}
                  disabled={!currentUserProfile?.is_admin}
                  onValueChange={(value) => {
                    if (!value) {
                      return
                    }
                    setFormData((prev) => ({
                      ...prev,
                      locationId: value === 'none' ? null : value,
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    <SelectItem value="none">No specific location</SelectItem>
                    {locationsLoading && (
                      <SelectItem value="loading" disabled>
                        Loading locations...
                      </SelectItem>
                    )}
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-1 block text-sm font-medium"
                >
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  required
                  disabled={!currentUserProfile?.is_admin}
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full rounded border p-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="mb-1 block text-sm font-medium"
                >
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  required
                  disabled={!currentUserProfile?.is_admin}
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full rounded border p-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Host 1 - Required */}
            {currentUserProfile?.is_admin && (
              <div>
                <div className="flex gap-2">
                  <label
                    htmlFor="host_1_id"
                    className="mb-1 block text-sm font-medium"
                  >
                    Host 1 <span className="text-red-500">*</span>
                  </label>
                  {formData.host_1_id && (
                    <XIcon
                      className="size-4 text-red-500"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, host_1_id: null }))
                      }
                    />
                  )}
                </div>
                <Select
                  name="host_1_id"
                  value={formData.host_1_id || ''}
                  disabled={!currentUserProfile?.is_admin}
                  onValueChange={(value) => {
                    if (!value) return
                    setFormData((prev) => {
                      return { ...prev, host_1_id: value }
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a host" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {hostSelectOptions()}
                  </SelectContent>
                </Select>
                {profilesError && (
                  <p className="mt-1 text-xs text-red-400">
                    Error: {profilesError.message}
                  </p>
                )}
              </div>
            )}

            {/* Host 2 - Optional, only show if Host 1 is selected */}
            {formData.host_1_id && currentUserProfile?.is_admin && (
              <div>
                <div className="flex gap-2">
                  <label
                    htmlFor="host_2_id"
                    className="mb-1 block text-sm font-medium"
                  >
                    Host 2 <span className="text-gray-400">(Optional)</span>
                  </label>
                  {formData.host_2_id && (
                    <XIcon
                      className="size-4 text-red-500"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, host_2_id: null }))
                      }
                    />
                  )}
                </div>
                <Select
                  name="host_2_id"
                  value={formData.host_2_id || ''}
                  disabled={!currentUserProfile?.is_admin}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      host_2_id: value === 'none' ? null : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a second host" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    <SelectItem value="none">No second host</SelectItem>
                    {hostSelectOptions()}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Host 3 - Optional, only show if Host 2 is selected */}
            {formData.host_1_id &&
              formData.host_2_id &&
              currentUserProfile?.is_admin && (
                <div>
                  <div className="flex gap-2">
                    <label
                      htmlFor="host_3_id"
                      className="mb-1 block text-sm font-medium"
                    >
                      Host 3 <span className="text-gray-400">(Optional)</span>
                    </label>
                    {formData.host_3_id && (
                      <XIcon
                        className="size-4 text-red-500"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, host_3_id: null }))
                        }
                      />
                    )}
                  </div>
                  <Select
                    name="host_3_id"
                    value={formData.host_3_id || ''}
                    disabled={!currentUserProfile?.is_admin}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        host_3_id: value === 'none' ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a third host" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      <SelectItem value="none">No third host</SelectItem>
                      {hostSelectOptions()}
                    </SelectContent>
                  </Select>
                </div>
              )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="minCapacity"
                  className="mb-1 block text-sm font-medium"
                >
                  Min Capacity
                </label>
                <input
                  id="minCapacity"
                  name="minCapacity"
                  type="number"
                  min="0"
                  value={formData.minCapacity || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div>
                <label
                  htmlFor="maxCapacity"
                  className="mb-1 block text-sm font-medium"
                >
                  Max Capacity
                </label>
                <input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  min="0"
                  value={formData.maxCapacity || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div>
                <label
                  htmlFor="ages"
                  className="mb-1 block text-sm font-medium"
                >
                  Ages
                </label>
                <Select
                  value={formData.ages}
                  onValueChange={(value: DbSessionAges) =>
                    setFormData((prev) => ({ ...prev, ages: value }))
                  }
                  name="ages"
                >
                  <SelectTrigger id="ages" className="w-full">
                    <SelectValue placeholder="Select an age" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {Object.values(SESSION_AGES).map((age) => (
                      <SelectItem key={age} value={age}>
                        {getAgesDisplayText(age)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex w-full justify-between">
              <div className="flex flex-col items-start">
                <Label
                  htmlFor="category"
                  className="mb-1 block text-sm font-medium"
                >
                  Category
                </Label>
                <Select
                  name="category"
                  value={formData.category || ''}
                  onValueChange={(value) => {
                    if (!value) return
                    setFormData((prev) => ({
                      ...prev,
                      category: value as DbSessionCategory,
                    }))
                  }}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {Object.values(SESSION_CATEGORIES_ENUM).map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="capitalize"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentUserProfile?.is_admin && (
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="megagame"
                    className="mb-1 block text-sm font-medium"
                  >
                    Megagame
                  </Label>
                  <Checkbox
                    id="megagame"
                    checked={formData.megagame}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, megagame: !!checked }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={
                  addEventMutation.isPending ||
                  adminUpdateEventMutation.isPending
                }
                className="flex-1 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addEventMutation.isPending ||
                adminUpdateEventMutation.isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update Event'
                    : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>

            {isEditMode && currentUserProfile?.is_admin && (
              <div className="border-t border-gray-600 pt-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={
                    !currentUserProfile?.is_admin ||
                    deleteSessionMutation.isPending
                  }
                  title={
                    !currentUserProfile?.is_admin
                      ? 'You must be an admin to delete an event'
                      : 'Delete Event'
                  }
                  className="w-full rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
                >
                  {deleteSessionMutation.isPending
                    ? 'Deleting...'
                    : 'Delete Event'}
                </button>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
