'use client'

import { useState } from 'react'
import { FaFlag, FaFlagCheckered } from 'react-icons/fa'

import { authedDeclareWinningTeam } from '../actions/db/sessions'

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
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    team: 'orange' | 'purple' | null
  }>({ open: false, team: null })

  const handleTeamSelect = (team: 'orange' | 'purple') => {
    setConfirmDialog({ open: true, team })
  }

  const handleConfirm = () => {
    if (confirmDialog.team) {
      authedDeclareWinningTeam({
        sessionId: sessionId,
        winningTeam: confirmDialog.team,
      })
    }
    setConfirmDialog({ open: false, team: null })
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
        onOpenChange={(open) => !open && handleCancel()}
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
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                confirmDialog.team === 'orange'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }
            >
              Confirm {confirmDialog.team?.toUpperCase()} Wins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeclareWinnerButton
