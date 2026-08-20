'use client'

import { useState } from 'react'
import { FaFlag, FaFlagCheckered } from 'react-icons/fa'

import { authedDeclareWinningTeam } from '../actions/db/sessions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function DeclareWinnerButton({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    team: 'orange' | 'purple' | null
  }>({ open: false, team: null })

  // The action throws on several distinct conditions (missing session, no user,
  // not authorized, write failure); without this every one of them looked
  // exactly like success, as did success itself
  const declareWinnerMutation = useMutation({
    mutationFn: authedDeclareWinningTeam,
    onSuccess: (_result, variables) => {
      toast.success(
        `${variables.winningTeam.toUpperCase()} team declared the winner`,
      )
      setConfirmDialog({ open: false, team: null })
    },
    onError: (err) => {
      toast.error(`Failed to declare winner: ${err.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'], exact: false })
    },
  })

  const handleTeamSelect = (team: 'orange' | 'purple') => {
    setConfirmDialog({ open: true, team })
  }

  const handleConfirm = () => {
    if (!confirmDialog.team) return
    declareWinnerMutation.mutate({
      sessionId: sessionId,
      winningTeam: confirmDialog.team,
    })
  }

  const handleCancel = () => {
    setConfirmDialog({ open: false, team: null })
  }

  return (
    <>
      <Popover>
        <PopoverTrigger
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          aria-label="Declare winner"
          title="Declare winner"
        >
          <FaFlagCheckered className="size-4 text-white" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="flex w-auto gap-2 border-none p-1"
        >
          <Button
            variant="outline"
            size="icon"
            title="Declare ORANGE team as winner"
            onClick={() => handleTeamSelect('orange')}
          >
            <FaFlag className="size-4 text-orange-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Declare PURPLE team as winner"
            onClick={() => handleTeamSelect('purple')}
          >
            <FaFlag className="size-4 text-purple-500" />
          </Button>
        </PopoverContent>
      </Popover>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && !declareWinnerMutation.isPending && handleCancel()
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Winner Declaration</DialogTitle>
            <DialogDescription>
              Are you sure you want to declare the{' '}
              <span
                className={`font-bold ${
                  confirmDialog.team === 'orange'
                    ? 'text-orange-500'
                    : 'text-purple-500'
                }`}
              >
                {confirmDialog.team?.toUpperCase()}
              </span>{' '}
              team as the winner?
            </DialogDescription>
          </DialogHeader>

          {/* Big color indicator */}
          <div className="flex justify-center py-6">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full ${
                confirmDialog.team === 'orange'
                  ? 'bg-orange-500'
                  : 'bg-purple-500'
              }`}
            >
              <FaFlag className="text-4xl text-white" />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={declareWinnerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={declareWinnerMutation.isPending}
              className={
                confirmDialog.team === 'orange'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }
            >
              {declareWinnerMutation.isPending
                ? 'Declaring…'
                : `Confirm ${confirmDialog.team?.toUpperCase()} Wins`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeclareWinnerButton
