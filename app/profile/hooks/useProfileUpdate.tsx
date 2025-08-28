import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ProfileFormData, profileFormSchema } from '@/lib/schemas/profile'

import { updateCurrentUserProfile } from '@/app/actions/db/users'

interface UseProfileUpdateOptions {
  currentUserId?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useProfileUpdate({
  currentUserId,
  onSuccess,
  onError,
}: UseProfileUpdateOptions = {}) {
  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUserProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      onError?.(error as Error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUserId],
      })
    },
  })

  const dismissModalMutation = useMutation({
    mutationFn: () =>
      updateCurrentUserProfile({
        data: { dismissed_info_request: true },
      }),
    onSuccess: () => {
      toast.success("You won't be prompted again")
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error dismissing modal:', error)
      toast.error('Failed to dismiss modal')
      onError?.(error as Error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUserId],
      })
    },
  })

  const updateProfile = (formData: ProfileFormData) => {
    const result = profileFormSchema.safeParse(formData)
    if (!result.success) {
      toast.error(
        <div>
          <p>Error saving profile:</p>
          <ul className="ml-4 list-disc">
            {result.error.issues.map((issue, i) => (
              <li key={i}>
                {issue.path.join('.')}: {issue.message}
              </li>
            ))}
          </ul>
        </div>,
      )
      return
    }

    updateProfileMutation.mutate({
      data: result.data,
    })
  }

  const dismissModal = () => {
    dismissModalMutation.mutate()
  }

  return {
    updateProfile,
    dismissModal,
    isUpdatingProfile: updateProfileMutation.isPending,
    isDismissingModal: dismissModalMutation.isPending,
    isLoading:
      updateProfileMutation.isPending || dismissModalMutation.isPending,
    updateError: updateProfileMutation.error,
    dismissError: dismissModalMutation.error,
  }
}
