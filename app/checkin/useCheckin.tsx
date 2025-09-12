import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { volunteerUpdateUserCheckin } from '@/app/actions/db/users'

export const useCheckin = () => {
  const router = useRouter()

  const updateCheckinStatus = useMutation({
    mutationFn: async ({
      userId,
      checked_in,
    }: {
      userId: string
      checked_in: boolean
    }) => {
      return await volunteerUpdateUserCheckin({ userId, checked_in })
    },
    onSuccess: (_, variables) => {
      // Refresh the page to show updated data
      router.refresh()

      const action = variables.checked_in ? 'checked in' : 'checked out'
      toast.success(`User successfully ${action}`)
    },
    onError: (error, variables) => {
      const action = variables.checked_in ? 'check in' : 'check out'
      toast.error(`Failed to ${action} user: ${error.message}`)
    },
  })

  return {
    updateCheckinStatus,
    isUpdating: updateCheckinStatus.isPending,
  }
}
