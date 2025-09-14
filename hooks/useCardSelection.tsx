'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { currentUserSelectCardReward } from '@/app/actions/db/users'

import { DbFullProfile, DbPublicProfile } from '@/types/database/dbTypeAliases'

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
  const publicProfileQueryKey = ['users', 'profile', userId, 'public']

  const selectCardMutation = useMutation({
    mutationFn: currentUserSelectCardReward,
    onMutate: async ({ celestialCardId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileQueryKey })
      await queryClient.cancelQueries({ queryKey: publicProfileQueryKey })

      // Snapshot the previous profile data
      const oldData = queryClient.getQueryData<DbFullProfile>(profileQueryKey)
      const oldPublicData = queryClient.getQueryData<DbPublicProfile>(
        publicProfileQueryKey,
      )
      // Optimistically update the celestial_card_id
      if (oldData) {
        const newData = {
          ...oldData,
          celestial_card_id: celestialCardId,
        }
        queryClient.setQueryData(profileQueryKey, newData)
        if (oldPublicData) {
          const newPublicData = {
            ...oldPublicData,
            celestial_card_id: celestialCardId,
          }
          queryClient.setQueryData(publicProfileQueryKey, newPublicData)
        }
      }

      return { oldData, oldPublicData }
    },
    onSuccess: () => {
      toast.success('Card selection updated successfully!')
      queryClient.invalidateQueries({ queryKey: profileQueryKey })
      queryClient.invalidateQueries({ queryKey: publicProfileQueryKey })
      onSuccess?.()
    },
    onError: (error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.oldData) {
        queryClient.setQueryData(profileQueryKey, context.oldData)
      }
      if (context?.oldPublicData) {
        queryClient.setQueryData(publicProfileQueryKey, context.oldPublicData)
      }
      console.error('Error selecting card:', error)

      // Show specific error message from server
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to select card: ${errorMessage}`)
      onError?.(error as Error)
    },
  })

  return {
    selectCard: selectCardMutation.mutate,
    isSelecting: selectCardMutation.isPending,
    error: selectCardMutation.error,
  }
}
