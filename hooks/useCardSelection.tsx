'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { currentUserSelectCardReward } from '@/app/actions/db/users'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

interface UseCardSelectionOptions {
  userId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCardSelection({
  userId,
  onSuccess,
  onError,
}: UseCardSelectionOptions) {
  const queryClient = useQueryClient()
  const profileQueryKey = ['users', 'profile', userId]

  const selectCardMutation = useMutation({
    mutationFn: currentUserSelectCardReward,
    onMutate: async ({ celestialCardId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileQueryKey })

      // Snapshot the previous profile data
      const oldData = queryClient.getQueryData<DbFullProfile>(profileQueryKey)

      // Optimistically update the celestial_card_id
      if (oldData) {
        const newData = {
          ...oldData,
          celestial_card_id: celestialCardId,
        }
        queryClient.setQueryData(profileQueryKey, newData)
      }

      return { oldData }
    },
    onSuccess: () => {
      toast.success('Card selection updated successfully!')
      onSuccess?.()
    },
    onError: (error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.oldData) {
        queryClient.setQueryData(profileQueryKey, context.oldData)
      }
      console.error('Error selecting card:', error)

      // Show specific error message from server
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to select card: ${errorMessage}`)
      onError?.(error as Error)
    },
    onSettled: () => {
      // Invalidate and refetch the profile data
      queryClient.invalidateQueries({
        queryKey: profileQueryKey,
      })
    },
  })

  return {
    selectCard: selectCardMutation.mutate,
    isSelecting: selectCardMutation.isPending,
    error: selectCardMutation.error,
  }
}
